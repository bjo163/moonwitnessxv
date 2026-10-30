package radiusd

import (
	"context"
	"net"
	"testing"
	"time"

	"layeh.com/radius"
	"layeh.com/radius/rfc2865"
	"layeh.com/radius/rfc2866"
	"layeh.com/radius/rfc2869"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/arsy"
)

func newTestSender(t *testing.T, port int, attempts int, timeout time.Duration) *Sender {
	t.Helper()
	store := mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret})
	sender, err := NewSender(COAConfig{Timeout: timeout, MaxAttempts: attempts, Port: port}, store, discardLogger())
	if err != nil {
		t.Fatalf("build sender: %v", err)
	}
	return sender
}

func disconnectAction() arsy.SessionAction {
	return arsy.SessionAction{ID: fakeActionID, ActionKey: "disconnect-1", Action: "disconnect", State: "pending", SessionKey: fakeSessionKey, Username: fakeSubscriber}
}

func resolvedNAS(address string) arsy.NASResolution {
	return arsy.NASResolution{Resolved: true, NASID: fakeNASID, NASRef: "nas-ref-a", NASAddress: address, SecretRef: "nas-a.secret"}
}

// nasLoopback is the address a fake NAS bound to an ephemeral port is reached at;
// the sender re-points it at the Dynamic Authorization port it was configured with.
const nasLoopback = "127.0.0.1"

func TestDisconnectRequestGetsACKAndCarriesSessionIdentity(t *testing.T) {
	nas := startFakeNAS(t, []byte(fakeSecret), func(*radius.Packet) radius.Code { return radius.CodeDisconnectACK })
	sender := newTestSender(t, nas.port(t), 3, 500*time.Millisecond)

	result := sender.Deliver(context.Background(), disconnectAction(), resolvedNAS(nasLoopback))
	if !result.Sent || result.TimedOut || result.Err != nil {
		t.Fatalf("result = %+v, want a transmitted, answered request", result)
	}
	if result.ResponseCode != "Disconnect-ACK" {
		t.Fatalf("response = %q, want Disconnect-ACK", result.ResponseCode)
	}
	if result.Attempts != 1 {
		t.Fatalf("attempts = %d, want one: an answered request is not retransmitted", result.Attempts)
	}

	request := nas.awaitRequest(t, time.Second)
	if request.Code != radius.CodeDisconnectRequest {
		t.Fatalf("code = %s, want Disconnect-Request", request.Code)
	}
	if got := rfc2865.NASIdentifier_GetString(&request); got != fakeNASID {
		t.Fatalf("NAS-Identifier = %q, want %q", got, fakeNASID)
	}
	if got := rfc2866.AcctSessionID_GetString(&request); got != fakeSessionKey {
		t.Fatalf("Acct-Session-Id = %q, want the session ARSY recorded", got)
	}
	if got := rfc2865.UserName_GetString(&request); got != fakeSubscriber {
		t.Fatalf("User-Name = %q, want the subscriber the session belongs to", got)
	}
	// RFC 5176 §3 identifies the session and the NAS; anything else on a
	// Disconnect-Request belongs to a tenant's NAS profile, not to this runtime.
	for _, attribute := range requestTypes(&request) {
		if !isIdentificationAttribute(attribute) {
			t.Fatalf("Disconnect-Request carries attribute type %d, which RFC 5176 does not define for it", attribute)
		}
	}
	if verifyDynamicAuthRequest(&request, []byte(fakeSecret)) != msgAuthValid {
		t.Fatalf("Disconnect-Request Message-Authenticator does not verify with the NAS secret")
	}
}

// isIdentificationAttribute allows only the attributes a Dynamic Authorization
// request is built from here: NAS and session identification plus the
// Message-Authenticator that protects them (RFC 5176 §3, §3.4).
func isIdentificationAttribute(attribute radius.Type) bool {
	switch attribute {
	case rfc2865.NASIdentifier_Type, rfc2865.UserName_Type, rfc2866.AcctSessionID_Type, rfc2869.MessageAuthenticator_Type:
		return true
	default:
		return false
	}
}

func TestCoARequestGetsNAKAndCarriesNoDisconnectAttributes(t *testing.T) {
	nas := startFakeNAS(t, []byte(fakeSecret), func(*radius.Packet) radius.Code { return radius.CodeCoANAK })
	sender := newTestSender(t, nas.port(t), 3, 500*time.Millisecond)

	action := disconnectAction()
	action.Action = "coa"
	action.ActionKey = "coa-1"
	result := sender.Deliver(context.Background(), action, resolvedNAS(nasLoopback))
	if result.ResponseCode != "CoA-NAK" {
		t.Fatalf("result = %+v, want CoA-NAK", result)
	}
	request := nas.awaitRequest(t, time.Second)
	if request.Code != radius.CodeCoARequest {
		t.Fatalf("code = %s, want CoA-Request", request.Code)
	}
	// A CoA-Request changes authorizations; this runtime records no replacement
	// policy, so it must ask for the session and nothing else.
	for _, attribute := range requestTypes(&request) {
		if !isIdentificationAttribute(attribute) {
			t.Fatalf("CoA-Request carries attribute type %d, which this runtime has no recorded reason to send", attribute)
		}
	}
}

func TestSilentNASIsRetransmittedAndReportedAsTimeout(t *testing.T) {
	nas := startFakeNAS(t, []byte(fakeSecret), func(*radius.Packet) radius.Code { return 0 })
	sender := newTestSender(t, nas.port(t), 3, 40*time.Millisecond)

	result := sender.Deliver(context.Background(), disconnectAction(), resolvedNAS(nasLoopback))
	if !result.TimedOut || !result.Sent || result.ResponseCode != "" {
		t.Fatalf("result = %+v, want a truthful timeout", result)
	}
	if result.Attempts != 3 {
		t.Fatalf("attempts = %d, want the configured three transmissions", result.Attempts)
	}
	if got := len(nas.requests()); got != 3 {
		t.Fatalf("fake NAS received %d requests, want the retransmissions it was given", got)
	}
}

func TestForgedReplyIsNotTrusted(t *testing.T) {
	// The peer answers, but with a digest computed from a different secret, so the
	// runtime cannot bind the ACK to the request it sent.
	nas := startForgingNAS(t, []byte(fakeSecret), func(request *radius.Packet) []byte {
		reply := request.Response(radius.CodeDisconnectACK)
		reply.Secret = []byte("some-other-secret-value")
		encoded, err := reply.Encode()
		if err != nil {
			t.Fatalf("encode forged reply: %v", err)
		}
		return encoded
	})
	sender := newTestSender(t, nas.port(t), 2, 60*time.Millisecond)

	result := sender.Deliver(context.Background(), disconnectAction(), resolvedNAS(nasLoopback))
	if result.ResponseCode != "" || !result.TimedOut {
		t.Fatalf("result = %+v, want a reply that fails its authenticator to be ignored", result)
	}
}

func TestMissingSecretStopsBeforeTheWire(t *testing.T) {
	store := mountSecrets(t, map[string]string{"other.secret": fakeSecret})
	sender, err := NewSender(COAConfig{Timeout: 100 * time.Millisecond, MaxAttempts: 2, Port: 3799}, store, discardLogger())
	if err != nil {
		t.Fatalf("build sender: %v", err)
	}
	result := sender.Deliver(context.Background(), disconnectAction(), resolvedNAS(nasLoopback))
	if result.Sent {
		t.Fatalf("result = %+v, want nothing transmitted without a secret", result)
	}
	if result.Err == nil {
		t.Fatalf("want the reason the request could not be built")
	}
}

func TestUnresolvableAddressIsNotReportedAsATimeout(t *testing.T) {
	sender := newTestSender(t, 3799, 2, 50*time.Millisecond)
	// A malformed literal address never reaches the network, so the runner must not
	// be handed a verdict for it.
	for _, address := range []string{"", "[::1", "2001:db8::1:1813:extra"} {
		result := sender.Deliver(context.Background(), disconnectAction(), resolvedNAS(address))
		if result.Sent || result.TimedOut {
			t.Fatalf("address %q: result = %+v, want neither a transmission nor a timeout claim", address, result)
		}
		if result.Err == nil {
			t.Fatalf("address %q: want the reason nothing was transmitted, so the runner can log why it stayed pending", address)
		}
	}
}

// TestDynamicAuthorizationDigestUsesTheZeroedAuthenticator proves the runtime signs
// a CoA/Disconnect request the way RFC 5176 §3.4 defines it. A request built with
// the Access-Request rule would be discarded by a conforming NAS.
func TestDynamicAuthorizationDigestUsesTheZeroedAuthenticator(t *testing.T) {
	pkt := radius.New(radius.CodeDisconnectRequest, []byte(fakeSecret))
	pkt.Authenticator = [16]byte{9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8}
	setAttr(t, rfc2865.NASIdentifier_SetString(pkt, fakeNASID), "NAS-Identifier")
	setAttr(t, rfc2869.MessageAuthenticator_Set(pkt, make([]byte, 16)), "Message-Authenticator")
	wire, err := pkt.MarshalBinary()
	if err != nil {
		t.Fatalf("marshal request: %v", err)
	}
	if err := rfc2869.MessageAuthenticator_Set(pkt, computeMessageAuthenticator(wire, []byte(fakeSecret))); err != nil {
		t.Fatalf("set access-style digest: %v", err)
	}
	if verifyDynamicAuthRequest(pkt, []byte(fakeSecret)) != msgAuthInvalid {
		t.Fatalf("a digest taken over the filled-in Request Authenticator was accepted as a Dynamic Authorization digest")
	}

	if err := signRequest(pkt, []byte(fakeSecret)); err != nil {
		t.Fatalf("sign request: %v", err)
	}
	if verifyDynamicAuthRequest(pkt, []byte(fakeSecret)) != msgAuthValid {
		t.Fatalf("the runtime's own digest was not accepted by the NAS-side rule")
	}
}

func TestDynamicAuthorizationPortDefaultsToTheRegisteredOne(t *testing.T) {
	sender, err := NewSender(COAConfig{}, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), nil)
	if err != nil {
		t.Fatalf("build sender: %v", err)
	}
	if sender.cfg.Port != DefaultCoAPort {
		t.Fatalf("port = %d, want the IANA Dynamic Authorization port %d", sender.cfg.Port, DefaultCoAPort)
	}
	if sender.cfg.MaxAttempts != 3 || sender.cfg.Timeout != 5*time.Second {
		t.Fatalf("config = %+v, want the reviewed source's retry budget", sender.cfg)
	}
}

func TestCoAPeerAddressIsRePointedAtTheAuthorizationPort(t *testing.T) {
	if got := mustTarget("192.0.2.50:1813", 3799); got != "192.0.2.50:3799" {
		t.Fatalf("target = %q, want the accounting peer moved to the CoA port", got)
	}
	if got := mustTarget("192.0.2.50", 3799); got != "192.0.2.50:3799" {
		t.Fatalf("target = %q, want a bare management address given the CoA port", got)
	}
	if got := mustTarget("[2001:db8::1]:1813", 3799); got != "[2001:db8::1]:3799" {
		t.Fatalf("target = %q, want an IPv6 peer kept bracketed", got)
	}
}

func TestListenerServesOneAccessRequestOverUDP(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeWarn)

	listener := &Listener{Name: "radius_auth", Addr: "127.0.0.1:0", Handler: handler, Concurrency: 4, Log: discardLogger()}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	serveDone := make(chan error, 1)
	go func() { serveDone <- listener.Serve(ctx) }()

	raw := accessPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeCredential)
	reply := exchange(t, listenerAddress(t, listener), raw)
	pkt := parseReply(t, reply, raw, []byte(fakeSecret))
	if pkt.Code != radius.CodeAccessAccept {
		t.Fatalf("code = %s, want Access-Accept over the UDP listener", pkt.Code)
	}
	if got := handler.Stats(); got.AccessRequests != 1 {
		t.Fatalf("counters = %+v, want the packet counted once", got)
	}

	cancel()
	select {
	case err := <-serveDone:
		if err != nil {
			t.Fatalf("listener shutdown: %v", err)
		}
	case <-time.After(3 * time.Second):
		t.Fatalf("listener did not stop when its context ended")
	}
}

func TestListenerDropsSilentlyForUnknownNAS(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeWarn)
	listener := &Listener{Name: "radius_auth", Addr: "127.0.0.1:0", Handler: handler, Log: discardLogger()}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go func() { _ = listener.Serve(ctx) }()

	// A NAS the tenant set does not serve must not even learn that a runtime is
	// listening, so the client sees no reply at all.
	raw := accessPacket(t, []byte(fakeSecret), fakeOtherNASID, fakeSubscriber, fakeCredential)
	if reply := tryExchange(t, listenerAddress(t, listener), raw, 300*time.Millisecond); len(reply) != 0 {
		t.Fatalf("got %d bytes for an unresolved NAS, want silence", len(reply))
	}
}

// listenerAddress waits for the listener to publish the port it actually bound.
func listenerAddress(t *testing.T, listener *Listener) string {
	t.Helper()
	for attempt := 0; attempt < 200; attempt++ {
		if addr := listener.BoundAddr(); addr != "" {
			return addr
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("listener never reported a bound address")
	return ""
}

func exchange(t *testing.T, addr string, request []byte) []byte {
	t.Helper()
	reply, err := roundTrip(addr, request, 2*time.Second)
	if err != nil {
		t.Fatalf("round trip with %s: %v", addr, err)
	}
	return reply
}

func tryExchange(t *testing.T, addr string, request []byte, window time.Duration) []byte {
	t.Helper()
	reply, err := roundTrip(addr, request, window)
	if err != nil {
		return nil
	}
	return reply
}

func roundTrip(addr string, request []byte, window time.Duration) ([]byte, error) {
	udpAddr, err := net.ResolveUDPAddr("udp", addr)
	if err != nil {
		return nil, err
	}
	conn, err := net.DialUDP("udp", nil, udpAddr)
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	if err := conn.SetDeadline(time.Now().Add(window)); err != nil {
		return nil, err
	}
	if _, err := conn.Write(request); err != nil {
		return nil, err
	}
	buffer := make([]byte, radius.MaxPacketLength)
	read, err := conn.Read(buffer)
	if err != nil {
		return nil, err
	}
	return buffer[:read], nil
}
