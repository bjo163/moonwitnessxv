package radsec

import (
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/json"
	"encoding/pem"
	"errors"
	"io"
	"log/slog"
	"math/big"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"layeh.com/radius"
	"layeh.com/radius/rfc2865"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/arsy"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/health"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/radiusd"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/secrets"
)

// Every value below is synthetic: the certificate material exists only inside one
// test's temporary directory, the names use the reserved .invalid TLD, and the
// shared secret is a string this file wrote.
const (
	serverName     = "radsec.test.invalid"
	fakeNASID      = "synthetic-nas-a"
	fakeSecretRef  = "nas-a.secret"
	fakeSecret     = "test-nas-secret-value"
	fakeSubscriber = "synthetic-user"
	fakeCredential = "synthetic-credential"
	fakeSessionKey = "synthetic-session-1"
)

// authority is one test CA: its key signs leaves and its PEM is what a peer trusts.
type authority struct {
	cert   *x509.Certificate
	key    *ecdsa.PrivateKey
	pem    []byte
	serial int64
}

type leafSpec struct {
	commonName  string
	dnsNames    []string
	extKeyUsage []x509.ExtKeyUsage
	notBefore   time.Time
	notAfter    time.Time
}

func newAuthority(t *testing.T, commonName string) *authority {
	t.Helper()
	now := time.Now()
	key := newKey(t)
	template := &x509.Certificate{
		SerialNumber:          big.NewInt(1),
		Subject:               pkix.Name{CommonName: commonName},
		NotBefore:             now.Add(-time.Hour),
		NotAfter:              now.Add(48 * time.Hour),
		KeyUsage:              x509.KeyUsageCertSign | x509.KeyUsageCRLSign,
		BasicConstraintsValid: true,
		IsCA:                  true,
	}
	der, err := x509.CreateCertificate(rand.Reader, template, template, &key.PublicKey, key)
	if err != nil {
		t.Fatalf("create CA %q: %v", commonName, err)
	}
	cert, err := x509.ParseCertificate(der)
	if err != nil {
		t.Fatalf("parse CA %q: %v", commonName, err)
	}
	return &authority{cert: cert, key: key, pem: encodePEM("CERTIFICATE", der)}
}

// issue writes one leaf under the authority and returns its PEM pair.
func (a *authority) issue(t *testing.T, spec leafSpec) (certPEM, keyPEM []byte) {
	t.Helper()
	a.serial++
	key := newKey(t)
	template := &x509.Certificate{
		SerialNumber: big.NewInt(100 + a.serial),
		Subject:      pkix.Name{CommonName: spec.commonName},
		DNSNames:     spec.dnsNames,
		NotBefore:    spec.notBefore,
		NotAfter:     spec.notAfter,
		KeyUsage:     x509.KeyUsageDigitalSignature,
		ExtKeyUsage:  spec.extKeyUsage,
	}
	der, err := x509.CreateCertificate(rand.Reader, template, a.cert, &key.PublicKey, a.key)
	if err != nil {
		t.Fatalf("issue leaf %q: %v", spec.commonName, err)
	}
	encodedKey, err := x509.MarshalECPrivateKey(key)
	if err != nil {
		t.Fatalf("marshal leaf %q key: %v", spec.commonName, err)
	}
	return encodePEM("CERTIFICATE", der), encodePEM("EC PRIVATE KEY", encodedKey)
}

func newKey(t *testing.T) *ecdsa.PrivateKey {
	t.Helper()
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatalf("generate key: %v", err)
	}
	return key
}

func encodePEM(kind string, der []byte) []byte {
	return pem.EncodeToMemory(&pem.Block{Type: kind, Bytes: der})
}

// pki is the whole certificate world one RadSec test needs.
type pki struct {
	dir           string
	caPEM         []byte
	server        Material
	expired       Material
	notYetValid   Material
	bundleless    Material
	missingCA     Material
	mismatched    Material
	trustedClient tls.Certificate
	rogueClient   tls.Certificate
}

func newPKI(t *testing.T) *pki {
	t.Helper()
	dir := t.TempDir()
	now := time.Now()
	trusted := newAuthority(t, "synthetic-radsec-ca")
	rogue := newAuthority(t, "synthetic-rogue-ca")

	certPEM, keyPEM := trusted.issue(t, leafSpec{
		commonName:  serverName,
		dnsNames:    []string{serverName},
		extKeyUsage: []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		notBefore:   now.Add(-time.Hour),
		notAfter:    now.Add(24 * time.Hour),
	})
	certFile := writeFile(t, dir, "server.crt", certPEM)
	keyFile := writeFile(t, dir, "server.key", keyPEM)
	caFile := writeFile(t, dir, "ca.pem", trusted.pem)

	// Both broken leaves reuse a readable key pair so only the validity window can
	// be what ServerConfig refuses.
	expiredCert, expiredKey := trusted.issue(t, leafSpec{
		commonName:  serverName,
		dnsNames:    []string{serverName},
		extKeyUsage: []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		notBefore:   now.Add(-48 * time.Hour),
		notAfter:    now.Add(-24 * time.Hour),
	})
	futureCert, futureKey := trusted.issue(t, leafSpec{
		commonName:  serverName,
		dnsNames:    []string{serverName},
		extKeyUsage: []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		notBefore:   now.Add(24 * time.Hour),
		notAfter:    now.Add(48 * time.Hour),
	})
	rogueCert, rogueKey := rogue.issue(t, leafSpec{
		commonName:  "synthetic-rogue-nas",
		extKeyUsage: []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth},
		notBefore:   now.Add(-time.Hour),
		notAfter:    now.Add(24 * time.Hour),
	})
	trustedClientCert, trustedClientKey := trusted.issue(t, leafSpec{
		commonName:  "synthetic-nas-client",
		extKeyUsage: []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth},
		notBefore:   now.Add(-time.Hour),
		notAfter:    now.Add(24 * time.Hour),
	})

	return &pki{
		dir:    dir,
		caPEM:  trusted.pem,
		server: Material{CertFile: certFile, KeyFile: keyFile, CAFile: caFile},
		expired: Material{
			CertFile: writeFile(t, dir, "expired.crt", expiredCert),
			KeyFile:  writeFile(t, dir, "expired.key", expiredKey),
			CAFile:   caFile,
		},
		notYetValid: Material{
			CertFile: writeFile(t, dir, "future.crt", futureCert),
			KeyFile:  writeFile(t, dir, "future.key", futureKey),
			CAFile:   caFile,
		},
		bundleless: Material{
			CertFile: certFile,
			KeyFile:  keyFile,
			CAFile:   writeFile(t, dir, "no-ca.pem", []byte("this mounted file holds no certificate\n")),
		},
		missingCA: Material{CertFile: certFile, KeyFile: keyFile, CAFile: filepath.Join(dir, "absent-ca.pem")},
		mismatched: Material{
			CertFile: certFile,
			KeyFile:  writeFile(t, dir, "other.key", rogueKey),
			CAFile:   caFile,
		},
		trustedClient: clientCertificate(t, trustedClientCert, trustedClientKey),
		rogueClient:   clientCertificate(t, rogueCert, rogueKey),
	}
}

func clientCertificate(t *testing.T, certPEM, keyPEM []byte) tls.Certificate {
	t.Helper()
	cert, err := tls.X509KeyPair(certPEM, keyPEM)
	if err != nil {
		t.Fatalf("build client certificate: %v", err)
	}
	return cert
}

func writeFile(t *testing.T, dir, name string, data []byte) string {
	t.Helper()
	path := filepath.Join(dir, name)
	if err := os.WriteFile(path, data, 0o600); err != nil {
		t.Fatalf("write %s: %v", name, err)
	}
	return path
}

func certPool(t *testing.T, bundle []byte) *x509.CertPool {
	t.Helper()
	pool := x509.NewCertPool()
	if !pool.AppendCertsFromPEM(bundle) {
		t.Fatalf("test trust bundle holds no PEM certificate")
	}
	return pool
}

// mountSecrets writes the NAS secret file the runtime is allowed to read.
func mountSecrets(t *testing.T, values map[string]string) *secrets.Store {
	t.Helper()
	dir := t.TempDir()
	for name, value := range values {
		writeFile(t, dir, name, []byte(value+"\n"))
	}
	store, err := secrets.NewStore(dir, 16, time.Minute)
	if err != nil {
		t.Fatalf("open secret store: %v", err)
	}
	return store
}

// fakeARSY is the D20 service the test runtime is pointed at. It speaks the same
// envelope as ARSY and records every call, so a test can prove both what the
// transport answered and what it asked for.
type fakeARSY struct {
	mu            sync.Mutex
	server        *httptest.Server
	resolveStatus int
	decision      string
	calls         []string
}

func newFakeARSY(t *testing.T) *fakeARSY {
	t.Helper()
	f := &fakeARSY{resolveStatus: http.StatusOK, decision: "accept"}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/v1/isp-radius/nas/resolve", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			NASID string `json:"nasId"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		status, payload := f.resolveAnswer()
		f.note("resolve " + body.NASID)
		writeEnvelope(w, status, payload)
	})
	mux.HandleFunc("POST /api/v1/isp-radius/authorize", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			NASID    string `json:"nasId"`
			Username string `json:"username"`
			Password string `json:"password"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		f.note("authorize " + body.NASID + "|" + body.Username + "|" + body.Password)
		writeEnvelope(w, http.StatusOK, f.authorizeAnswer(body.Username, body.Password))
	})
	mux.HandleFunc("POST /api/v1/isp-radius/accounting", func(w http.ResponseWriter, r *http.Request) {
		var body arsy.AccountingRequest
		_ = json.NewDecoder(r.Body).Decode(&body)
		f.note("accounting " + body.NASID)
		writeEnvelope(w, http.StatusOK, arsy.AccountingReceipt{Acknowledged: true, EventKey: body.EventKey})
	})

	f.server = httptest.NewServer(mux)
	t.Cleanup(f.server.Close)
	return f
}

func (f *fakeARSY) resolveAnswer() (int, any) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.resolveStatus >= 400 {
		return f.resolveStatus, nil
	}
	return http.StatusOK, arsy.NASResolution{
		Resolved:      true,
		TenantRef:     "tenant-a",
		NASRef:        "nas-ref-a",
		NASID:         fakeNASID,
		NASAddress:    "127.0.0.1",
		SecretRef:     fakeSecretRef,
		RadSecEnabled: true,
	}
}

func (f *fakeARSY) authorizeAnswer(username, password string) any {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.decision != "accept" || username != fakeSubscriber || password != fakeCredential {
		return arsy.Authorization{Decision: "reject"}
	}
	return arsy.Authorization{
		Decision:   "accept",
		Attributes: arsy.ProfileAttributes{SessionLimit: 2, UploadKbps: 512, DownloadKbps: 2048},
	}
}

func (f *fakeARSY) note(call string) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.calls = append(f.calls, call)
}

// unresolved makes the resolve route answer like an ARSY that is not serving.
func (f *fakeARSY) unresolved(status int) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.resolveStatus = status
}

func (f *fakeARSY) decide(decision string) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.decision = decision
}

func (f *fakeARSY) recorded() []string {
	f.mu.Lock()
	defer f.mu.Unlock()
	return append([]string(nil), f.calls...)
}

func (f *fakeARSY) client(t *testing.T) *arsy.Client {
	t.Helper()
	client, err := arsy.NewClient(f.server.URL, "synthetic-d00-service-key", 2*time.Second)
	if err != nil {
		t.Fatalf("build ARSY client: %v", err)
	}
	return client
}

// writeEnvelope emits the ARSY response shape, error shape included, so the
// adapter's failure classification is exercised rather than bypassed.
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

// newHandler wires the shared RADIUS runtime behind the listener. MsgAuth stays
// "disabled" so an assertion about the transport is not about the digest policy.
func newHandler(t *testing.T, fake *fakeARSY) *radiusd.Handler {
	t.Helper()
	handler, err := radiusd.NewHandler(radiusd.Deps{
		ARSY:    fake.client(t),
		Secrets: mountSecrets(t, map[string]string{fakeSecretRef: fakeSecret}),
		MsgAuth: "disabled",
		Log:     discardLogger(),
	})
	if err != nil {
		t.Fatalf("build handler: %v", err)
	}
	return handler
}

func discardLogger() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

// accessRequest builds one Access-Request the way a NAS does: the credential is
// protected with the shared secret before the packet goes on the wire.
func accessRequest(t *testing.T, secret []byte, nasID, username, password string) []byte {
	t.Helper()
	pkt := radius.New(radius.CodeAccessRequest, secret)
	if err := rfc2865.NASIdentifier_SetString(pkt, nasID); err != nil {
		t.Fatalf("set NAS-Identifier: %v", err)
	}
	if err := rfc2865.UserName_SetString(pkt, username); err != nil {
		t.Fatalf("set User-Name: %v", err)
	}
	if err := rfc2865.UserPassword_AddString(pkt, password); err != nil {
		t.Fatalf("set User-Password: %v", err)
	}
	raw, err := pkt.Encode()
	if err != nil {
		t.Fatalf("encode Access-Request: %v", err)
	}
	return raw
}

func newListener(t *testing.T, fake *fakeARSY, config *tls.Config, state *health.State) *Listener {
	t.Helper()
	return &Listener{
		Addr:    "127.0.0.1:0",
		Config:  config,
		Handler: newHandler(t, fake),
		State:   state,
		Log:     discardLogger(),
	}
}

// serverConfig builds the TLS material a healthy test needs and fails the test if
// the fixture itself would not open.
func serverConfig(t *testing.T, material Material) *tls.Config {
	t.Helper()
	config, err := material.ServerConfig()
	if err != nil {
		t.Fatalf("ServerConfig with valid material: %v", err)
	}
	return config
}

// serve binds a listener over the given material and shared handler.
func serve(t *testing.T, pki *pki, fake *fakeARSY, state *health.State) *running {
	t.Helper()
	return start(t, newListener(t, fake, serverConfig(t, pki.server), state))
}

// absentPath names a path inside dir that deliberately does not exist.
func absentPath(dir, name string) string {
	return filepath.Join(dir, "absent-"+name)
}

// running is a listener that has bound, plus the means to stop it and the answer
// Serve gave when it stopped.
type running struct {
	addr     string
	listener *Listener
	cancel   context.CancelFunc
	stopped  chan struct{}
	err      error
}

func start(t *testing.T, l *Listener) *running {
	t.Helper()
	ctx, cancel := context.WithCancel(context.Background())
	r := &running{listener: l, cancel: cancel, stopped: make(chan struct{})}
	go func() {
		r.err = l.Serve(ctx)
		close(r.stopped)
	}()
	t.Cleanup(func() {
		cancel()
		select {
		case <-r.stopped:
		case <-time.After(5 * time.Second):
			t.Errorf("Serve was still running five seconds after its context was cancelled")
		}
	})

	deadline := time.Now().Add(5 * time.Second)
	for {
		select {
		case <-r.stopped:
			t.Fatalf("Serve stopped before binding: %v", r.err)
		default:
		}
		if addr := l.BoundAddr(); addr != "" {
			r.addr = addr
			return r
		}
		if time.Now().After(deadline) {
			t.Fatalf("Serve never published a bound address")
		}
		time.Sleep(2 * time.Millisecond)
	}
}

// clientConfig is one RadSec peer: it always verifies the server against the CA
// bundle by name, and it presents exactly the certificate the test chose. Nothing
// here skips certificate validation.
func clientConfig(roots *x509.CertPool, present *tls.Certificate) *tls.Config {
	config := &tls.Config{RootCAs: roots, ServerName: serverName, MinVersion: tls.VersionTLS12}
	if present != nil {
		// Naming the leaf through the callback makes the peer send it even when the
		// server advertises only other CAs, so a refusal is about the chain offered.
		config.GetClientCertificate = func(*tls.CertificateRequestInfo) (*tls.Certificate, error) {
			return present, nil
		}
	}
	return config
}

// dial opens one RadSec connection to addr.
func dial(t *testing.T, addr string, config *tls.Config) (*tls.Conn, error) {
	t.Helper()
	return tls.Dial("tcp", addr, config)
}

func (r *running) dialTrusted(t *testing.T, pki *pki) *tls.Conn {
	t.Helper()
	conn, err := dial(t, r.addr, clientConfig(certPool(t, pki.caPEM), &pki.trustedClient))
	if err != nil {
		t.Fatalf("dial %s as a trusted NAS: %v", r.addr, err)
	}
	t.Cleanup(func() { _ = conn.Close() })
	return conn
}

// expectRefused proves the handshake never produced a usable session and reports
// why the peer was turned away.
func expectRefused(t *testing.T, addr string, config *tls.Config, claim string) error {
	t.Helper()
	conn, err := dial(t, addr, config)
	if err == nil {
		// TLS 1.3 can deliver the server's rejection after the client finished its
		// half of the handshake, so read once to surface it.
		if err = conn.SetReadDeadline(time.Now().Add(3 * time.Second)); err != nil {
			_ = conn.Close()
			t.Fatalf("set read deadline: %v", err)
		}
		_, err = conn.Read(make([]byte, 1))
		_ = conn.Close()
	}
	if err == nil {
		t.Fatalf("%s: the listener kept the session open, want the handshake refused", claim)
	}
	t.Logf("%s refused: %v", claim, err)
	return err
}

// expectSilence proves the runtime said nothing back on this connection.
func expectSilence(t *testing.T, conn *tls.Conn) {
	t.Helper()
	if err := conn.SetReadDeadline(time.Now().Add(750 * time.Millisecond)); err != nil {
		t.Fatalf("set read deadline: %v", err)
	}
	read, err := conn.Read(make([]byte, 2))
	if err == nil {
		t.Fatalf("the peer sent %d bytes although it had no decision, want silence", read)
	}
	if read != 0 {
		t.Fatalf("the peer returned %d bytes with no reply, want none at all", read)
	}
	var netErr net.Error
	if errors.As(err, &netErr) && netErr.Timeout() {
		return
	}
	if errors.Is(err, io.EOF) || errors.Is(err, io.ErrUnexpectedEOF) {
		return
	}
	t.Fatalf("reading from the peer: %v, want a timeout or a closed connection", err)
}
