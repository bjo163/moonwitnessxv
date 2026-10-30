package radiusd

import (
	"context"
	"crypto/md5"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"strings"
	"time"

	"layeh.com/radius"
	"layeh.com/radius/rfc2865"
	"layeh.com/radius/rfc2866"
	"layeh.com/radius/rfc2869"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/arsy"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/secrets"
)

// DefaultCoAPort is the IANA Dynamic Authorization port, kept from the reviewed
// source's constant.
const DefaultCoAPort = 3799

// COAConfig bounds one Dynamic Authorization exchange.
type COAConfig struct {
	Timeout     time.Duration
	MaxAttempts int
	Port        int
}

// COAResult is the structured outcome of one delivery. Attempts counts
// transmissions actually made, so a request that never reached the network is
// never reported as a timeout.
type COAResult struct {
	ResponseCode string
	Attempts     int
	TimedOut     bool
	Sent         bool
	Err          error
}

// Sender delivers CoA and Disconnect-Requests to a NAS.
type Sender struct {
	cfg     COAConfig
	secrets *secrets.Store
	log     *slog.Logger
}

// NewSender builds the Dynamic Authorization sender.
func NewSender(cfg COAConfig, store *secrets.Store, log *slog.Logger) (*Sender, error) {
	if store == nil {
		return nil, errors.New("radiusd: secret store is required")
	}
	if cfg.MaxAttempts < 1 {
		cfg.MaxAttempts = 3
	}
	if cfg.Timeout <= 0 {
		cfg.Timeout = 5 * time.Second
	}
	if cfg.Port <= 0 {
		cfg.Port = DefaultCoAPort
	}
	if log == nil {
		log = slog.New(slog.NewTextHandler(io.Discard, nil))
	}
	return &Sender{cfg: cfg, secrets: store, log: log}, nil
}

// Deliver sends one recorded action to the management address ARSY resolved for
// this NAS and returns the structured answer. Sent=false means nothing reached the
// network, which the runner must surface as "still pending" rather than as a
// verdict.
//
// RFC 5176 §3 identifies the target by NAS and session attributes only, so a
// Disconnect-Request carries NAS-Identifier plus the Acct-Session-Id and User-Name
// ARSY recorded. Vendor and WISPr attribute shaping belongs to the tenant's ARSY
// profile and its NAS configuration, not to this protocol runtime.
func (s *Sender) Deliver(ctx context.Context, action arsy.SessionAction, resolution arsy.NASResolution) COAResult {
	if strings.TrimSpace(resolution.NASAddress) == "" {
		return COAResult{Err: fmt.Errorf("radiusd: NAS %q has no management address to aim at", resolution.NASID)}
	}
	secret, err := s.secrets.Get(resolution.SecretRef)
	if err != nil {
		return COAResult{Err: fmt.Errorf("radiusd: no secret for NAS %q: %w", resolution.NASID, err)}
	}
	code, ackCode, nakCode, err := dynamicAuthorizationCodes(action.Action)
	if err != nil {
		return COAResult{Err: err}
	}

	pkt := radius.New(code, secret)
	if err := rfc2865.NASIdentifier_SetString(pkt, resolution.NASID); err != nil {
		return COAResult{Err: err}
	}
	if strings.TrimSpace(action.SessionKey) != "" {
		if err := rfc2866.AcctSessionID_SetString(pkt, action.SessionKey); err != nil {
			return COAResult{Err: err}
		}
	}
	if strings.TrimSpace(action.Username) != "" {
		if err := rfc2865.UserName_SetString(pkt, action.Username); err != nil {
			return COAResult{Err: err}
		}
	}
	if err := signRequest(pkt, secret); err != nil {
		return COAResult{Err: fmt.Errorf("radiusd: sign request: %w", err)}
	}

	wire, err := pkt.Encode()
	if err != nil {
		return COAResult{Err: fmt.Errorf("radiusd: encode request: %w", err)}
	}
	target := mustTarget(resolution.NASAddress, s.cfg.Port)
	addr, err := net.ResolveUDPAddr("udp", target)
	if err != nil {
		return COAResult{Err: fmt.Errorf("radiusd: resolve %q: %w", target, err)}
	}
	conn, err := openSenderSocket(addr)
	if err != nil {
		return COAResult{Err: fmt.Errorf("radiusd: open sender socket: %w", err)}
	}
	defer conn.Close()

	result := COAResult{}
	for attempt := 1; attempt <= s.cfg.MaxAttempts; attempt++ {
		if ctx.Err() != nil {
			result.TimedOut = true
			result.Err = ctx.Err()
			return result
		}
		if _, err := conn.WriteTo(wire, addr); err != nil {
			result.Err = fmt.Errorf("radiusd: write to %s: %w", target, err)
			return result
		}
		result.Sent = true
		result.Attempts = attempt
		if reply := s.awaitReply(conn, wire, secret, ackCode, nakCode, s.cfg.Timeout); reply != "" {
			result.ResponseCode = reply
			return result
		}
	}
	result.TimedOut = true
	return result
}

// awaitReply reads one matching, authentic reply inside the window.
func (s *Sender) awaitReply(conn net.PacketConn, request, secret []byte, ackCode, nakCode radius.Code, window time.Duration) string {
	buffer := make([]byte, radius.MaxPacketLength)
	deadline := time.Now().Add(window)
	for {
		remaining := time.Until(deadline)
		if remaining <= 0 {
			return ""
		}
		if err := conn.SetReadDeadline(time.Now().Add(remaining)); err != nil {
			return ""
		}
		n, _, err := conn.ReadFrom(buffer)
		if err != nil {
			return ""
		}
		reply := buffer[:n]
		parsed, err := radius.Parse(reply, secret)
		if err != nil {
			continue
		}
		if parsed.Code != ackCode && parsed.Code != nakCode {
			continue
		}
		if !radius.IsAuthenticResponse(reply, request, secret) {
			s.warn("radius: dynamic authorization reply failed the response authenticator")
			continue
		}
		var requestAuth [16]byte
		copy(requestAuth[:], request[4:20])
		if verifyResponseMessageAuthenticator(parsed, requestAuth, secret) == msgAuthInvalid {
			s.warn("radius: dynamic authorization reply failed message-authenticator")
			continue
		}
		return parsed.Code.String()
	}
}

func (s *Sender) warn(msg string) {
	s.log.Log(context.Background(), slog.LevelWarn, msg)
}

// mustTarget re-points a peer address at the Dynamic Authorization port, because
// accounting arrives on the NAS's 1812/1813 sockets while CoA uses 3799.
func mustTarget(addr string, port int) string {
	host := strings.TrimSpace(addr)
	if parsedHost, _, err := net.SplitHostPort(host); err == nil {
		host = parsedHost
	}
	if ip := net.ParseIP(host); ip != nil && ip.To4() == nil && strings.Contains(host, ":") {
		host = "[" + host + "]"
	}
	return fmt.Sprintf("%s:%d", host, port)
}

// openSenderSocket binds an ephemeral socket in the peer's own address family, so
// a runtime reachable only over IPv6 can still drive a dual-stack NAS.
func openSenderSocket(peer *net.UDPAddr) (net.PacketConn, error) {
	if peer.IP != nil && peer.IP.To4() == nil {
		return net.ListenPacket("udp", "[::]:0")
	}
	return net.ListenPacket("udp", "0.0.0.0:0")
}

func dynamicAuthorizationCodes(action string) (radius.Code, radius.Code, radius.Code, error) {
	switch action {
	case "disconnect":
		return radius.CodeDisconnectRequest, radius.CodeDisconnectACK, radius.CodeDisconnectNAK, nil
	case "coa":
		return radius.CodeCoARequest, radius.CodeCoAACK, radius.CodeCoANAK, nil
	default:
		return 0, 0, 0, fmt.Errorf("radiusd: unknown session action %q", action)
	}
}

// signRequest adds the Message-Authenticator to an outgoing Dynamic
// Authorization request. RFC 5176 §3.4 computes that digest before the Request
// Authenticator is filled in, so Encode runs only after the attribute is set.
func signRequest(pkt *radius.Packet, secret []byte) error {
	if err := rfc2869.MessageAuthenticator_Set(pkt, make([]byte, md5.Size)); err != nil {
		return err
	}
	wire, err := pkt.MarshalBinary()
	if err != nil {
		return err
	}
	return rfc2869.MessageAuthenticator_Set(pkt, dynamicAuthRequestDigest(wire, secret))
}
