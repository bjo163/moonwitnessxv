package radiusd

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"sync"

	"layeh.com/radius"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/health"
)

// Listener is one RADIUS/UDP socket. Authentication and accounting use separate
// ports, so each gets its own listener and its own readiness answer.
type Listener struct {
	Name    string
	Addr    string
	Handler *Handler
	State   *health.State
	// Concurrency bounds how many requests are in flight; extra packets wait for
	// a slot rather than growing goroutines without limit.
	Concurrency int
	Log         *slog.Logger

	mu    sync.Mutex
	bound string
}

// Serve binds the socket, reports readiness, and dispatches until ctx ends.
func (l *Listener) Serve(ctx context.Context) error {
	log := l.logger()
	if l.Handler == nil {
		return errors.New("radiusd: listener needs a handler")
	}
	conn, err := net.ListenPacket("udp", l.Addr)
	if err != nil {
		l.setReady(false, err.Error())
		return fmt.Errorf("radiusd: bind %s (%s): %w", l.Addr, l.Name, err)
	}
	l.setReady(true, conn.LocalAddr().String())
	l.mu.Lock()
	l.bound = conn.LocalAddr().String()
	l.mu.Unlock()
	log.Info("radius: listener bound", "name", l.Name, "addr", conn.LocalAddr().String())

	slots := make(chan struct{}, l.concurrency())
	go func() {
		<-ctx.Done()
		_ = conn.Close()
	}()

	buffer := make([]byte, radius.MaxPacketLength)
	for {
		n, peer, err := conn.ReadFrom(buffer)
		if err != nil {
			if ctx.Err() != nil {
				l.setReady(false, "shutting down")
				return nil
			}
			if ne, ok := err.(net.Error); ok && ne.Timeout() {
				continue
			}
			l.setReady(false, err.Error())
			_ = conn.Close()
			return fmt.Errorf("radiusd: read on %s: %w", l.Name, err)
		}
		request := append([]byte(nil), buffer[:n]...)
		addr := peer.String()
		select {
		case slots <- struct{}{}:
		default:
			// Bounded state: rather than queue an unbounded backlog, drop and let
			// the NAS retransmit. RADIUS already assumes loss.
			log.Warn("radius: listener at capacity, packet dropped", "name", l.Name, "peer", addr)
			continue
		}
		go func() {
			defer func() { <-slots }()
			reply, err := l.Handler.Handle(ctx, request, addr)
			if err != nil {
				log.Warn("radius: request could not be served", "name", l.Name, "peer", addr, "error", err.Error())
			}
			if reply == nil {
				return
			}
			if _, err := conn.WriteTo(reply, peer); err != nil {
				log.Warn("radius: reply could not be written", "name", l.Name, "peer", addr, "error", err.Error())
			}
		}()
	}
}

func (l *Listener) concurrency() int {
	if l.Concurrency > 0 {
		return l.Concurrency
	}
	return 64
}

func (l *Listener) setReady(ready bool, detail string) {
	if l.State != nil {
		l.State.Set(l.Name, ready, detail)
	}
}

func (l *Listener) logger() *slog.Logger {
	if l.Log != nil {
		return l.Log
	}
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}

// BoundAddr reports the socket Serve actually owns, so an operator or a test
// that asked for port 0 can read the real address back.
func (l *Listener) BoundAddr() string {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.bound
}
