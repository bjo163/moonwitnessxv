package radiusd

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"unicode"

	"layeh.com/radius"
	"layeh.com/radius/rfc2865"
	"layeh.com/radius/rfc2866"
)

// AccessRequest is the bounded view of one Access-Request the adapter needs.
// Nothing else from the packet travels towards ARSY.
type AccessRequest struct {
	NASID    string
	Username string
	Password string
}

// AccountingRequest is the bounded view of one Accounting-Request.
// Delay time is deliberately absent: it varies across NAS retransmissions and
// would defeat the idempotency key.
type AccountingRequest struct {
	NASID          string
	Username       string
	SessionKey     string
	EventType      string
	InputOctets    uint64
	OutputOctets   uint64
	SessionSeconds uint64
}

// ErrNoNASIdentifier reports a request that cannot be attributed to a NAS, which
// therefore cannot be resolved or answered.
var ErrNoNASIdentifier = errors.New("radiusd: packet carries no NAS-Identifier")

// decodeAccessRequest reads the credential pair from a packet whose shared secret
// has already been resolved.
func decodeAccessRequest(pkt *radius.Packet, secret []byte) (AccessRequest, error) {
	nasID := strings.TrimSpace(rfc2865.NASIdentifier_GetString(pkt))
	if nasID == "" {
		return AccessRequest{}, ErrNoNASIdentifier
	}
	username := strings.TrimSpace(rfc2865.UserName_GetString(pkt))
	if username == "" {
		return AccessRequest{}, errors.New("radiusd: Access-Request carries no User-Name")
	}
	// The rfc2865 helper decrypts User-Password with the packet secret, so the
	// resolved NAS secret is attached before the credential is read.
	pkt.Secret = secret
	encrypted, err := rfc2865.UserPassword_Lookup(pkt)
	if errors.Is(err, radius.ErrNoAttribute) {
		// Cleartext-Password is not accepted: the D20 boundary only ever forwards a
		// secret that the NAS protected with the shared key.
		return AccessRequest{}, errors.New("radiusd: Access-Request carries no User-Password")
	}
	if err != nil {
		return AccessRequest{}, fmt.Errorf("radiusd: decode User-Password: %w", err)
	}
	// A NAS configured with a different shared secret decrypts to unpredictable
	// bytes. Rejecting here keeps the wrong-secret case a credential failure
	// instead of forwarding binary noise to ARSY.
	if !isPrintableASCII(string(encrypted)) {
		return AccessRequest{}, errors.New("radiusd: User-Password did not decrypt to a usable credential")
	}
	return AccessRequest{NASID: nasID, Username: username, Password: string(encrypted)}, nil
}

func decodeAccountingRequest(pkt *radius.Packet) (AccountingRequest, error) {
	nasID := strings.TrimSpace(rfc2865.NASIdentifier_GetString(pkt))
	if nasID == "" {
		return AccountingRequest{}, ErrNoNASIdentifier
	}
	status := rfc2866.AcctStatusType_Get(pkt)
	eventType, ok := acctEventType(status)
	if !ok {
		return AccountingRequest{}, fmt.Errorf("radiusd: unsupported Acct-Status-Type %d", uint32(status))
	}
	sessionKey := strings.TrimSpace(rfc2866.AcctSessionID_GetString(pkt))
	if sessionKey == "" {
		return AccountingRequest{}, errors.New("radiusd: Accounting-Request carries no Acct-Session-Id")
	}
	// Interim and Stop updates are cumulative counters, so they are kept as the NAS
	// reported them; ARSY takes the maximum per session and never re-adds them.
	return AccountingRequest{
		NASID:          nasID,
		Username:       strings.TrimSpace(rfc2865.UserName_GetString(pkt)),
		SessionKey:     sessionKey,
		EventType:      eventType,
		InputOctets:    uint64(rfc2866.AcctInputOctets_Get(pkt)),
		OutputOctets:   uint64(rfc2866.AcctOutputOctets_Get(pkt)),
		SessionSeconds: uint64(rfc2866.AcctSessionTime_Get(pkt)),
	}, nil
}

func acctEventType(status rfc2866.AcctStatusType) (string, bool) {
	switch status {
	case rfc2866.AcctStatusType_Value_Start:
		return "start", true
	case rfc2866.AcctStatusType_Value_InterimUpdate:
		return "interim", true
	case rfc2866.AcctStatusType_Value_Stop:
		return "stop", true
	default:
		return "", false
	}
}

// eventKey is the idempotency key ARSY enforces on isp_accounting_events. It is a
// digest of the stable identity and counters of one accounting packet, so a
// retransmission collapses onto the same row while any real change does not.
func eventKey(req AccountingRequest) string {
	canonical := strings.Join([]string{
		req.NASID, req.Username, req.SessionKey, req.EventType,
		fmt.Sprintf("%d", req.SessionSeconds),
		fmt.Sprintf("%d", req.InputOctets),
		fmt.Sprintf("%d", req.OutputOctets),
	}, "|")
	sum := sha256.Sum256([]byte(canonical))
	return hex.EncodeToString(sum[:])
}

func isPrintableASCII(s string) bool {
	if s == "" {
		return false
	}
	for _, r := range s {
		if r > unicode.MaxASCII || !unicode.IsPrint(r) {
			return false
		}
	}
	return true
}
