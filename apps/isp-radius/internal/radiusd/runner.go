package radiusd

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"time"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/arsy"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/health"
)

// Runner turns recorded operator actions into Dynamic Authorization packets.
//
// It never invents an action: ARSY only lists actions an operator already
// recorded, and the runner reports a verdict only for a packet it actually
// transmitted. If nothing was sent, the action stays pending.
type Runner struct {
	client   *arsy.Client
	sender   *Sender
	handler  *Handler
	interval time.Duration
	state    *health.State
	log      *slog.Logger
}

// NewRunner wires the action runner to the handler that knows which NASs this
// process serves.
func NewRunner(client *arsy.Client, sender *Sender, handler *Handler, interval time.Duration, state *health.State, log *slog.Logger) (*Runner, error) {
	if client == nil || sender == nil || handler == nil {
		return nil, errors.New("radiusd: runner needs the ARSY client, sender and handler")
	}
	if interval <= 0 {
		interval = 2 * time.Second
	}
	if log == nil {
		log = slog.New(slog.NewTextHandler(io.Discard, nil))
	}
	return &Runner{client: client, sender: sender, handler: handler, interval: interval, state: state, log: log}, nil
}

// Run polls until ctx ends. It returns the last polling error only when the
// context is still live, so a shutdown is not reported as a failure.
func (r *Runner) Run(ctx context.Context) error {
	ticker := time.NewTicker(r.interval)
	defer ticker.Stop()
	r.ready(true, "polling")
	for {
		select {
		case <-ctx.Done():
			r.ready(false, "stopped")
			return nil
		case <-ticker.C:
			if err := r.Tick(ctx); err != nil && ctx.Err() == nil {
				r.log.Warn("radius: action poll failed", "error", err.Error())
			}
		}
	}
}

// Tick performs one poll-and-deliver cycle. It returns the errors that prevented
// delivery so a caller can report them; verdicts are recorded per action.
// Tests drive it directly instead of waiting for the ticker.
func (r *Runner) Tick(ctx context.Context) error {
	var errs []error
	for _, nasID := range r.handler.ObservedNASs() {
		actions, err := r.client.PendingActions(ctx, nasID)
		if err != nil {
			if errors.Is(err, arsy.ErrUnavailable) || errors.Is(err, arsy.ErrDenied) {
				errs = append(errs, err)
				continue
			}
			// An unknown NAS simply has nothing recorded for this runtime.
			r.log.Debug("radius: action poll skipped NAS", "nas_id", nasID, "error", err.Error())
			continue
		}
		if len(actions) == 0 {
			continue
		}
		resolution, err := r.client.ResolveNAS(ctx, nasID)
		if err != nil || !resolution.Resolved {
			errs = append(errs, fmt.Errorf("resolve NAS %q for action delivery: %w", nasID, err))
			continue
		}
		for _, action := range actions {
			r.deliver(ctx, action, resolution)
		}
	}
	return errors.Join(errs...)
}

func (r *Runner) deliver(ctx context.Context, action arsy.SessionAction, resolution arsy.NASResolution) {
	result := r.sender.Deliver(ctx, action, resolution)
	if !result.Sent {
		// Nothing reached the NAS. Reporting anything here would commit a verdict
		// the network never produced.
		r.log.Warn("radius: session action could not be transmitted, left pending",
			"nas_id", resolution.NASID, "action_id", action.ID, "error", resultError(result))
		return
	}
	verdict, detail := verdictFor(action.Action, result)
	report := arsy.ActionResult{
		NASID:    resolution.NASID,
		ActionID: action.ID,
		Result:   verdict,
		Detail:   bound(detail, 200),
	}
	if err := r.client.ReportAction(ctx, report); err != nil {
		r.log.Warn("radius: action verdict could not be recorded",
			"nas_id", resolution.NASID, "action_id", action.ID, "verdict", verdict, "error", err.Error())
		return
	}
	r.log.Info("radius: session action answered",
		"nas_id", resolution.NASID, "action_id", action.ID, "action", action.Action,
		"verdict", verdict, "attempts", result.Attempts)
}

func verdictFor(action string, result COAResult) (string, string) {
	switch {
	case result.TimedOut:
		return "timeout", fmt.Sprintf("no %s reply after %d attempts", actionName(action), result.Attempts)
	case result.ResponseCode == ackCode(action):
		return "ack", result.ResponseCode
	case result.ResponseCode == nakCode(action):
		return "nak", result.ResponseCode
	default:
		return "timeout", "no reply"
	}
}

func actionName(action string) string {
	if action == "coa" {
		return "CoA-ACK/NAK"
	}
	return "Disconnect-ACK/NAK"
}

func ackCode(action string) string {
	if action == "coa" {
		return "CoA-ACK"
	}
	return "Disconnect-ACK"
}

func nakCode(action string) string {
	if action == "coa" {
		return "CoA-NAK"
	}
	return "Disconnect-NAK"
}

func resultError(result COAResult) string {
	if result.Err != nil {
		return result.Err.Error()
	}
	return "not transmitted"
}

func bound(value string, limit int) string {
	if len(value) <= limit {
		return value
	}
	return value[:limit]
}

func (r *Runner) ready(ok bool, detail string) {
	if r.state != nil {
		r.state.Set("action_runner", ok, detail)
	}
}
