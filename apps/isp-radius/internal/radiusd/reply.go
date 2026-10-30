package radiusd

import (
	"fmt"

	"layeh.com/radius"
	"layeh.com/radius/rfc2865"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/arsy"
)

// attr is one reply attribute the runtime may set. The D20 boundary deliberately
// stops here: the reviewed vendor and WISPr dictionaries stay in the NAS-side
// profile configuration, so the runtime returns one bounded opaque Class instead
// of inventing a vendor attribute encoder with no owning tenant decision behind
// it. The reviewed EAP state machines and vendor dictionaries are not carried
// over: this runtime authenticates the PAP credential the NAS protected with the
// shared secret and leaves EAP type negotiation to the NAS profile.
type attr struct {
	value string
}

func (a attr) apply(pkt *radius.Packet) error {
	return rfc2865.Class_SetString(pkt, a.value)
}

// classAttribute encodes the accepted profile decision into one Class attribute,
// truncated to the RADIUS attribute limit so a hostile profile cannot produce an
// over-long packet.
func classAttribute(profile arsy.ProfileAttributes) []attr {
	value := fmt.Sprintf("isp-limit=%d;isp-up=%d;isp-down=%d",
		profile.SessionLimit, profile.UploadKbps, profile.DownloadKbps)
	if len(value) > 64 {
		value = value[:64]
	}
	return []attr{{value: value}}
}

func rfcNASIdentifier(pkt *radius.Packet) string {
	return rfc2865.NASIdentifier_GetString(pkt)
}
