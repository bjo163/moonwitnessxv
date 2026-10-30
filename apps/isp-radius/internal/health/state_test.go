package health

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"slices"
	"sort"
	"strings"
	"testing"
	"time"
)

func TestAnEmptyComponentViewIsNeverReady(t *testing.T) {
	state := NewState(func(context.Context) error { return nil })

	ready, components := state.Check(context.Background())
	if ready {
		t.Fatalf("Check = ready with the component view %v, want not-ready: an empty view proves nothing", components)
	}
	if got := len(state.Snapshot()); got != 0 {
		t.Fatalf("snapshot holds %d components after Check, want the declared view untouched", got)
	}
}

func TestAComponentThatIsNotReadyKeepsTheAnswerNotReady(t *testing.T) {
	state := NewState(func(context.Context) error { return nil })
	state.Set("authentication", true, "127.0.0.1:1812")
	state.Set("accounting", false, "the accounting socket never bound")

	ready, components := state.Check(context.Background())
	if ready {
		t.Fatalf("Check = ready with a not-ready component, want the whole answer to be not-ready")
	}
	accounting, ok := components["accounting"]
	if !ok {
		t.Fatalf("components = %v, want the declared accounting listener reported", components)
	}
	if accounting.Ready {
		t.Fatalf("accounting = %+v, want it to stay not ready", accounting)
	}
	if accounting.Detail != "the accounting socket never bound" {
		t.Fatalf("accounting detail = %q, want the reason the caller registered", accounting.Detail)
	}

	state.Set("accounting", true, "127.0.0.1:1813")
	if ready, _ := state.Check(context.Background()); !ready {
		t.Fatalf("Check = not-ready once every declared component is bound and the upstream answers, want ready")
	}
}

func TestANilUpstreamProbeIsReportedNotReadyRatherThanAssumedHealthy(t *testing.T) {
	state := NewState(nil)
	state.Set("authentication", true, "127.0.0.1:1812")

	ready, components := state.Check(context.Background())
	if ready {
		t.Fatalf("Check = ready with no upstream probe, want the runtime to admit it cannot reach ARSY")
	}
	arsy, ok := components["arsy"]
	if !ok {
		t.Fatalf("components = %v, want an arsy entry explaining the missing probe", components)
	}
	if arsy.Ready || !strings.Contains(arsy.Detail, "no upstream probe") {
		t.Fatalf("arsy = %+v, want not-ready with a missing-probe detail", arsy)
	}
}

func TestTheUpstreamProbeDecidesTheArsyComponent(t *testing.T) {
	unreachable := errors.New("synthetic: dial tcp 192.0.2.1:8443: connection refused")
	cases := []struct {
		name      string
		probe     func(context.Context) error
		wantReady bool
		wantIn    string
	}{
		{
			name:      "a failing upstream",
			probe:     func(context.Context) error { return unreachable },
			wantReady: false,
			wantIn:    unreachable.Error(),
		},
		{
			name:      "a reachable upstream",
			probe:     func(context.Context) error { return nil },
			wantReady: true,
			wantIn:    "",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			state := NewState(tc.probe)
			state.Set("authentication", true, "127.0.0.1:1812")

			ready, components := state.Check(context.Background())
			if ready != tc.wantReady {
				t.Fatalf("Check = ready %v with components %v, want ready %v", ready, components, tc.wantReady)
			}
			arsy, ok := components["arsy"]
			if !ok {
				t.Fatalf("components = %v, want the upstream verdict under arsy", components)
			}
			if arsy.Ready != tc.wantReady {
				t.Fatalf("arsy = %+v, want ready %v", arsy, tc.wantReady)
			}
			if tc.wantIn != "" && !strings.Contains(arsy.Detail, tc.wantIn) {
				t.Fatalf("arsy detail = %q, want the upstream error text %q surfaced", arsy.Detail, tc.wantIn)
			}
		})
	}
}

func TestHandlerServesLivenessAndReadinessAsJSON(t *testing.T) {
	upstreamFailure := errors.New("synthetic: arsy health endpoint answered 503")
	state := NewState(func(context.Context) error { return upstreamFailure })
	state.Set("listeners", false, "the accounting socket never bound")
	state.Set("radsec", true, "127.0.0.1:2083")
	handler := state.Handler()

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/healthz", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("/healthz status = %d, want 200: the process is serving HTTP even when ARSY is down", rec.Code)
	}
	if got := rec.Header().Get("Content-Type"); got != "application/json" {
		t.Fatalf("/healthz content-type = %q, want application/json", got)
	}
	var live struct {
		Status    string `json:"status"`
		StartedAt string `json:"started_at"`
	}
	decodeBody(t, rec.Body.Bytes(), &live)
	if live.Status != "ok" {
		t.Fatalf("/healthz status = %q, want ok", live.Status)
	}
	if _, err := time.Parse(time.RFC3339, live.StartedAt); err != nil {
		t.Fatalf("/healthz started_at = %q, want an RFC3339 timestamp: %v", live.StartedAt, err)
	}

	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/readyz", nil))
	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("/readyz status = %d with components %v, want 503 while a listener is unbound and ARSY is down",
			rec.Code, state.Snapshot())
	}
	body := decodeReady(t, rec)
	if body.Status != "not-ready" {
		t.Fatalf("/readyz status = %q, want not-ready", body.Status)
	}
	if want := []string{"arsy", "listeners", "radsec"}; !slices.Equal(body.Order, want) {
		t.Fatalf("/readyz order = %v, want %v sorted by name", body.Order, want)
	}
	if got := body.Components["listeners"]; got.Ready || got.Detail != "the accounting socket never bound" {
		t.Fatalf("/readyz listeners component = %+v, want the unbound reason surfaced", got)
	}
	if got := body.Components["arsy"]; got.Ready || !strings.Contains(got.Detail, "503") {
		t.Fatalf("/readyz arsy component = %+v, want the upstream failure text", got)
	}

	state.Set("listeners", true, "127.0.0.1:1813")
	upstreamFailure = nil
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/readyz", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("/readyz status = %d with components %v, want 200 once everything is bound and ARSY answers",
			rec.Code, state.Snapshot())
	}
	ready := decodeReady(t, rec)
	if ready.Status != "ready" {
		t.Fatalf("/readyz status = %q, want ready", ready.Status)
	}
	if !ready.Components["arsy"].Ready {
		t.Fatalf("/readyz arsy component = %+v, want ready once the probe succeeds", ready.Components["arsy"])
	}

	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/healthz", nil))
	if rec.Code == http.StatusOK {
		t.Fatalf("POST /healthz returned 200, want the probes to answer GET only")
	}
}

func TestServeReportsTheBoundListenerAndStopsWhenTheContextEnds(t *testing.T) {
	state := NewState(func(context.Context) error { return nil })
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	errs := make(chan error, 1)
	go func() { errs <- state.Serve(ctx, "127.0.0.1:0") }()

	addr := waitForBoundHealthListener(t, state, errs)
	client := &http.Client{Timeout: 2 * time.Second}
	resp, err := client.Get("http://" + addr + "/healthz")
	if err != nil {
		t.Fatalf("GET /healthz on the served socket %s: %v", addr, err)
	}
	defer resp.Body.Close()
	payload, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read the liveness body: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("GET /healthz = %d %q, want 200 from the bound listener", resp.StatusCode, payload)
	}
	if got := resp.Header.Get("Content-Type"); got != "application/json" {
		t.Fatalf("GET /healthz content-type = %q, want application/json", got)
	}

	cancel()
	select {
	case err := <-errs:
		// Serve reports the cancellation it was asked to honour, not a failure.
		if err != nil && !errors.Is(err, context.Canceled) {
			t.Fatalf("Serve returned %v after cancellation, want nil or the joined context error", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatalf("Serve was still running 5s after the context was cancelled, want it to release the listener")
	}
	health := state.Snapshot()["health"]
	if health.Ready {
		t.Fatalf("health component = %+v after cancellation, want not-ready: the socket is gone", health)
	}
	if health.Detail != "shutting down" {
		t.Fatalf("health detail = %q, want the shutdown reason", health.Detail)
	}
	if _, err := client.Get("http://" + addr + "/healthz"); err == nil {
		t.Fatalf("the health socket still answers after Serve returned, want the listener closed")
	}
}

func TestServeReportsABindFailureInsteadOfClaimingReadiness(t *testing.T) {
	state := NewState(func(context.Context) error { return nil })
	blocker, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("occupy a local address: %v", err)
	}
	defer blocker.Close()

	// A timeout keeps the test honest if the second bind unexpectedly succeeds.
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	err = state.Serve(ctx, blocker.Addr().String())
	if err == nil {
		t.Fatalf("Serve bound an address that was already taken, want a bind failure")
	}
	if !strings.Contains(err.Error(), "health: bind") {
		t.Fatalf("Serve error = %v, want it to name the address it could not bind", err)
	}
	health := state.Snapshot()["health"]
	if health.Ready {
		t.Fatalf("health component = %+v after a failed bind, want not-ready", health)
	}
	if health.Detail == "" {
		t.Fatalf("health detail is empty, want the bind error recorded for the readiness answer")
	}
}

func waitForBoundHealthListener(t *testing.T, state *State, errs <-chan error) string {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for {
		if health, ok := state.Snapshot()["health"]; ok && health.Ready && health.Detail != "" {
			return health.Detail
		}
		select {
		case err := <-errs:
			t.Fatalf("Serve returned %v before reporting a bound listener, want the health component ready with its address", err)
		default:
		}
		if time.Now().After(deadline) {
			t.Fatalf("the health component stayed %v for 5s, want Serve to mark it ready with the bound address", state.Snapshot()["health"])
		}
		time.Sleep(5 * time.Millisecond)
	}
}

type readyResponse struct {
	Status     string               `json:"status"`
	Components map[string]Component `json:"components"`
	Order      []string             `json:"order"`
}

func decodeReady(t *testing.T, rec *httptest.ResponseRecorder) readyResponse {
	t.Helper()
	if got := rec.Header().Get("Content-Type"); got != "application/json" {
		t.Fatalf("content-type = %q, want application/json", got)
	}
	var body readyResponse
	decodeBody(t, rec.Body.Bytes(), &body)
	if !sort.StringsAreSorted(body.Order) {
		t.Fatalf("order = %v, want the component names sorted", body.Order)
	}
	return body
}

func decodeBody(t *testing.T, raw []byte, target any) {
	t.Helper()
	if err := json.Unmarshal(raw, target); err != nil {
		t.Fatalf("decode %q as JSON: %v", raw, err)
	}
}
