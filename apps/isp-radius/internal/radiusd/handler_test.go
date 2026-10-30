package radiusd

import (
	"context"
	"net/http"
	"strings"
	"testing"

	"layeh.com/radius"
	"layeh.com/radius/rfc2865"
	"layeh.com/radius/rfc2866"
	"layeh.com/radius/rfc2869"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/arsy"
)

func TestAccessAcceptCarriesTheProfileDecision(t *testing.T) {
	fake := newFakeARSY(t)
	store := mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret})
	handler := newTestHandler(t, fake, store, modeDisabled)

	raw := accessPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeCredential)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	pkt := parseReply(t, reply, raw, []byte(fakeSecret))
	if pkt.Code != radius.CodeAccessAccept {
		t.Fatalf("code = %s, want Access-Accept", pkt.Code)
	}
	class := rfc2865.Class_GetString(pkt)
	if !strings.Contains(class, "isp-up=512") || !strings.Contains(class, "isp-down=2048") {
		t.Fatalf("Class = %q, want the tenant profile rates ARSY returned", class)
	}
	if rfc2865.UserPassword_Get(pkt) != nil {
		t.Fatalf("Access-Accept echoes a User-Password attribute, want only the reply payload")
	}
	if rfc2865.UserName_GetString(pkt) != "" {
		t.Fatalf("Access-Accept echoes User-Name, want no request attributes in the reply")
	}
	if got := fake.authorizations(); len(got) != 1 || got[0] != fakeNASID+"|"+fakeSubscriber+"|"+fakeCredential {
		t.Fatalf("authorize calls = %v, want one call with the decrypted credential", got)
	}
	stats := handler.Stats()
	if stats.AccessRequests != 1 || stats.AccessAccepts != 1 || stats.AccessRejects != 0 {
		t.Fatalf("counters = %+v, want one request and one accept", stats)
	}
	for _, key := range fake.keys() {
		if key != "synthetic-d00-service-key" {
			t.Fatalf("service call used credential %q, want the mounted D00 key", key)
		}
	}
	if handler.ObservedNASs()[0] != fakeNASID {
		t.Fatalf("observed NASs = %v, want the accepted NAS", handler.ObservedNASs())
	}
}

func TestAccessRejectForWrongCredential(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	raw := accessPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, "not-the-credential")
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	pkt := parseReply(t, reply, raw, []byte(fakeSecret))
	if pkt.Code != radius.CodeAccessReject {
		t.Fatalf("code = %s, want Access-Reject", pkt.Code)
	}
	if got := handler.Stats(); got.AccessAccepts != 0 || got.AccessRejects != 1 {
		t.Fatalf("counters = %+v, want one reject and no accept", got)
	}
}

func TestAccessWithoutCredentialAttributeNeverReachesARSY(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	raw := accessPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, "")
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	pkt := parseReply(t, reply, raw, []byte(fakeSecret))
	if pkt.Code != radius.CodeAccessReject {
		t.Fatalf("code = %s, want Access-Reject for an unreadable credential", pkt.Code)
	}
	if got := fake.authorizations(); len(got) != 0 {
		t.Fatalf("authorize calls = %v, want none: a packet with no credential must not query the record of authority", got)
	}
}

func TestUnknownNASIsSilentlyDiscarded(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	raw := accessPacket(t, []byte(fakeSecret), fakeOtherNASID, fakeSubscriber, fakeCredential)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if reply != nil {
		t.Fatalf("an unresolved NAS received a %d byte reply, want silence", len(reply))
	}
	stats := handler.Stats()
	if stats.DroppedUnknownNAS != 1 || stats.AccessAccepts != 0 || stats.AccessRejects != 0 {
		t.Fatalf("counters = %+v, want one unknown-NAS drop and no verdict", stats)
	}
	if got := fake.authorizations(); len(got) != 0 {
		t.Fatalf("authorize calls = %v, want none for an NAS this tenant set does not serve", got)
	}
}

func TestAccessWithoutNASIdentifierIsDiscarded(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	pkt := radius.New(radius.CodeAccessRequest, []byte(fakeSecret))
	setAttr(t, rfc2865.UserName_SetString(pkt, fakeSubscriber), "User-Name")
	setAttr(t, rfc2865.UserPassword_AddString(pkt, fakeCredential), "User-Password")
	reply, err := handler.Handle(context.Background(), encodePacket(t, pkt), "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if reply != nil {
		t.Fatalf("want silence for a request that cannot be attributed to a NAS")
	}
	if got := handler.Stats(); got.DroppedUnknownNAS != 1 {
		t.Fatalf("counters = %+v, want one unknown-NAS drop", got)
	}
}

func TestUnreadableMountedSecretIsDiscarded(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"other.secret": fakeSecret}), modeDisabled)

	raw := accessPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeCredential)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if reply != nil {
		t.Fatalf("want silence when the mounted secret for the resolved NAS is missing")
	}
	if got := handler.Stats(); got.DroppedBadSecret != 1 || got.AccessAccepts != 0 {
		t.Fatalf("counters = %+v, want one bad-secret drop and no verdict", got)
	}
}

func TestWrongSharedSecretCannotReachTheCredentialCheck(t *testing.T) {
	fake := newFakeARSY(t)
	store := mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret})

	enforce := newTestHandler(t, fake, store, modeEnforce)
	// A NAS configured with a different secret cannot produce a valid
	// Message-Authenticator, so enforcement discards it before any credential work.
	raw := signedAccessPacket(t, []byte(fakeWrongSecret), fakeNASID, fakeSubscriber, fakeCredential)
	reply, err := enforce.Handle(context.Background(), raw, "192.0.2.51:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if reply != nil {
		t.Fatalf("want silence for a packet signed with the wrong secret")
	}
	if got := enforce.Stats(); got.DroppedBadSecret != 1 {
		t.Fatalf("counters = %+v, want one bad-secret drop", got)
	}

	// With enforcement off the packet is still unreadable as a credential, so the
	// honest answer is a rejection rather than forwarding binary noise to ARSY. The
	// reply is protected with the secret ARSY registered for this NAS, not the one
	// the peer guessed.
	warn := newTestHandler(t, fake, store, modeWarn)
	mismatched := accessPacket(t, []byte(fakeWrongSecret), fakeNASID, fakeSubscriber, fakeCredential)
	reply, err = warn.Handle(context.Background(), mismatched, "192.0.2.51:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	pkt := parseReply(t, reply, mismatched, []byte(fakeSecret))
	if pkt.Code != radius.CodeAccessReject {
		t.Fatalf("code = %s, want Access-Reject", pkt.Code)
	}
	if got := fake.authorizations(); len(got) != 0 {
		t.Fatalf("authorize calls = %v, want none: the wrong secret never yields a credential", got)
	}
}

func TestMessageAuthenticatorEnforcementAcceptsASignedRequest(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeEnforce)

	raw := signedAccessPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeCredential)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	pkt := parseReply(t, reply, raw, []byte(fakeSecret))
	if pkt.Code != radius.CodeAccessAccept {
		t.Fatalf("code = %s, want Access-Accept", pkt.Code)
	}
	// Every signed-capable reply carries the attribute, so the NAS can bind the
	// answer to its request.
	values, err := rfc2869.MessageAuthenticator_Gets(pkt)
	if err != nil {
		t.Fatalf("read reply Message-Authenticator: %v", err)
	}
	if len(values) != 1 || len(values[0]) != 16 {
		t.Fatalf("reply Message-Authenticator = %v, want exactly one 16-octet value", values)
	}
}

func TestUnsignedRequestIsAcceptedInWarnMode(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeWarn)

	raw := accessPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeCredential)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if got := parseReply(t, reply, raw, []byte(fakeSecret)); got.Code != radius.CodeAccessAccept {
		t.Fatalf("code = %s, want Access-Accept: warn mode must not lock out an old NAS", got.Code)
	}
}

func TestStatusServerIsNotAnswered(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	pkt := radius.New(radius.CodeStatusServer, []byte(fakeSecret))
	reply, err := handler.Handle(context.Background(), encodePacket(t, pkt), "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if reply != nil {
		t.Fatalf("answering Status-Server would claim a decision ARSY never made")
	}
	if got := handler.Stats(); got.DroppedNoReply != 1 {
		t.Fatalf("counters = %+v, want one no-reply drop", got)
	}
}

func TestAccountingIsPersistedBeforeItIsAcknowledged(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	raw := accountingPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeSessionKey,
		rfc2866.AcctStatusType_Value_Start, 0, 0, 0, 0)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	pkt := parseReply(t, reply, raw, []byte(fakeSecret))
	if pkt.Code != radius.CodeAccountingResponse {
		t.Fatalf("code = %s, want Accounting-Response", pkt.Code)
	}
	events := fake.events()
	if len(events) != 1 {
		t.Fatalf("accounting calls = %d, want exactly one", len(events))
	}
	event := events[0]
	if event.EventType != "start" || event.SessionKey != fakeSessionKey || event.Username != fakeSubscriber || event.NASID != fakeNASID {
		t.Fatalf("event = %+v, want the session identity the NAS reported", event)
	}
	if len(event.EventKey) != 64 {
		t.Fatalf("event key %q is not the stable digest ARSY enforces", event.EventKey)
	}
	if got := handler.Stats(); got.AcctStored != 1 || got.AcctUnacknowledged != 0 {
		t.Fatalf("counters = %+v, want one stored event", got)
	}
}

func TestAccountingRetransmissionCollapsesOnOneIdempotencyKey(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	// A NAS retransmission is the same event with a different Acct-Delay-Time and a
	// fresh authenticator, so the key must be built from the stable identity only.
	first := accountingPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeSessionKey,
		rfc2866.AcctStatusType_Value_InterimUpdate, 60, 1000, 2000, 0)
	second := accountingPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeSessionKey,
		rfc2866.AcctStatusType_Value_InterimUpdate, 60, 1000, 2000, 5)
	for _, raw := range [][]byte{first, second} {
		reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
		if err != nil {
			t.Fatalf("handle: %v", err)
		}
		if reply == nil {
			t.Fatalf("accounting retransmission was dropped instead of acknowledged")
		}
	}
	events := fake.events()
	if len(events) != 2 {
		t.Fatalf("accounting calls = %d, want two", len(events))
	}
	if events[0].EventKey != events[1].EventKey {
		t.Fatalf("retransmission produced two keys %q and %q, want one so ARSY deduplicates", events[0].EventKey, events[1].EventKey)
	}

	// A genuine change must not collapse onto the same key.
	changed := accountingPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeSessionKey,
		rfc2866.AcctStatusType_Value_InterimUpdate, 120, 1000, 2000, 0)
	if _, err := handler.Handle(context.Background(), changed, "192.0.2.50:50000"); err != nil {
		t.Fatalf("handle: %v", err)
	}
	if fake.events()[2].EventKey == events[0].EventKey {
		t.Fatalf("a changed interim update reused the same idempotency key")
	}
}

func TestAccountingWithWrongSecretIsNotStored(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	raw := accountingPacket(t, []byte(fakeWrongSecret), fakeNASID, fakeSubscriber, fakeSessionKey,
		rfc2866.AcctStatusType_Value_Start, 0, 0, 0, 0)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if reply != nil {
		t.Fatalf("a NAS with a different secret received an Accounting-Response")
	}
	if got := fake.events(); len(got) != 0 {
		t.Fatalf("accounting calls = %d, want none before the authenticator check passes", len(got))
	}
	if stats := handler.Stats(); stats.DroppedBadSecret != 1 || stats.AcctStored != 0 {
		t.Fatalf("counters = %+v, want one bad-secret drop and nothing stored", stats)
	}
}

func TestAccountingForUnknownNASIsNotStored(t *testing.T) {
	fake := newFakeARSY(t)
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	raw := accountingPacket(t, []byte(fakeSecret), fakeOtherNASID, fakeSubscriber, fakeSessionKey,
		rfc2866.AcctStatusType_Value_Stop, 10, 1, 1, 0)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if reply != nil {
		t.Fatalf("want silence for an NAS this runtime cannot resolve")
	}
	if got := fake.events(); len(got) != 0 {
		t.Fatalf("accounting calls = %d, want none", len(got))
	}
}

func TestARSYOutageDeniesNewAuthentication(t *testing.T) {
	fake := newFakeARSY(t)
	fake.authorizeFunc = func(string, string, string) (int, any) {
		return http.StatusServiceUnavailable, nil
	}
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	raw := accessPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeCredential)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if reply != nil {
		t.Fatalf("an outage must not produce any reply, got %d bytes", len(reply))
	}
	stats := handler.Stats()
	if stats.AccessAccepts != 0 || stats.AccessRejects != 0 || stats.ARSYUnavailable != 1 {
		t.Fatalf("counters = %+v, want no verdict and one outage", stats)
	}
	if len(handler.ObservedNASs()) != 0 {
		t.Fatalf("observed NASs = %v, want none: an outage grants no access", handler.ObservedNASs())
	}
}

func TestARSYOutageDoesNotAcknowledgeUnpersistedAccounting(t *testing.T) {
	fake := newFakeARSY(t)
	fake.accountingFunc = func(arsy.AccountingRequest) (int, any) { return http.StatusBadGateway, nil }
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	raw := accountingPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeSessionKey,
		rfc2866.AcctStatusType_Value_Start, 0, 0, 0, 0)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if reply != nil {
		t.Fatalf("accounting was acknowledged although ARSY could not persist it")
	}
	stats := handler.Stats()
	if stats.AcctStored != 0 || stats.AcctUnacknowledged != 1 || stats.ARSYUnavailable != 1 {
		t.Fatalf("counters = %+v, want one unacknowledged event and one outage", stats)
	}
}

func TestRefusedServiceCredentialIsAnAvailabilityFailure(t *testing.T) {
	fake := newFakeARSY(t)
	fake.resolveFunc = func(string) (int, any) { return http.StatusForbidden, nil }
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)

	raw := accessPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeCredential)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if reply != nil {
		t.Fatalf("a refused service credential must not answer the NAS")
	}
	if got := handler.Stats(); got.ARSYUnavailable != 1 {
		t.Fatalf("counters = %+v, want the refusal counted as an outage", got)
	}
}

func TestHandlerBoundsItsInMemoryNASView(t *testing.T) {
	fake := newFakeARSY(t)
	fake.resolveFunc = func(nasID string) (int, any) {
		return http.StatusOK, arsy.NASResolution{Resolved: true, NASID: nasID, SecretRef: "nas-a.secret", NASAddress: "127.0.0.1"}
	}
	handler, err := NewHandler(Deps{
		ARSY:          fake.client(t),
		Secrets:       mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}),
		MsgAuth:       modeDisabled,
		Log:           discardLogger(),
		MaxNASTracked: 2,
	})
	if err != nil {
		t.Fatalf("build handler: %v", err)
	}
	for _, nasID := range []string{"nas-1", "nas-2", "nas-3"} {
		raw := accessPacket(t, []byte(fakeSecret), nasID, fakeSubscriber, fakeCredential)
		if _, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000"); err != nil {
			t.Fatalf("handle %s: %v", nasID, err)
		}
	}
	if got := handler.ObservedNASs(); len(got) != 2 {
		t.Fatalf("observed NASs = %v, want the view capped at 2 entries", got)
	}
}

func TestRejectReplyStaysWithinThePacketLimit(t *testing.T) {
	fake := newFakeARSY(t)
	fake.authorizeFunc = func(string, string, string) (int, any) {
		return http.StatusOK, arsy.Authorization{
			Decision:   "accept",
			Attributes: arsy.ProfileAttributes{SessionLimit: 999999999, UploadKbps: 999999999, DownloadKbps: 999999999},
		}
	}
	handler := newTestHandler(t, fake, mountSecrets(t, map[string]string{"nas-a.secret": fakeSecret}), modeDisabled)
	raw := accessPacket(t, []byte(fakeSecret), fakeNASID, fakeSubscriber, fakeCredential)
	reply, err := handler.Handle(context.Background(), raw, "192.0.2.50:50000")
	if err != nil {
		t.Fatalf("handle: %v", err)
	}
	if len(reply) > radius.MaxPacketLength {
		t.Fatalf("reply is %d octets, over the RADIUS packet limit", len(reply))
	}
	if len(rfc2865.Class_GetString(parseReply(t, reply, raw, []byte(fakeSecret)))) > 64 {
		t.Fatalf("Class attribute exceeds the attribute limit")
	}
}

// signedAccessPacket mimics a modern NAS: it protects the credential and then adds
// a Message-Authenticator computed over the packet with that attribute zeroed.
func signedAccessPacket(t *testing.T, secret []byte, nasID, username, password string) []byte {
	t.Helper()
	pkt := radius.New(radius.CodeAccessRequest, secret)
	setAttr(t, rfc2865.NASIdentifier_SetString(pkt, nasID), "NAS-Identifier")
	setAttr(t, rfc2865.UserName_SetString(pkt, username), "User-Name")
	setAttr(t, rfc2865.UserPassword_AddString(pkt, password), "User-Password")
	setAttr(t, rfc2869.MessageAuthenticator_Set(pkt, make([]byte, 16)), "Message-Authenticator")
	wire, err := pkt.MarshalBinary()
	if err != nil {
		t.Fatalf("marshal for signing: %v", err)
	}
	setAttr(t, rfc2869.MessageAuthenticator_Set(pkt, computeMessageAuthenticator(wire, secret)), "Message-Authenticator")
	return encodePacket(t, pkt)
}
