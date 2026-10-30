// Package radsec serves RADIUS over mutually authenticated TLS (RFC 6614).
//
// The listener reuses the reviewed source's TLS material handling: the leaf
// certificate must be verifiably in date before the port opens, and a client is
// trusted only when its certificate chains to the configured CA bundle.
package radsec

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"os"
	"sync"
	"time"

	"layeh.com/radius"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/health"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/radiusd"
)

// Material points at the three mounted files a RadSec listener needs.
type Material struct {
	CertFile string
	KeyFile  string
	CAFile   string
}

// ServerConfig builds the TLS configuration. It fails closed: an expired leaf,
// an unreadable key pair, or a CA bundle with no certificate means the listener
// cannot prove trust, so it must not open.
func (m Material) ServerConfig() (*tls.Config, error) {
	cert, err := tls.LoadX509KeyPair(m.CertFile, m.KeyFile)
	if err != nil {
		return nil, fmt.Errorf("radsec: load key pair: %w", err)
	}
	leaf, err := x509.ParseCertificate(cert.Certificate[0])
	if err != nil {
		return nil, fmt.Errorf("radsec: parse server certificate: %w", err)
	}
	now := time.Now()
	if !now.Before(leaf.NotAfter) {
		return nil, fmt.Errorf("radsec: server certificate for %q expired at %s",
			leaf.Subject.CommonName, leaf.NotAfter.UTC().Format(time.RFC3339))
	}
	if now.Before(leaf.NotBefore) {
		return nil, fmt.Errorf("radsec: server certificate for %q is not valid before %s",
			leaf.Subject.CommonName, leaf.NotBefore.UTC().Format(time.RFC3339))
	}
	cert.Leaf = leaf

	bundle, err := os.ReadFile(m.CAFile) //nolint:gosec // path comes from validated configuration
	if err != nil {
		return nil, fmt.Errorf("radsec: read client CA bundle %q: %w", m.CAFile, err)
	}
	pool := x509.NewCertPool()
	if !pool.AppendCertsFromPEM(bundle) {
		return nil, fmt.Errorf("radsec: client CA bundle %q holds no PEM certificate", m.CAFile)
	}

	return &tls.Config{
		Certificates: []tls.Certificate{cert},
		ClientCAs:    pool,
		// A RadSec peer that cannot present a certificate chained to the bundle is
		// not trusted: there is no anonymous NAS on this transport.
		ClientAuth: tls.RequireAndVerifyClientCert,
		MinVersion: tls.VersionTLS12,
	}, nil
}

// Listener accepts RadSec connections and feeds each framed packet to the shared
// RADIUS handler.
type Listener struct {
	Addr    string
	Config  *tls.Config
	Handler *radiusd.Handler
	State   *health.State
	Log     *slog.Logger

	mu    sync.Mutex
	bound string
}

// Serve binds the TLS port and dispatches until ctx ends.
func (l *Listener) Serve(ctx context.Context) error {
	log := l.logger()
	if l.Handler == nil || l.Config == nil {
		return errors.New("radsec: listener needs a TLS config and a handler")
	}
	listener, err := tls.Listen("tcp", l.Addr, l.Config)
	if err != nil {
		l.ready(false, err.Error())
		return fmt.Errorf("radsec: bind %s: %w", l.Addr, err)
	}
	addr := listener.Addr().String()
	l.mu.Lock()
	l.bound = addr
	l.mu.Unlock()
	l.ready(true, addr)
	log.Info("radsec: listener bound", "addr", addr)

	go func() {
		<-ctx.Done()
		_ = listener.Close()
	}()
	for {
		conn, err := listener.Accept()
		if err != nil {
			if ctx.Err() != nil {
				l.ready(false, "shutting down")
				return nil
			}
			l.ready(false, err.Error())
			_ = listener.Close()
			return fmt.Errorf("radsec: accept: %w", err)
		}
		go l.serve(ctx, conn, log)
	}
}

// BoundAddr reports the port the listener actually owns.
func (l *Listener) BoundAddr() string {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.bound
}

func (l *Listener) serve(ctx context.Context, conn net.Conn, log *slog.Logger) {
	defer conn.Close()
	peer := conn.RemoteAddr().String()
	for {
		if err := ctx.Err(); err != nil {
			return
		}
		if err := conn.SetReadDeadline(time.Now().Add(60 * time.Second)); err != nil {
			return
		}
		packet, err := readFramed(conn)
		if err != nil {
			if !errors.Is(err, io.EOF) {
				log.Debug("radsec: connection closed", "peer", peer, "error", err.Error())
			}
			return
		}
		reply, err := l.Handler.Handle(ctx, packet, peer)
		if err != nil {
			log.Warn("radsec: request could not be served", "peer", peer, "error", err.Error())
		}
		if reply == nil {
			continue
		}
		if err := writeFramed(conn, reply); err != nil {
			log.Warn("radsec: reply could not be written", "peer", peer, "error", err.Error())
			return
		}
	}
}

// readFramed reads one length-prefixed RADIUS packet (RFC 2869 §2.6.1).
func readFramed(r io.Reader) ([]byte, error) {
	var length [2]byte
	if _, err := io.ReadFull(r, length[:]); err != nil {
		return nil, err
	}
	size := int(binary.BigEndian.Uint16(length[:]))
	if size < 20 || size > radius.MaxPacketLength {
		return nil, fmt.Errorf("radsec: framed length %d is outside the packet range", size)
	}
	buffer := make([]byte, size)
	if _, err := io.ReadFull(r, buffer); err != nil {
		return nil, err
	}
	return buffer, nil
}

func writeFramed(w io.Writer, packet []byte) error {
	if len(packet) < 20 || len(packet) > radius.MaxPacketLength {
		return fmt.Errorf("radsec: reply length %d is outside the packet range", len(packet))
	}
	framed := make([]byte, 2+len(packet))
	binary.BigEndian.PutUint16(framed[:2], uint16(len(packet)))
	copy(framed[2:], packet)
	_, err := w.Write(framed)
	return err
}

func (l *Listener) ready(ok bool, detail string) {
	if l.State != nil {
		l.State.Set("radsec", ok, detail)
	}
}

func (l *Listener) logger() *slog.Logger {
	if l.Log != nil {
		return l.Log
	}
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}
