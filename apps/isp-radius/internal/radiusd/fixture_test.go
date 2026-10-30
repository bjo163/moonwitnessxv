package radiusd

import (
	"encoding/json"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"layeh.com/radius"
	"layeh.com/radius/rfc2865"
	"layeh.com/radius/rfc2866"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/arsy"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/secrets"
)

// The fixture material below is synthetic: the secret exists only inside a test's
// temporary directory, never in a repository file or a log line.
const (
	fakeNASID       = "synthetic-nas-a"
	fakeOtherNASID  = "synthetic-nas-b"
	fakeSecret      = "test-nas-secret-value"
	fakeWrongSecret = "wrong-nas-secret-value"
	fakeSubscriber  = "synthetic-user"
	fakeCredential  = "synthetic-credential"
	fakeSessionKey  = "synthetic-session-1"
	fakeActionID    = "action-1"
)

// fakeARSY is the D20 service the runtime is pointed at during tests. It speaks
// the same envelope as ARSY and records what the runtime asked for, so a test can
// prove both the protocol answer and the durable call behind it.
type fakeARSY struct {
	mu              sync.Mutex
	server          *httptest.Server
	resolveFunc     func(nasID string) (int, any)
	authorizeFunc   func(nasID, username, password string) (int, any)
	accountingFunc  func(arsy.AccountingRequest) (int, any)
	actionsFunc     func(nasID string) (int, any)
	reportFunc      func(arsy.ActionResult) (int, any)
	healthStatus    int
	apiKeysSeen     []string
	authorizeCalls  []string
	accountingEvts  []arsy.AccountingRequest
	reportedActions []arsy.ActionResult
}

func newFakeARSY(t *testing.T) *fakeARSY {
	t.Helper()
	f := &fakeARSY{healthStatus: http.StatusOK}
	f.resolveFunc = func(nasID string) (int, any) {
		if nasID != fakeNASID {
			return http.StatusOK, map[string]any{"resolved": false}
		}
		return http.StatusOK, arsy.NASResolution{
			Resolved:   true,
			TenantRef:  "tenant-a",
			NASRef:     "nas-ref-a",
			NASID:      fakeNASID,
			NASAddress: "127.0.0.1",
			SecretRef:  "nas-a.secret",
		}
	}
	f.authorizeFunc = func(_, username, password string) (int, any) {
		if username != fakeSubscriber || password != fakeCredential {
			return http.StatusOK, arsy.Authorization{Decision: "reject"}
		}
		return http.StatusOK, arsy.Authorization{
			Decision:   "accept",
			Attributes: arsy.ProfileAttributes{SessionLimit: 2, UploadKbps: 512, DownloadKbps: 2048},
		}
	}
	f.accountingFunc = func(req arsy.AccountingRequest) (int, any) {
		return http.StatusOK, arsy.AccountingReceipt{Acknowledged: true, EventKey: req.EventKey}
	}
	f.actionsFunc = func(string) (int, any) { return http.StatusOK, []arsy.SessionAction{} }
	f.reportFunc = func(arsy.ActionResult) (int, any) { return http.StatusOK, map[string]any{"state": "ack"} }

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/v1/isp-radius/nas/resolve", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			NASID string `json:"nasId"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		f.recordKey(r)
		status, data := f.resolveFunc(body.NASID)
		writeEnvelope(w, status, data)
	})
	mux.HandleFunc("POST /api/v1/isp-radius/authorize", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			NASID    string `json:"nasId"`
			Username string `json:"username"`
			Password string `json:"password"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		f.recordKey(r)
		f.mu.Lock()
		f.authorizeCalls = append(f.authorizeCalls, body.NASID+"|"+body.Username+"|"+body.Password)
		f.mu.Unlock()
		status, data := f.authorizeFunc(body.NASID, body.Username, body.Password)
		writeEnvelope(w, status, data)
	})
	mux.HandleFunc("POST /api/v1/isp-radius/accounting", func(w http.ResponseWriter, r *http.Request) {
		var body arsy.AccountingRequest
		_ = json.NewDecoder(r.Body).Decode(&body)
		f.recordKey(r)
		f.mu.Lock()
		f.accountingEvts = append(f.accountingEvts, body)
		f.mu.Unlock()
		status, data := f.accountingFunc(body)
		writeEnvelope(w, status, data)
	})
	mux.HandleFunc("GET /api/v1/isp-radius/session-actions", func(w http.ResponseWriter, r *http.Request) {
		f.recordKey(r)
		status, data := f.actionsFunc(r.URL.Query().Get("nasId"))
		writeEnvelope(w, status, data)
	})
	mux.HandleFunc("POST /api/v1/isp-radius/session-actions", func(w http.ResponseWriter, r *http.Request) {
		var body arsy.ActionResult
		_ = json.NewDecoder(r.Body).Decode(&body)
		f.recordKey(r)
		f.mu.Lock()
		f.reportedActions = append(f.reportedActions, body)
		f.mu.Unlock()
		status, data := f.reportFunc(body)
		writeEnvelope(w, status, data)
	})
	mux.HandleFunc("GET /api/v1/health/ready", func(w http.ResponseWriter, _ *http.Request) {
		if f.healthStatus != http.StatusOK {
			w.Header().Set("content-type", "application/json")
			w.WriteHeader(f.healthStatus)
			_, _ = w.Write([]byte(`{"ok":false}`))
			return
		}
		writeEnvelope(w, http.StatusOK, map[string]any{"status": "ready"})
	})

	f.server = httptest.NewServer(mux)
	t.Cleanup(f.server.Close)
	return f
}

func (f *fakeARSY) recordKey(r *http.Request) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.apiKeysSeen = append(f.apiKeysSeen, r.Header.Get("x-api-key"))
}

func (f *fakeARSY) client(t *testing.T) *arsy.Client {
	t.Helper()
	client, err := arsy.NewClient(f.server.URL, "synthetic-d00-service-key", 2*time.Second)
	if err != nil {
		t.Fatalf("build ARSY client: %v", err)
	}
	return client
}

func (f *fakeARSY) keys() []string {
	f.mu.Lock()
	defer f.mu.Unlock()
	return append([]string(nil), f.apiKeysSeen...)
}

func (f *fakeARSY) reports() []arsy.ActionResult {
	f.mu.Lock()
	defer f.mu.Unlock()
	return append([]arsy.ActionResult(nil), f.reportedActions...)
}

func (f *fakeARSY) events() []arsy.AccountingRequest {
	f.mu.Lock()
	defer f.mu.Unlock()
	return append([]arsy.AccountingRequest(nil), f.accountingEvts...)
}

func (f *fakeARSY) authorizations() []string {
	f.mu.Lock()
	defer f.mu.Unlock()
	return append([]string(nil), f.authorizeCalls...)
}

// writeEnvelope emits the same shape as the ARSY response envelope, including the
// error shape, so the adapter's failure classification is exercised rather than
// bypassed.
func writeEnvelope(w http.ResponseWriter, status int, data any) {
	w.Header().Set("content-type", "application/json")
	w.WriteHeader(status)
	if status >= 400 {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ok":    false,
			"error": map[string]any{"statusCode": status, "message": "synthetic ARSY failure"},
		})
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]any{"ok": true, "data": data})
}

// mountSecrets writes the NAS secret files a test's runtime may read.
func mountSecrets(t *testing.T, values map[string]string) *secrets.Store {
	t.Helper()
	dir := t.TempDir()
	for name, value := range values {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(value+"\n"), 0o600); err != nil {
			t.Fatalf("mount secret %q: %v", name, err)
		}
	}
	store, err := secrets.NewStore(dir, 16, time.Minute)
	if err != nil {
		t.Fatalf("open secret store: %v", err)
	}
	return store
}

// newTestHandler wires a handler against the fake ARSY and mounted secrets.
func newTestHandler(t *testing.T, fake *fakeARSY, store *secrets.Store, msgAuth string) *Handler {
	t.Helper()
	handler, err := NewHandler(Deps{
		ARSY:    fake.client(t),
		Secrets: store,
		MsgAuth: msgAuth,
		Log:     discardLogger(),
	})
	if err != nil {
		t.Fatalf("build handler: %v", err)
	}
	return handler
}

// accessPacket builds an Access-Request the way a NAS does: the credential is
// protected with the shared secret before the packet goes on the wire.
func accessPacket(t *testing.T, secret []byte, nasID, username, password string) []byte {
	t.Helper()
	pkt := radius.New(radius.CodeAccessRequest, secret)
	setAttr(t, rfc2865.NASIdentifier_SetString(pkt, nasID), "NAS-Identifier")
	setAttr(t, rfc2865.UserName_SetString(pkt, username), "User-Name")
	if password != "" {
		setAttr(t, rfc2865.UserPassword_AddString(pkt, password), "User-Password")
	}
	return encodePacket(t, pkt)
}

// accountingPacket builds an Accounting-Request, whose digest binds the shared
// secret to the packet. delay carries Acct-Delay-Time, which a NAS retransmission
// changes and the idempotency key must ignore.
func accountingPacket(t *testing.T, secret []byte, nasID, username, sessionKey string, status rfc2866.AcctStatusType, seconds, input, output, delay uint32) []byte {
	t.Helper()
	pkt := radius.New(radius.CodeAccountingRequest, secret)
	setAttr(t, rfc2865.NASIdentifier_SetString(pkt, nasID), "NAS-Identifier")
	setAttr(t, rfc2865.UserName_SetString(pkt, username), "User-Name")
	setAttr(t, rfc2866.AcctSessionID_SetString(pkt, sessionKey), "Acct-Session-Id")
	setAttr(t, rfc2866.AcctStatusType_Set(pkt, status), "Acct-Status-Type")
	setAttr(t, rfc2866.AcctSessionTime_Set(pkt, rfc2866.AcctSessionTime(seconds)), "Acct-Session-Time")
	setAttr(t, rfc2866.AcctInputOctets_Set(pkt, rfc2866.AcctInputOctets(input)), "Acct-Input-Octets")
	setAttr(t, rfc2866.AcctOutputOctets_Set(pkt, rfc2866.AcctOutputOctets(output)), "Acct-Output-Octets")
	if delay > 0 {
		setAttr(t, rfc2866.AcctDelayTime_Set(pkt, rfc2866.AcctDelayTime(delay)), "Acct-Delay-Time")
	}
	return encodePacket(t, pkt)
}

func setAttr(t *testing.T, err error, name string) {
	t.Helper()
	if err != nil {
		t.Fatalf("set %s: %v", name, err)
	}
}

func encodePacket(t *testing.T, pkt *radius.Packet) []byte {
	t.Helper()
	raw, err := pkt.Encode()
	if err != nil {
		t.Fatalf("encode packet: %v", err)
	}
	return raw
}

func parseReply(t *testing.T, raw, request, secret []byte) *radius.Packet {
	t.Helper()
	if len(raw) == 0 {
		t.Fatalf("expected a reply, got none")
	}
	if !radius.IsAuthenticResponse(raw, request, secret) {
		t.Fatalf("reply does not carry a valid authenticator for the request")
	}
	pkt, err := radius.Parse(raw, secret)
	if err != nil {
		t.Fatalf("parse reply: %v", err)
	}
	return pkt
}

// requestTypes lists the attribute types a peer actually received, which is how a
// test proves what the runtime put on the wire rather than what it meant to.
func requestTypes(pkt *radius.Packet) []radius.Type {
	types := make([]radius.Type, 0, len(pkt.Attributes))
	for _, avp := range pkt.Attributes {
		types = append(types, avp.Type)
	}
	return types
}

// fakeNAS is a UDP peer that answers Dynamic Authorization requests the way a NAS
// does: with an ACK, with a NAK, or with nothing at all.
type fakeNAS struct {
	conn     net.PacketConn
	addr     string
	secret   []byte
	respond  func(request *radius.Packet) radius.Code
	forge    func(request *radius.Packet) []byte
	mu       sync.Mutex
	received []radius.Packet
}

// startFakeNAS binds a synthetic NAS on an ephemeral loopback port; the test aims
// the CoA sender at that port.
func startFakeNAS(t *testing.T, secret []byte, respond func(*radius.Packet) radius.Code) *fakeNAS {
	t.Helper()
	nas := bindFakeNAS(t, secret)
	nas.respond = respond
	go nas.serve()
	return nas
}

// startForgingNAS answers with bytes the test controls, which is how a wrong
// response digest is simulated.
func startForgingNAS(t *testing.T, secret []byte, forge func(*radius.Packet) []byte) *fakeNAS {
	t.Helper()
	nas := bindFakeNAS(t, secret)
	nas.forge = forge
	go nas.serve()
	return nas
}

func bindFakeNAS(t *testing.T, secret []byte) *fakeNAS {
	t.Helper()
	conn, err := net.ListenPacket("udp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("bind fake NAS: %v", err)
	}
	nas := &fakeNAS{conn: conn, addr: conn.LocalAddr().String(), secret: secret}
	t.Cleanup(func() { _ = conn.Close() })
	return nas
}

func (n *fakeNAS) serve() {
	buffer := make([]byte, radius.MaxPacketLength)
	for {
		read, peer, err := n.conn.ReadFrom(buffer)
		if err != nil {
			return
		}
		request, err := radius.Parse(buffer[:read], n.secret)
		if err != nil {
			continue
		}
		n.mu.Lock()
		n.received = append(n.received, *request)
		n.mu.Unlock()
		var encoded []byte
		switch {
		case n.forge != nil:
			encoded = n.forge(request)
		case n.respond != nil:
			if code := n.respond(request); code != 0 {
				encoded, _ = request.Response(code).Encode()
			}
		}
		if len(encoded) > 0 {
			_, _ = n.conn.WriteTo(encoded, peer)
		}
	}
}

func (n *fakeNAS) port(t *testing.T) int {
	t.Helper()
	_, portString, err := net.SplitHostPort(n.addr)
	if err != nil {
		t.Fatalf("split fake NAS address %q: %v", n.addr, err)
	}
	port, err := strconv.Atoi(portString)
	if err != nil {
		t.Fatalf("fake NAS port %q: %v", portString, err)
	}
	return port
}

func (n *fakeNAS) requests() []radius.Packet {
	n.mu.Lock()
	defer n.mu.Unlock()
	return append([]radius.Packet(nil), n.received...)
}

func (n *fakeNAS) awaitRequest(t *testing.T, within time.Duration) radius.Packet {
	t.Helper()
	deadline := time.Now().Add(within)
	for time.Now().Before(deadline) {
		if got := n.requests(); len(got) > 0 {
			return got[0]
		}
		time.Sleep(5 * time.Millisecond)
	}
	t.Fatalf("no Dynamic Authorization request reached the fake NAS within %s", within)
	return radius.Packet{}
}

func discardLogger() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

func mustContain(t *testing.T, value, want, message string) {
	t.Helper()
	if !strings.Contains(value, want) {
		t.Fatalf("%s: got %q, want it to contain %q", message, value, want)
	}
}
