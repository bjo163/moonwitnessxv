// Package radiusd is the stateless RADIUS protocol runtime.
//
// It owns UDP and RadSec listeners plus a bounded view of which NAS identifiers
// it has served and where their sessions arrived from. Every durable decision -
// tenant, credential, accounting, operator action - belongs to ARSY.
package radiusd

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"strings"
	"sync"
	"time"

	"layeh.com/radius"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/arsy"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/secrets"
)

// Deps are the collaborators one Handler needs.
type Deps struct {
	ARSY    *arsy.Client
	Secrets *secrets.Store
	MsgAuth string
	Log     *slog.Logger
	// MaxNASTracked bounds the in-memory view of which NAS identifiers this
	// process has served.
	MaxNASTracked int
}

// Counters is the observable runtime behaviour. Health exposes it so a readiness
// answer can be correlated with what the process actually did.
type Counters struct {
	AccessRequests     int
	AccessAccepts      int
	AccessRejects      int
	DroppedUnknownNAS  int
	DroppedBadSecret   int
	DroppedNoReply     int
	AcctStored         int
	AcctUnacknowledged int
	ARSYUnavailable    int
}

// Handler serves decoded RADIUS requests for both transports.
type Handler struct {
	deps  Deps
	mu    sync.Mutex
	seen  map[string]time.Time
	stats Counters
}

// NewHandler builds the protocol handler.
func NewHandler(deps Deps) (*Handler, error) {
	if deps.ARSY == nil {
		return nil, errors.New("radiusd: ARSY client is required")
	}
	if deps.Secrets == nil {
		return nil, errors.New("radiusd: secret store is required")
	}
	if deps.Log == nil {
		deps.Log = slog.New(slog.NewTextHandler(io.Discard, nil))
	}
	if deps.MaxNASTracked <= 0 {
		deps.MaxNASTracked = 256
	}
	switch deps.MsgAuth {
	case modeDisabled, modeWarn, modeEnforce:
	default:
		deps.MsgAuth = modeWarn
	}
	return &Handler{
		deps: deps,
		seen: map[string]time.Time{},
	}, nil
}

// Stats returns a snapshot of the counters.
func (h *Handler) Stats() Counters {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.stats
}

// ObservedNASs lists the NAS identifiers this process has served recently. The
// action runner uses it instead of a duplicated NAS inventory in configuration.
func (h *Handler) ObservedNASs() []string {
	h.mu.Lock()
	defer h.mu.Unlock()
	out := make([]string, 0, len(h.seen))
	for nasID := range h.seen {
		out = append(out, nasID)
	}
	return out
}

func (h *Handler) bump(field string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	switch field {
	case "access_requests":
		h.stats.AccessRequests++
	case "access_accepts":
		h.stats.AccessAccepts++
	case "access_rejects":
		h.stats.AccessRejects++
	case "dropped_unknown_nas":
		h.stats.DroppedUnknownNAS++
	case "dropped_bad_secret":
		h.stats.DroppedBadSecret++
	case "dropped_no_reply":
		h.stats.DroppedNoReply++
	case "acct_stored":
		h.stats.AcctStored++
	case "acct_unacknowledged":
		h.stats.AcctUnacknowledged++
	case "arsy_unavailable":
		h.stats.ARSYUnavailable++
	}
}

func (h *Handler) observe(nasID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if len(h.seen) >= h.deps.MaxNASTracked {
		// Bounded view: forget the least recently served identifier rather than
		// grow without limit.
		var oldestKey string
		var oldest time.Time
		for key, at := range h.seen {
			if oldestKey == "" || at.Before(oldest) {
				oldestKey, oldest = key, at
			}
		}
		delete(h.seen, oldestKey)
	}
	h.seen[nasID] = time.Now()
}

func (h *Handler) log(level slog.Level, msg string, args ...any) {
	h.deps.Log.Log(context.Background(), level, msg, args...)
}

// Handle processes one request and returns the bytes to write back. A nil reply
// means the request was silently discarded: RADIUS says nothing when it cannot
// prove who is asking or cannot reach the system of record.
func (h *Handler) Handle(ctx context.Context, raw []byte, peerAddr string) ([]byte, error) {
	pkt, err := radius.Parse(raw, nil)
	if err != nil {
		return nil, fmt.Errorf("radiusd: parse: %w", err)
	}
	switch pkt.Code {
	case radius.CodeAccessRequest:
		return h.handleAccess(ctx, pkt, raw, peerAddr)
	case radius.CodeAccountingRequest:
		return h.handleAccounting(ctx, pkt, raw, peerAddr)
	case radius.CodeStatusServer:
		// No durable meaning: answering would claim a decision ARSY never made.
		h.bump("dropped_no_reply")
		return nil, nil
	default:
		return nil, fmt.Errorf("radiusd: unhandled code %d", int(pkt.Code))
	}
}

func (h *Handler) handleAccess(ctx context.Context, pkt *radius.Packet, raw []byte, peerAddr string) ([]byte, error) {
	h.bump("access_requests")
	nasID := strings.TrimSpace(rfcNASIdentifier(pkt))
	if nasID == "" {
		h.bump("dropped_unknown_nas")
		h.log(slog.LevelWarn, "radius: access request without NAS-Identifier discarded")
		return nil, nil
	}

	resolution, secret, err := h.resolveSecret(ctx, nasID)
	if err != nil {
		return nil, nil // already logged and counted by resolveSecret
	}
	if msgauthDiscard(pkt, secret, h.deps.MsgAuth) {
		h.bump("dropped_bad_secret")
		h.log(slog.LevelWarn, "radius: access request message-authenticator rejected", "nas_id", nasID)
		return nil, nil
	}

	access, decodeErr := decodeAccessRequest(pkt, secret)
	if decodeErr != nil {
		// The credential cannot even be read. The NAS is known and its secret is
		// not, so the honest answer is a rejection rather than silence.
		h.bump("access_rejects")
		h.log(slog.LevelWarn, "radius: access request credential unreadable", "nas_id", nasID, "reason", decodeErr.Error())
		return h.reply(pkt, secret, radius.CodeAccessReject, nil)
	}

	auth, err := h.deps.ARSY.Authorize(ctx, resolution.NASID, access.Username, access.Password)
	if err != nil {
		h.noteUpstream(nasID, err)
		return nil, nil
	}
	if auth.Decision != "accept" {
		h.bump("access_rejects")
		return h.reply(pkt, secret, radius.CodeAccessReject, nil)
	}
	h.bump("access_accepts")
	h.observe(nasID)
	return h.reply(pkt, secret, radius.CodeAccessAccept, classAttribute(auth.Attributes))
}

func (h *Handler) handleAccounting(ctx context.Context, pkt *radius.Packet, raw []byte, peerAddr string) ([]byte, error) {
	nasID := strings.TrimSpace(rfcNASIdentifier(pkt))
	if nasID == "" {
		h.bump("dropped_unknown_nas")
		return nil, nil
	}
	resolution, secret, err := h.resolveSecret(ctx, nasID)
	if err != nil {
		return nil, nil
	}
	// The accounting digest is computed with the shared secret, so a NAS with a
	// different secret never reaches the persistence call.
	if !radius.IsAuthenticRequest(raw, secret) {
		h.bump("dropped_bad_secret")
		h.log(slog.LevelWarn, "radius: accounting request failed authenticator check", "nas_id", nasID)
		return nil, nil
	}

	acct, err := decodeAccountingRequest(pkt)
	if err != nil {
		h.bump("dropped_no_reply")
		h.log(slog.LevelWarn, "radius: accounting request unreadable", "nas_id", nasID, "reason", err.Error())
		return nil, nil
	}

	receipt, err := h.deps.ARSY.StoreAccounting(ctx, arsy.AccountingRequest{
		NASID:          resolution.NASID,
		Username:       acct.Username,
		SessionKey:     acct.SessionKey,
		EventKey:       eventKey(acct),
		EventType:      acct.EventType,
		EventAt:        time.Now().UTC().Format(time.RFC3339Nano),
		InputOctets:    acct.InputOctets,
		OutputOctets:   acct.OutputOctets,
		SessionSeconds: acct.SessionSeconds,
	})
	if err != nil {
		// Nothing was persisted, so nothing may be acknowledged.
		h.bump("acct_unacknowledged")
		h.noteUpstream(nasID, err)
		return nil, nil
	}
	h.bump("acct_stored")
	h.observe(resolution.NASID)
	h.log(slog.LevelDebug, "radius: accounting event persisted",
		"nas_id", resolution.NASID, "session_key", acct.SessionKey, "event_type", acct.EventType, "event_key", receipt.EventKey)
	return h.reply(pkt, secret, radius.CodeAccountingResponse, nil)
}

// resolveSecret asks ARSY who owns the NAS identifier and reads the mounted
// secret for it. Every failure path is logged and counted, then returned as an
// error so the caller stays silent on the wire.
func (h *Handler) resolveSecret(ctx context.Context, nasID string) (arsy.NASResolution, []byte, error) {
	resolution, err := h.deps.ARSY.ResolveNAS(ctx, nasID)
	if err != nil {
		h.noteUpstream(nasID, err)
		return arsy.NASResolution{}, nil, err
	}
	if !resolution.Resolved {
		h.bump("dropped_unknown_nas")
		h.log(slog.LevelWarn, "radius: NAS is not served by this tenant set", "nas_id", nasID)
		return arsy.NASResolution{}, nil, errors.New("radiusd: NAS not resolved")
	}
	secret, err := h.deps.Secrets.Get(resolution.SecretRef)
	if err != nil {
		h.bump("dropped_bad_secret")
		h.log(slog.LevelError, "radius: mounted secret unavailable", "nas_id", nasID, "secret_ref", resolution.SecretRef)
		return arsy.NASResolution{}, nil, err
	}
	return resolution, secret, nil
}

// noteUpstream records why the runtime refused to answer. A credential refusal
// and an unreachable ARSY both deny service, but only the latter is an outage.
func (h *Handler) noteUpstream(nasID string, err error) {
	if errors.Is(err, arsy.ErrUnavailable) || errors.Is(err, arsy.ErrDenied) {
		h.bump("arsy_unavailable")
		h.log(slog.LevelError, "radius: ARSY could not answer, request denied without a verdict", "nas_id", nasID, "error", err.Error())
		return
	}
	h.bump("dropped_no_reply")
	h.log(slog.LevelWarn, "radius: ARSY refused the request", "nas_id", nasID, "error", err.Error())
}

// msgauthDiscard applies the configured Message-Authenticator policy.
func msgauthDiscard(pkt *radius.Packet, secret []byte, mode string) bool {
	if pkt.Code != radius.CodeAccessRequest {
		return false
	}
	return messageAuthDecision(mode, verifyMessageAuthenticator(pkt, secret))
}

// reply builds and signs one response. Attributes may be nil.
func (h *Handler) reply(pkt *radius.Packet, secret []byte, code radius.Code, attrs []attr) ([]byte, error) {
	resp := pkt.Response(code)
	resp.Secret = secret
	for _, a := range attrs {
		if err := a.apply(resp); err != nil {
			return nil, fmt.Errorf("radiusd: set reply attribute: %w", err)
		}
	}
	if err := signResponse(resp, h.deps.MsgAuth, secret); err != nil {
		return nil, fmt.Errorf("radiusd: sign response: %w", err)
	}
	return resp.Encode()
}
