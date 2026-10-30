package radsec

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/binary"
	"net"
	"net/http"
	"strconv"
	"strings"
	"testing"
	"time"

	"layeh.com/radius"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/health"
)

func TestServerConfigRefusesAMissingKeyFile(t *testing.T) {
	pki := newPKI(t)
	material := Material{CertFile: pki.server.CertFile, KeyFile: absentPath(pki.dir, "server.key"), CAFile: pki.server.CAFile}

	_, err := material.ServerConfig()
	if err == nil {
		t.Fatalf("ServerConfig opened with the key file %q missing, want refusal", material.KeyFile)
	}
	if !strings.Contains(err.Error(), "load key pair") {
		t.Fatalf("error = %q, want it to name the key pair load as the reason", err)
	}
	if !strings.Contains(err.Error(), "absent-server.key") {
		t.Fatalf("error = %q, want it to name the file it could not read", err)
	}
}

func TestServerConfigRefusesAFileThatIsNotAPrivateKey(t *testing.T) {
	pki := newPKI(t)
	// The CA bundle is readable PEM, so only the absent key block can explain this
	// refusal.
	material := Material{CertFile: pki.server.CertFile, KeyFile: pki.server.CAFile, CAFile: pki.server.CAFile}

	if _, err := material.ServerConfig(); err == nil {
		t.Fatalf("ServerConfig accepted a certificate file standing in for the private key, want refusal")
	} else if !strings.Contains(err.Error(), "load key pair") {
		t.Fatalf("error = %q, want it to name the key pair it could not load", err)
	}
}

func TestServerConfigRefusesAMismatchedKeyPair(t *testing.T) {
	_, err := newPKI(t).mismatched.ServerConfig()
	if err == nil {
		t.Fatalf("ServerConfig accepted a leaf from one key pair and a private key from another, want refusal")
	}
	if !strings.Contains(err.Error(), "load key pair") {
		t.Fatalf("error = %q, want it to name the key pair it could not load", err)
	}
}

func TestServerConfigRefusesAnExpiredLeafCertificate(t *testing.T) {
	pki := newPKI(t)
	_, err := pki.expired.ServerConfig()
	if err == nil {
		t.Fatalf("ServerConfig opened on a leaf whose validity ended in the past, want refusal")
	}
	if !strings.Contains(err.Error(), "expired at") {
		t.Fatalf("error = %q, want it to state that the server certificate expired", err)
	}
	if !strings.Contains(err.Error(), serverName) {
		t.Fatalf("error = %q, want it to name the certificate subject it refused", err)
	}
}

func TestServerConfigRefusesALeafCertificateThatIsNotYetValid(t *testing.T) {
	_, err := newPKI(t).notYetValid.ServerConfig()
	if err == nil {
		t.Fatalf("ServerConfig opened on a leaf that only becomes valid tomorrow, want refusal")
	}
	if !strings.Contains(err.Error(), "not valid before") {
		t.Fatalf("error = %q, want it to state that the certificate is not yet valid", err)
	}
}

func TestServerConfigRefusesACABundleThatHoldsNoCertificate(t *testing.T) {
	pki := newPKI(t)
	_, err := pki.bundleless.ServerConfig()
	if err == nil {
		t.Fatalf("ServerConfig opened with a CA file that proves nothing, want refusal")
	}
	if !strings.Contains(err.Error(), "holds no PEM certificate") {
		t.Fatalf("error = %q, want it to name the bundle holding no certificate as the reason", err)
	}
	if !strings.Contains(err.Error(), "no-ca.pem") {
		t.Fatalf("error = %q, want it to name the bundle file %q", err, pki.bundleless.CAFile)
	}
}

func TestServerConfigRefusesAMissingCAClientBundle(t *testing.T) {
	pki := newPKI(t)
	_, err := pki.missingCA.ServerConfig()
	if err == nil {
		t.Fatalf("ServerConfig opened without a client CA bundle, want refusal")
	}
	if !strings.Contains(err.Error(), "read client CA bundle") {
		t.Fatalf("error = %q, want it to name reading the CA bundle as the step that failed", err)
	}
	if !strings.Contains(err.Error(), "absent-ca.pem") {
		t.Fatalf("error = %q, want it to name the missing bundle file", err)
	}
}

func TestServerConfigDemandsAVerifiableClientCertificate(t *testing.T) {
	config, err := newPKI(t).server.ServerConfig()
	if err != nil {
		t.Fatalf("ServerConfig with valid material: %v", err)
	}
	if config.ClientAuth != tls.RequireAndVerifyClientCert {
		t.Fatalf("ClientAuth = %v, want RequireAndVerifyClientCert: there is no anonymous NAS on this transport", config.ClientAuth)
	}
	if config.ClientCAs == nil {
		t.Fatalf("ClientCAs is nil, want the configured bundle so a peer chain can be verified")
	}
	if len(config.Certificates) != 1 {
		t.Fatalf("certificates = %d, want exactly the one server leaf", len(config.Certificates))
	}
	if config.MinVersion < tls.VersionTLS12 {
		t.Fatalf("MinVersion = %s, want at least TLS 1.2", tlsName(config.MinVersion))
	}
}

func TestReadFramedRefusesLengthsBelowThePacketRange(t *testing.T) {
	for _, size := range []int{0, 1, 19} {
		_, err := readFramed(bytes.NewReader(framingPrefix(size)))
		if err == nil {
			t.Fatalf("readFramed accepted a 2-octet length prefix of %d, want refusal", size)
		}
		if !strings.Contains(err.Error(), "outside the packet range") {
			t.Fatalf("length %d error = %q, want it to name the packet range", size, err)
		}
	}
}

func TestReadFramedRefusesLengthsAboveThePacketRange(t *testing.T) {
	for _, size := range []int{radius.MaxPacketLength + 1, 65535} {
		// Nothing follows the prefix: an oversized claim must be refused unread.
		_, err := readFramed(bytes.NewReader(framingPrefix(size)))
		if err == nil {
			t.Fatalf("readFramed accepted a length prefix of %d, past the %d octet packet limit", size, radius.MaxPacketLength)
		}
		if !strings.Contains(err.Error(), "outside the packet range") {
			t.Fatalf("length %d error = %q, want it to name the packet range", size, err)
		}
	}
}

func TestWriteFramedRefusesPacketsOutsideTheRange(t *testing.T) {
	for _, size := range []int{19, radius.MaxPacketLength + 1} {
		var buffer bytes.Buffer
		err := writeFramed(&buffer, make([]byte, size))
		if err == nil {
			t.Fatalf("writeFramed framed a %d octet packet, want refusal", size)
		}
		if !strings.Contains(err.Error(), "outside the packet range") {
			t.Fatalf("length %d error = %q, want it to name the packet range", size, err)
		}
		if buffer.Len() != 0 {
			t.Fatalf("a refused packet still wrote %d bytes, want nothing on the wire", buffer.Len())
		}
	}
}

func TestFramingCarriesTheSmallestAndLargestLegalPacket(t *testing.T) {
	for _, size := range []int{20, radius.MaxPacketLength} {
		packet := make([]byte, size)
		for i := range packet {
			packet[i] = byte(i)
		}
		var buffer bytes.Buffer
		if err := writeFramed(&buffer, packet); err != nil {
			t.Fatalf("frame a %d octet packet: %v", size, err)
		}
		framed := buffer.Bytes()
		if len(framed) != size+2 {
			t.Fatalf("framed a %d octet packet into %d bytes, want 2 length octets plus the packet", size, len(framed))
		}
		if claimed := int(binary.BigEndian.Uint16(framed[:2])); claimed != size {
			t.Fatalf("length prefix = %d, want %d", claimed, size)
		}
		got, err := readFramed(bytes.NewReader(framed))
		if err != nil {
			t.Fatalf("read back a %d octet packet: %v", size, err)
		}
		if !bytes.Equal(got, packet) {
			t.Fatalf("read %d bytes, want the exact %d octet packet", len(got), size)
		}
	}
}

func TestFramedRoundTripOverAConnectionReturnsTheExactPacket(t *testing.T) {
	client, server := net.Pipe()
	t.Cleanup(func() {
		_ = client.Close()
		_ = server.Close()
	})
	packet := accessRequest(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeCredential)

	written := make(chan error, 1)
	go func() { written <- writeFramed(server, packet) }()

	if err := client.SetReadDeadline(time.Now().Add(3 * time.Second)); err != nil {
		t.Fatalf("set read deadline: %v", err)
	}
	got, err := readFramed(client)
	if err != nil {
		t.Fatalf("readFramed over net.Pipe: %v", err)
	}
	if !bytes.Equal(got, packet) {
		t.Fatalf("round trip returned %d bytes, want the exact %d byte packet", len(got), len(packet))
	}
	if err := <-written; err != nil {
		t.Fatalf("writeFramed over net.Pipe: %v", err)
	}
}

func TestServeAnswersAFramedAccessRequestWithTheARSYDecision(t *testing.T) {
	pki := newPKI(t)
	fake := newFakeARSY(t)
	conn := serve(t, pki, fake, health.NewState(nil)).dialTrusted(t, pki)

	request := accessRequest(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeCredential)
	reply := exchange(t, conn, request)

	if !radius.IsAuthenticResponse(reply, request, []byte(fakeSecret)) {
		t.Fatalf("the reply carries no authenticator for this request, so a NAS could not trust it")
	}
	parsed, err := radius.Parse(reply, []byte(fakeSecret))
	if err != nil {
		t.Fatalf("parse the reply: %v", err)
	}
	if parsed.Code != radius.CodeAccessAccept {
		t.Fatalf("reply code = %s, want Access-Accept, the decision ARSY returned", parsed.Code)
	}
	if got := fake.recorded(); len(got) == 0 || !strings.HasPrefix(got[0], "resolve "+fakeNASID) {
		t.Fatalf("ARSY calls = %v, want the runtime to ask who owns this NAS identifier", got)
	}
}

func TestServeAnswersAnUnapprovedSubscriberWithAccessReject(t *testing.T) {
	pki := newPKI(t)
	fake := newFakeARSY(t)
	fake.decide("reject")
	conn := serve(t, pki, fake, health.NewState(nil)).dialTrusted(t, pki)

	request := accessRequest(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, "not-the-credential")
	reply := exchange(t, conn, request)

	if !radius.IsAuthenticResponse(reply, request, []byte(fakeSecret)) {
		t.Fatalf("the reject carries no authenticator for this request")
	}
	parsed, err := radius.Parse(reply, []byte(fakeSecret))
	if err != nil {
		t.Fatalf("parse the reply: %v", err)
	}
	if parsed.Code != radius.CodeAccessReject {
		t.Fatalf("reply code = %s, want Access-Reject, the decision ARSY returned", parsed.Code)
	}
}

func TestUntrustedClientCertificateNeverReachesTheHandler(t *testing.T) {
	pki := newPKI(t)
	fake := newFakeARSY(t)
	listener := serve(t, pki, fake, health.NewState(nil))

	refused := expectRefused(t, listener.addr, clientConfig(certPool(t, pki.caPEM), &pki.rogueClient),
		"a NAS holding a leaf from an unrelated CA")
	if !strings.Contains(refused.Error(), "certificate") {
		t.Fatalf("refusal = %q, want a certificate problem rather than an unrelated transport error", refused)
	}

	if got := fake.recorded(); len(got) != 0 {
		t.Fatalf("ARSY calls after an untrusted peer = %v, want none: the handshake must fail first", got)
	}
}

func TestClientWithoutCertificateNeverReachesTheHandler(t *testing.T) {
	pki := newPKI(t)
	fake := newFakeARSY(t)
	listener := serve(t, pki, fake, health.NewState(nil))

	expectRefused(t, listener.addr, clientConfig(certPool(t, pki.caPEM), nil),
		"a NAS presenting no certificate at all")

	if got := fake.recorded(); len(got) != 0 {
		t.Fatalf("ARSY calls after an anonymous peer = %v, want none: there is no anonymous NAS", got)
	}
}

func TestServePublishesItsBoundAddressAsReady(t *testing.T) {
	pki := newPKI(t)
	fake := newFakeARSY(t)
	state := health.NewState(nil)
	listener := serve(t, pki, fake, state)

	bound := listener.listener.BoundAddr()
	if bound != listener.addr {
		t.Fatalf("BoundAddr = %q, want the address Serve reported to health as %q", bound, listener.addr)
	}
	if _, port, err := net.SplitHostPort(bound); err != nil || port == "0" {
		t.Fatalf("BoundAddr = %q, want a real port rather than the :0 request", bound)
	}
	if component := state.Snapshot()["radsec"]; !component.Ready || component.Detail != bound {
		t.Fatalf("radsec health = %+v, want ready with detail %q", component, bound)
	}

	listener.cancel()
	select {
	case <-listener.stopped:
	case <-time.After(5 * time.Second):
		t.Fatalf("Serve was still running five seconds after its context was cancelled")
	}
	if err := listener.err; err != nil {
		t.Fatalf("Serve returned %v after its context was cancelled, want nil", err)
	}
	if component := state.Snapshot()["radsec"]; component.Ready {
		t.Fatalf("radsec health still reports ready after shutdown, want not ready")
	}
}

func TestServeStaysSilentWhenARSYIsUnavailable(t *testing.T) {
	pki := newPKI(t)
	fake := newFakeARSY(t)
	fake.unresolved(http.StatusServiceUnavailable)
	conn := serve(t, pki, fake, health.NewState(nil)).dialTrusted(t, pki)

	request := accessRequest(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeCredential)
	if err := writeFramed(conn, request); err != nil {
		t.Fatalf("send the framed Access-Request: %v", err)
	}
	expectSilence(t, conn)

	if got := fake.recorded(); len(got) != 1 || !strings.HasPrefix(got[0], "resolve "+fakeNASID) {
		t.Fatalf("ARSY calls = %v, want the one resolve attempt whose answer could not be trusted", got)
	}
}

func TestServeRefusesAListenerWithoutConfigOrHandler(t *testing.T) {
	err := (&Listener{Addr: "127.0.0.1:0"}).Serve(context.Background())
	if err == nil {
		t.Fatalf("Serve opened without a TLS config and a handler, want refusal")
	}
	if !strings.Contains(err.Error(), "needs a TLS config and a handler") {
		t.Fatalf("error = %v, want it to name the missing collaborators", err)
	}
}

// exchange sends one framed packet and reads exactly one framed reply back.
func exchange(t *testing.T, conn *tls.Conn, request []byte) []byte {
	t.Helper()
	if err := writeFramed(conn, request); err != nil {
		t.Fatalf("send the framed packet: %v", err)
	}
	if err := conn.SetReadDeadline(time.Now().Add(10 * time.Second)); err != nil {
		t.Fatalf("set read deadline: %v", err)
	}
	reply, err := readFramed(conn)
	if err != nil {
		t.Fatalf("read the framed reply: %v", err)
	}
	return reply
}

// framingPrefix returns the 2-octet length claim alone, with no packet behind it.
func framingPrefix(size int) []byte {
	prefix := make([]byte, 2)
	binary.BigEndian.PutUint16(prefix, uint16(size))
	return prefix
}

func tlsName(version uint16) string {
	switch version {
	case tls.VersionTLS10:
		return "TLS 1.0"
	case tls.VersionTLS11:
		return "TLS 1.1"
	case tls.VersionTLS12:
		return "TLS 1.2"
	case tls.VersionTLS13:
		return "TLS 1.3"
	default:
		return "version " + strconv.Itoa(int(version))
	}
}
