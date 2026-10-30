package arsy

import (
	"context"
	"encoding/json"
	"errors"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"
)

// The credential below is synthetic and exists only inside one test process.
const (
	fakeServiceKey = "synthetic-d00-service-key"
	fakeNASID      = "synthetic-nas-a"
	fakeSubscriber = "synthetic-user"
	fakeCredential = "synthetic-credential"
	fakeEventKey   = "synthetic-event-1"
)

// recordedCall is one request the adapter put on the wire, which is how a test
// proves the route, the credential header and the body shape.
type recordedCall struct {
	Method string
	Path   string
	Query  string
	APIKey string
	Body   map[string]any
}

// fakeService is the ARSY D20 surface the adapter is pointed at during tests.
type fakeService struct {
	mu    sync.Mutex
	calls []recordedCall
	// replyFor maps a route (method + path) to the answer the adapter receives.
	replyFor map[string]func(w http.ResponseWriter)
	server   *httptest.Server
}

func newFakeService(t *testing.T) *fakeService {
	t.Helper()
	f := &fakeService{replyFor: map[string]func(http.ResponseWriter){}}
	f.server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var body map[string]any
		_ = json.NewDecoder(r.Body).Decode(&body)
		f.mu.Lock()
		f.calls = append(f.calls, recordedCall{
			Method: r.Method, Path: r.URL.Path, Query: r.URL.Query().Get("nasId"),
			APIKey: r.Header.Get("x-api-key"), Body: body,
		})
		handler := f.replyFor[r.Method+" "+r.URL.Path]
		f.mu.Unlock()
		if handler == nil {
			writeData(w, http.StatusOK, map[string]any{"ok": true})
			return
		}
		handler(w)
	}))
	t.Cleanup(f.server.Close)
	f.replyFor["POST /api/v1/isp-radius/nas/resolve"] = func(w http.ResponseWriter) {
		writeData(w, http.StatusOK, NASResolution{
			Resolved: true, TenantRef: "tenant-a", NASRef: "nas-ref-a", NASID: fakeNASID,
			NASAddress: "127.0.0.1", SecretRef: "nas-a.secret", RadSecEnabled: true,
		})
	}
	f.replyFor["POST /api/v1/isp-radius/authorize"] = func(w http.ResponseWriter) {
		writeData(w, http.StatusOK, Authorization{Decision: "reject"})
	}
	f.replyFor["POST /api/v1/isp-radius/accounting"] = func(w http.ResponseWriter) {
		writeData(w, http.StatusOK, AccountingReceipt{Acknowledged: true, EventKey: fakeEventKey})
	}
	f.replyFor["GET /api/v1/isp-radius/session-actions"] = func(w http.ResponseWriter) {
		writeData(w, http.StatusOK, []SessionAction{})
	}
	f.replyFor["POST /api/v1/isp-radius/session-actions"] = func(w http.ResponseWriter) {
		writeData(w, http.StatusOK, map[string]any{"state": "ack"})
	}
	f.replyFor["GET /api/v1/health/ready"] = func(w http.ResponseWriter) {
		writeData(w, http.StatusOK, map[string]any{"status": "ready"})
	}
	return f
}

func (f *fakeService) route(key string, handler func(http.ResponseWriter)) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.replyFor[key] = handler
}

func (f *fakeService) client(t *testing.T) *Client {
	t.Helper()
	client, err := NewClient(f.server.URL, fakeServiceKey, 2*time.Second)
	if err != nil {
		t.Fatalf("build adapter: %v", err)
	}
	return client
}

func (f *fakeService) recorded() []recordedCall {
	f.mu.Lock()
	defer f.mu.Unlock()
	return append([]recordedCall(nil), f.calls...)
}

func writeData(w http.ResponseWriter, status int, data any) {
	w.Header().Set("content-type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{"ok": true, "data": data})
}

func writeFailure(w http.ResponseWriter, status int, message string) {
	w.Header().Set("content-type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok":    false,
		"error": map[string]any{"statusCode": status, "message": message},
	})
}

func TestAdapterRefusesToStartWithoutItsContract(t *testing.T) {
	for _, config := range []struct{ url, key string }{
		{"", fakeServiceKey},
		{"   ", fakeServiceKey},
		{fakeServiceKey, ""},
		{"not-a-url", fakeServiceKey},
		{"/only-a-path", fakeServiceKey},
	} {
		if _, err := NewClient(config.url, config.key, time.Second); err == nil {
			t.Fatalf("base URL %q with key %q built a client, want the adapter to refuse to reach for durable state", config.url, config.key)
		}
	}
}

func TestAdapterReachesTheRoutesUnderARSYsRESTPrefix(t *testing.T) {
	fake := newFakeService(t)
	client := fake.client(t)
	ctx := context.Background()

	if _, err := client.ResolveNAS(ctx, fakeNASID); err != nil {
		t.Fatalf("resolve: %v", err)
	}
	if _, err := client.Authorize(ctx, fakeNASID, fakeSubscriber, fakeCredential); err != nil {
		t.Fatalf("authorize: %v", err)
	}
	if _, err := client.StoreAccounting(ctx, AccountingRequest{NASID: fakeNASID, EventKey: fakeEventKey}); err != nil {
		t.Fatalf("accounting: %v", err)
	}
	if _, err := client.PendingActions(ctx, fakeNASID); err != nil {
		t.Fatalf("pending actions: %v", err)
	}
	if err := client.ReportAction(ctx, ActionResult{NASID: fakeNASID, ActionID: "action-1", Result: "ack"}); err != nil {
		t.Fatalf("report action: %v", err)
	}
	if err := client.Probe(ctx); err != nil {
		t.Fatalf("probe: %v", err)
	}

	calls := fake.recorded()
	want := []string{
		"POST /api/v1/isp-radius/nas/resolve",
		"POST /api/v1/isp-radius/authorize",
		"POST /api/v1/isp-radius/accounting",
		"GET /api/v1/isp-radius/session-actions",
		"POST /api/v1/isp-radius/session-actions",
		"GET /api/v1/health/ready",
	}
	if len(calls) != len(want) {
		t.Fatalf("calls = %d, want %d", len(calls), len(want))
	}
	for i, route := range want {
		got := calls[i].Method + " " + calls[i].Path
		if got != route {
			t.Fatalf("call %d = %q, want %q", i, got, route)
		}
		if calls[i].APIKey != fakeServiceKey {
			t.Fatalf("call %d sent x-api-key %q, want the mounted D00 key on every service call", i, calls[i].APIKey)
		}
	}
	if calls[3].Query != fakeNASID {
		t.Fatalf("pending actions query = %q, want the NAS the runtime serves", calls[3].Query)
	}
	if calls[2].Body["eventKey"] != fakeEventKey {
		t.Fatalf("accounting body = %+v, want the idempotency key ARSY enforces", calls[2].Body)
	}
}

func TestAdapterKeepsAnExplicitGatewayPath(t *testing.T) {
	fake := newFakeService(t)
	client, err := NewClient(fake.server.URL+"/gateway", fakeServiceKey, 0)
	if err != nil {
		t.Fatalf("build adapter: %v", err)
	}
	if client.baseURL != fake.server.URL+"/gateway" {
		t.Fatalf("base = %q, want the configured path kept instead of replaced by the REST prefix", client.baseURL)
	}
	// A zero timeout is not a request that never ends.
	if client.http.Timeout != 4*time.Second {
		t.Fatalf("timeout = %s, want the bounded default", client.http.Timeout)
	}
	if _, err := client.ResolveNAS(context.Background(), fakeNASID); err != nil {
		t.Fatalf("resolve through the gateway path: %v", err)
	}
	if got := fake.recorded()[0].Path; got != "/gateway/isp-radius/nas/resolve" {
		t.Fatalf("path = %q, want the adapter to address the route under the gateway", got)
	}
}

func TestAdapterTrimsTheTrailingSlashFromTheConfiguredOrigin(t *testing.T) {
	client, err := NewClient("https://arsy.test.invalid/", fakeServiceKey, time.Second)
	if err != nil {
		t.Fatalf("build adapter: %v", err)
	}
	if client.baseURL != "https://arsy.test.invalid/api/v1" {
		t.Fatalf("base = %q, want one REST prefix and no doubled slash", client.baseURL)
	}
}

func TestUnresolvedNASAndMissingRecordAreDefinitiveAnswers(t *testing.T) {
	fake := newFakeService(t)
	fake.route("POST /api/v1/isp-radius/nas/resolve", func(w http.ResponseWriter) {
		writeData(w, http.StatusOK, NASResolution{Resolved: false})
	})
	resolution, err := fake.client(t).ResolveNAS(context.Background(), "unknown-nas")
	if err != nil {
		t.Fatalf("resolve: %v", err)
	}
	if resolution.Resolved {
		t.Fatalf("resolution = %+v, want the definitive answer that this NAS is not served", resolution)
	}

	fake.route("POST /api/v1/isp-radius/nas/resolve", func(w http.ResponseWriter) {
		writeFailure(w, http.StatusNotFound, "NAS not found")
	})
	if _, err := fake.client(t).ResolveNAS(context.Background(), "unknown-nas"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("error = %v, want ErrNotFound so the handler denies rather than waits", err)
	}
}

func TestAdapterClassifiesEveryFailureSoTheProtocolFailsClosed(t *testing.T) {
	cases := []struct {
		name   string
		status int
		want   error
	}{
		{"unavailable", http.StatusServiceUnavailable, ErrUnavailable},
		{"server error", http.StatusInternalServerError, ErrUnavailable},
		{"no credential", http.StatusUnauthorized, ErrDenied},
		{"no grant", http.StatusForbidden, ErrDenied},
		{"absent record", http.StatusNotFound, ErrNotFound},
		{"reused key", http.StatusConflict, ErrConflict},
	}
	for _, testCase := range cases {
		t.Run(testCase.name, func(t *testing.T) {
			fake := newFakeService(t)
			fake.route("POST /api/v1/isp-radius/authorize", func(w http.ResponseWriter) {
				writeFailure(w, testCase.status, "synthetic "+testCase.name)
			})
			_, err := fake.client(t).Authorize(context.Background(), fakeNASID, fakeSubscriber, fakeCredential)
			if !errors.Is(err, testCase.want) {
				t.Fatalf("error = %v, want it to classify as %v", err, testCase.want)
			}
		})
	}
}

func TestRejectedRequestNeverEchoesTheCredential(t *testing.T) {
	fake := newFakeService(t)
	fake.route("POST /api/v1/isp-radius/authorize", func(w http.ResponseWriter) {
		writeFailure(w, http.StatusBadRequest, "username is not valid for this tenant")
	})
	_, err := fake.client(t).Authorize(context.Background(), fakeNASID, fakeSubscriber, fakeCredential)
	if err == nil {
		t.Fatalf("want the refused request reported as an error")
	}
	if strings.Contains(err.Error(), fakeCredential) {
		t.Fatalf("error %q leaks the RADIUS credential, which must never reach a log line", err.Error())
	}
	if !strings.Contains(err.Error(), "username is not valid for this tenant") {
		t.Fatalf("error %q drops the answer ARSY gave, want its message preserved for the operator", err.Error())
	}
}

func TestUnexpectedAnswersAreRefusedRatherThanAssumed(t *testing.T) {
	fake := newFakeService(t)
	fake.route("POST /api/v1/isp-radius/authorize", func(w http.ResponseWriter) {
		writeData(w, http.StatusOK, Authorization{Decision: "maybe"})
	})
	if _, err := fake.client(t).Authorize(context.Background(), fakeNASID, fakeSubscriber, fakeCredential); err == nil {
		t.Fatalf("an undecided authorize answer was accepted, want it refused")
	}

	fake.route("POST /api/v1/isp-radius/accounting", func(w http.ResponseWriter) {
		writeData(w, http.StatusOK, AccountingReceipt{Acknowledged: false, EventKey: fakeEventKey})
	})
	if _, err := fake.client(t).StoreAccounting(context.Background(), AccountingRequest{EventKey: fakeEventKey}); err == nil {
		t.Fatalf("an unacknowledged accounting receipt was accepted, want the NAS to be made to retransmit")
	}

	fake.route("POST /api/v1/isp-radius/accounting", func(w http.ResponseWriter) {
		w.Header().Set("content-type", "text/plain")
		_, _ = w.Write([]byte("<html>gateway said no</html>"))
	})
	if _, err := fake.client(t).StoreAccounting(context.Background(), AccountingRequest{EventKey: fakeEventKey}); err == nil {
		t.Fatalf("a non-envelope answer was accepted, want it treated as no answer at all")
	}

	fake.route("POST /api/v1/isp-radius/accounting", func(w http.ResponseWriter) {
		w.Header().Set("content-type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true}`))
	})
	if _, err := fake.client(t).StoreAccounting(context.Background(), AccountingRequest{EventKey: fakeEventKey}); err == nil {
		t.Fatalf("an envelope with no data was accepted, want the write treated as unproven")
	}
}

func TestTransportFailureAndCancellationBothReadAsUnavailable(t *testing.T) {
	// Bind a port and let go of it, so the adapter faces an address that refuses.
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("reserve a port: %v", err)
	}
	address := listener.Addr().String()
	if err := listener.Close(); err != nil {
		t.Fatalf("release the port: %v", err)
	}
	dead, err := NewClient("http://"+address, fakeServiceKey, time.Second)
	if err != nil {
		t.Fatalf("build adapter: %v", err)
	}
	if _, err := dead.ResolveNAS(context.Background(), fakeNASID); !errors.Is(err, ErrUnavailable) {
		t.Fatalf("error = %v, want a dead socket to read as ARSY being unavailable", err)
	}

	another := newFakeService(t)
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := another.client(t).ResolveNAS(ctx, fakeNASID); !errors.Is(err, ErrUnavailable) {
		t.Fatalf("error = %v, want a cancelled call to read as unavailable rather than as an answer", err)
	}
}

func TestPendingActionsCarryTheSessionIdentityTheRuntimeMustAddress(t *testing.T) {
	fake := newFakeService(t)
	fake.route("GET /api/v1/isp-radius/session-actions", func(w http.ResponseWriter) {
		writeData(w, http.StatusOK, []SessionAction{{
			ID: "action-1", ActionKey: "disconnect-1", Action: "disconnect", State: "pending",
			SessionKey: "synthetic-session-1", Username: fakeSubscriber, Attempts: 1,
		}})
	})
	actions, err := fake.client(t).PendingActions(context.Background(), fakeNASID)
	if err != nil {
		t.Fatalf("pending actions: %v", err)
	}
	if len(actions) != 1 {
		t.Fatalf("actions = %+v, want the one recorded instruction", actions)
	}
	// Without these two the CoA-Request cannot name the session (RFC 5176 §3).
	if actions[0].SessionKey == "" || actions[0].Username == "" {
		t.Fatalf("action = %+v, want the session identity the NAS must match", actions[0])
	}
	if actions[0].Attempts != 1 {
		t.Fatalf("attempts = %d, want the retry budget ARSY already spent", actions[0].Attempts)
	}
}

func TestProbeAnswersOnlyWhatARSYActuallySaid(t *testing.T) {
	fake := newFakeService(t)
	if err := fake.client(t).Probe(context.Background()); err != nil {
		t.Fatalf("probe: %v", err)
	}
	fake.route("GET /api/v1/health/ready", func(w http.ResponseWriter) {
		writeFailure(w, http.StatusServiceUnavailable, "db down")
	})
	if err := fake.client(t).Probe(context.Background()); !errors.Is(err, ErrUnavailable) {
		t.Fatalf("error = %v, want readiness to report the upstream it could not reach", err)
	}
}
