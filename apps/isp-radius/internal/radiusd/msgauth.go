package radiusd

import (
	"crypto/hmac"
	"crypto/md5"
	"crypto/subtle"

	"layeh.com/radius"
	"layeh.com/radius/rfc2869"
)

// Message-Authenticator handling adapted from the reviewed MWX-ISP protocol
// pipeline (RFC 3579 §3.2, RFC 2869 §5.14). It is the RADIUS/UDP hardening lever
// for CVE-2024-3596 ("BlastRADIUS"); RadSec remains the only transport that
// protects the whole conversation.

// msgAuthResult reports the outcome of validating one incoming packet.
type msgAuthResult int

const (
	msgAuthAbsent msgAuthResult = iota
	msgAuthValid
	msgAuthInvalid
)

// headerLength is the fixed RADIUS header (Code, Identifier, Length, Authenticator).
const headerLength = 20

// Message-Authenticator modes, matching config.MsgAuth*.
const (
	modeDisabled = "disabled"
	modeWarn     = "warn"
	modeEnforce  = "enforce"
)

// computeMessageAuthenticator returns the HMAC-MD5 digest of the wire packet with
// every Message-Authenticator value zeroed. The buffer is copied, so the caller's
// packet is never mutated.
func computeMessageAuthenticator(wire, secret []byte) []byte {
	buf := make([]byte, len(wire))
	copy(buf, wire)
	for i := headerLength; i+2 <= len(buf); {
		attrLen := int(buf[i+1])
		if attrLen < 2 || i+attrLen > len(buf) {
			break
		}
		if buf[i] == byte(rfc2869.MessageAuthenticator_Type) && attrLen == 18 {
			for j := i + 2; j < i+attrLen; j++ {
				buf[j] = 0
			}
		}
		i += attrLen
	}
	mac := hmac.New(md5.New, secret)
	mac.Write(buf)
	return mac.Sum(nil)
}

// verifyMessageAuthenticator checks the optional attribute on an incoming
// Access-Request, whose digest covers the Request Authenticator as it stands.
func verifyMessageAuthenticator(pkt *radius.Packet, secret []byte) msgAuthResult {
	return verifyAuthenticator(pkt, secret, false)
}

// verifyDynamicAuthRequest checks the optional attribute on an incoming CoA- or
// Disconnect-Request. RFC 5176 §3.4 considers the Request Authenticator to be
// sixteen zero octets for that digest, because the client fills the field in only
// after inserting the attribute.
func verifyDynamicAuthRequest(pkt *radius.Packet, secret []byte) msgAuthResult {
	return verifyAuthenticator(pkt, secret, true)
}

// verifyAuthenticator implements the shared validation. More than one attribute, or
// a value that is not 16 octets, is invalid per RFC 3579 §3.2.
func verifyAuthenticator(pkt *radius.Packet, secret []byte, zeroRequestAuthenticator bool) msgAuthResult {
	if len(secret) == 0 {
		return msgAuthInvalid
	}
	values, err := rfc2869.MessageAuthenticator_Gets(pkt)
	if err != nil {
		return msgAuthInvalid
	}
	switch len(values) {
	case 0:
		return msgAuthAbsent
	case 1:
	default:
		return msgAuthInvalid
	}
	if len(values[0]) != md5.Size {
		return msgAuthInvalid
	}
	wire, err := pkt.MarshalBinary()
	if err != nil {
		return msgAuthInvalid
	}
	if zeroRequestAuthenticator {
		if subtle.ConstantTimeCompare(values[0], dynamicAuthRequestDigest(wire, secret)) == 1 {
			return msgAuthValid
		}
		return msgAuthInvalid
	}
	if subtle.ConstantTimeCompare(values[0], computeMessageAuthenticator(wire, secret)) == 1 {
		return msgAuthValid
	}
	return msgAuthInvalid
}

// dynamicAuthRequestDigest is the Message-Authenticator of a CoA- or
// Disconnect-Request. RFC 5176 §3.4 defines it with the Request Authenticator
// considered to be sixteen zero octets, since the client computes the digest before
// filling in that field.
func dynamicAuthRequestDigest(wire, secret []byte) []byte {
	if len(wire) < headerLength {
		return nil
	}
	buf := make([]byte, len(wire))
	copy(buf, wire)
	copy(buf[4:headerLength], make([]byte, md5.Size))
	return computeMessageAuthenticator(buf, secret)
}

// verifyResponseMessageAuthenticator validates the optional Message-Authenticator
// a NAS may include on a CoA/Disconnect reply (RFC 5176 §3.4). The reply digest
// is HMAC-MD5 over the reply with the Authenticator field set to the request
// authenticator, so that field is replaced before hashing. An absent attribute is
// accepted; a present but unverifiable one must be discarded.
func verifyResponseMessageAuthenticator(pkt *radius.Packet, requestAuth [16]byte, secret []byte) msgAuthResult {
	if len(secret) == 0 {
		return msgAuthInvalid
	}
	values, err := rfc2869.MessageAuthenticator_Gets(pkt)
	if err != nil {
		return msgAuthInvalid
	}
	switch len(values) {
	case 0:
		return msgAuthAbsent
	case 1:
	default:
		return msgAuthInvalid
	}
	if len(values[0]) != md5.Size {
		return msgAuthInvalid
	}
	wire, err := pkt.MarshalBinary()
	if err != nil {
		return msgAuthInvalid
	}
	// A parsed reply carries the Response Authenticator; the digest is defined
	// over the Request Authenticator instead.
	copy(wire[4:20], requestAuth[:])
	if subtle.ConstantTimeCompare(values[0], computeMessageAuthenticator(wire, secret)) == 1 {
		return msgAuthValid
	}
	return msgAuthInvalid
}

// signResponse adds a freshly computed Message-Authenticator to a response. It is
// a no-op when signing is disabled or no secret is available.
func signResponse(resp *radius.Packet, mode string, secret []byte) error {
	if mode == modeDisabled || len(secret) == 0 {
		return nil
	}
	if err := rfc2869.MessageAuthenticator_Set(resp, make([]byte, md5.Size)); err != nil {
		return err
	}
	wire, err := resp.MarshalBinary()
	if err != nil {
		return err
	}
	return rfc2869.MessageAuthenticator_Set(resp, computeMessageAuthenticator(wire, secret))
}

// messageAuthDecision maps the validation outcome and the configured mode to the
// action the pipeline must take. This is the pure policy core, kept separate so
// it can be tested without a socket.
func messageAuthDecision(mode string, result msgAuthResult) (discard bool) {
	if mode == modeDisabled {
		return false
	}
	switch result {
	case msgAuthInvalid:
		return true
	case msgAuthAbsent:
		return mode == modeEnforce
	default:
		return false
	}
}
