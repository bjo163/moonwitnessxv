package radiusd

import (
	"context"
	"net/http"
	"testing"
	"time"

	"layeh.com/radius"
	"layeh.com/radius/rfc2866"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/arsy"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/health"
)

// observeNAS makes the runtime serve one legitimate packet so the action runner
// knows this NAS is its own, instead of reading a duplicated inventory.
func observeNAS(t *testing.T, handler *Handler) {
	t.Helper()
	raw := accountingPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeSessionKey,
		rfc2866.AcctStatusType_Value_Start, 0, 0, 0, 0)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil || reply == nil {
		t.Fatalf("prime the NAS view: reply=%d err=%v", len(reply), err)
	}
}

func recordPendingAction(fake *fakeARSY, action arsy.SessionAction) {
	fake.actionsFunc = func(nasID string) (int, any) {
		if nasID != fakeNASID {
			return http.StatusOK, []arsy.SessionAction{}
		}
		return http.StatusOK, []arsy.SessionAction{action}
	}
}

func newTestRunner(t *testing.T, fake *fakeARSY, handler *Handler, port int, attempts int, timeout time.Duration) (*Runner, *health.State) {
	t.Helper()
	store := mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret})
	sender, err := NewSender(COAConfig{Timeout: timeout, MaxAttempts: attempts, Port: port}, store, discardLogger())
	if err != nil {
		t.Fatalf("build sender: %v", err)
	}
	state := health.NewState(fake.client(t).Probe)
	runner, err := NewRunner(fake.client(t), sender, handler, 20*time.Millisecond, state, discardLogger())
	if err != nil {
		t.Fatalf("build runner: %v", err)
	}
	return runner, state
}

func TestRunnerDeliversARecordedActionAndReportsTheACK(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)
	observeNAS(t, handler)

	nas := startFakeNAS(t, []byte(fakeSecret), func(*radius.Packet) radius.Code { return radius.CodeDisconnectACK })
	action := disconnectAction()
	recordPendingAction(fake, action)
	runner, _ := newTestRunner(t, fake, handler, nas.port(t), 3, 500*time.Millisecond)

	if err := runner.Tick(context.Background()); err != nil {
		t.Fatalf("tick: %v", err)
	}
	requests := nas.requests()
	if len(requests) != 1 {
		t.Fatalf("fake NAS received %d requests, want the one action ARSY recorded", len(requests))
	}
	reports := fake.reports()
	if len(reports) != 1 {
		t.Fatalf("reports = %+v, want one verdict", reports)
	}
	if reports[0].Result != "ack" || reports[0].ActionID != fakeActionID || reports[0].NASID != fakeNASID {
		t.Fatalf("report = %+v, want an ack for the recorded action", reports[0])
	}
}

func TestRunnerReportsNAKAndTimeoutVerdicts(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)
	observeNAS(t, handler)

	nakNAS := startFakeNAS(t, []byte(fakeSecret), func(*radius.Packet) radius.Code { return radius.CodeDisconnectNAK })
	recordPendingAction(fake, disconnectAction())
	runner, _ := newTestRunner(t, fake, handler, nakNAS.port(t), 1, 500*time.Millisecond)
	if err := runner.Tick(context.Background()); err != nil {
		t.Fatalf("tick: %v", err)
	}
	if got := fake.reports(); len(got) != 1 || got[0].Result != "nak" {
		t.Fatalf("reports = %+v, want a nak verdict", got)
	}

	silentNAS := startFakeNAS(t, []byte(fakeSecret), func(*radius.Packet) radius.Code { return 0 })
	fake2 := newFakeARSY(t)
	handler2 := newTestHandler(t, fake2, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)
	observeNAS(t, handler2)
	recordPendingAction(fake2, disconnectAction())
	timeoutRunner, _ := newTestRunner(t, fake2, handler2, silentNAS.port(t), 2, 30*time.Millisecond)
	if err := timeoutRunner.Tick(context.Background()); err != nil {
		t.Fatalf("tick: %v", err)
	}
	reported := fake2.reports()
	if len(reported) != 1 || reported[0].Result != "timeout" {
		t.Fatalf("reports = %+v, want a timeout verdict", reported)
	}
	mustContain(t, reported[0].Detail, "2 attempts", "the verdict must say how often it tried")
	if len(reported[0].Detail) > 200 {
		t.Fatalf("detail %q exceeds the 200 character column ARSY accepts", reported[0].Detail)
	}
}

func TestARSYOutageSendsNoSessionAction(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)
	observeNAS(t, handler)

	nas := startFakeNAS(t, []byte(fakeSecret), func(*radius.Packet) radius.Code { return radius.CodeDisconnectACK })
	// The action exists only in ARSY's memory here; with ARSY down the runtime must
	// not invent a delivery or a verdict.
	fake.actionsFunc = func(string) (int, any) { return http.StatusServiceUnavailable, nil }
	runner, _ := newTestRunner(t, fake, handler, nas.port(t), 3, 200*time.Millisecond)

	if err := runner.Tick(context.Background()); err == nil {
		t.Fatalf("tick reported success while ARSY was unavailable")
	}
	if got := nas.requests(); len(got) != 0 {
		t.Fatalf("fake NAS received %d requests, want none: an unavailable record of authority commits nothing", len(got))
	}
	if got := fake.reports(); len(got) != 0 {
		t.Fatalf("reports = %+v, want no verdict recorded during an outage", got)
	}
}

func TestRunnerLeavesAnUndeliverableActionPending(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)
	observeNAS(t, handler)
	recordPendingAction(fake, disconnectAction())
	fake.resolveFunc = func(nasID string) (int, any) {
		return http.StatusOK, arsy.NASResolution{Resolved: true, NASID: nasID, NASAddress: "[::1", SecretRef: "nas-a.secret"}
	}
	// Nothing was transmitted, so reporting a verdict would commit an answer the
	// network never gave.
	runner, _ := newTestRunner(t, fake, handler, 3799, 2, 50*time.Millisecond)
	if err := runner.Tick(context.Background()); err != nil {
		t.Fatalf("tick: %v", err)
	}
	if got := fake.reports(); len(got) != 0 {
		t.Fatalf("reports = %+v, want none without a transmission", got)
	}
}

func TestRunnerStopsPollingWhenARSYCannotResolveTheNAS(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)
	observeNAS(t, handler)
	recordPendingAction(fake, disconnectAction())
	fake.resolveFunc = func(string) (int, any) { return http.StatusOK, map[string]any{"resolved": false} }

	nas := startFakeNAS(t, []byte(fakeSecret), func(*radius.Packet) radius.Code { return radius.CodeDisconnectACK })
	runner, _ := newTestRunner(t, fake, handler, nas.port(t), 1, 200*time.Millisecond)
	if err := runner.Tick(context.Background()); err == nil {
		t.Fatalf("tick reported success although the NAS it serves cannot be resolved")
	}
	if got := nas.requests(); len(got) != 0 {
		t.Fatalf("fake NAS received %d requests, want none", len(got))
	}
}

func TestRunnerRunReportsReadinessWhilePolling(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)
	runner, state := newTestRunner(t, fake, handler, 3799, 1, 50*time.Millisecond)

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- runner.Run(ctx) }()

	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if component, ok := state.Snapshot()["action_runner"]; ok && component.Ready {
			break
		}
		time.Sleep(5 * time.Millisecond)
	}
	component, ok := state.Snapshot()["action_runner"]
	if !ok || !component.Ready {
		t.Fatalf("action_runner readiness = %+v (present=%v), want ready while polling", component, ok)
	}
	cancel()
	select {
	case err := <-done:
		if err != nil {
			t.Fatalf("runner stopped with %v", err)
		}
	case <-time.After(3 * time.Second):
		t.Fatalf("runner did not stop when its context ended")
	}
	if component, ok := state.Snapshot()["action_runner"]; ok && component.Ready {
		t.Fatalf("action_runner still reports ready after shutdown")
	}
}
