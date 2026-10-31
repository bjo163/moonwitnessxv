package main

import (
	"fmt"

	"layeh.com/radius"
	"layeh.com/radius/rfc2865"
	"layeh.com/radius/rfc2866"
	"layeh.com/radius/rfc2869"
	"layeh.com/radius/rfc3162"
	"layeh.com/radius/rfc3576"
	"layeh.com/radius/rfc5176"
)

func main() {
	p := radius.New(radius.CodeAccessRequest, []byte("secret"))
	rfc2865.NASIdentifier_Add(p, []byte("nas"))
	rfc2866.AcctStatusType_AddInt32(p, rfc2866.AcctStatusType_Start)
	rfc2869.MessageAuthenticator_Add(p, make([]byte, 16))
	rfc3162.DelegatedIPv6Prefix_Add(p, rfc3162.DelegatedIPv6Prefix{})
	rfc3576.CoAState_Add(p, rfc3576.CoAStateType.CoAEntered)
	rfc5176.DisconnectCause_Add(p, rfc5176.DisconnectCauseType.Admin)
	fmt.Println(p.Code, len(p.Attributes))
}
