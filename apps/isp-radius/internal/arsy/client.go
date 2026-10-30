// Package arsy is the D20 service adapter: the only way this runtime reaches
// durable state. Every call is a scoped service request to ARSY and every
// failure is classified so the protocol layer can fail closed.
package arsy

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// restPrefix is where ARSY mounts its REST surface.
const restPrefix = "/api/v1"

// ProfileAttributes mirrors the bounded reply payload ARSY returns for an
// accepted RADIUS user. It carries the tenant's profile decision, not a
// dictionary of vendor attributes.
type ProfileAttributes struct {
	SessionLimit            int    `json:"sessionLimit"`
	UploadKbps              int    `json:"uploadKbps"`
	DownloadKbps            int    `json:"downloadKbps"`
	AddressPool             string `json:"addressPool"`
	IPv6PrefixPool          string `json:"ipv6PrefixPool"`
	DelegatedIPv6PrefixPool string `json:"delegatedIpv6PrefixPool"`
	VendorDomain            string `json:"vendorDomain"`
}

// NASResolution is the answer to /isp-radius/nas/resolve. SecretRef names a
// mounted file; the secret value itself never appears here.
type NASResolution struct {
	Resolved      bool   `json:"resolved"`
	TenantRef     string `json:"tenantRef"`
	NASRef        string `json:"nasRef"`
	NASID         string `json:"nasId"`
	NASAddress    string `json:"nasAddress"`
	SecretRef     string `json:"secretRef"`
	RadSecEnabled bool   `json:"radsecEnabled"`
}

// Authorization is the answer to /isp-radius/authorize.
type Authorization struct {
	Decision   string            `json:"decision"`
	Attributes ProfileAttributes `json:"attributes"`
}

// AccountingReceipt confirms ARSY persisted the event.
type AccountingReceipt struct {
	Acknowledged bool   `json:"acknowledged"`
	EventKey     string `json:"eventKey"`
}

// AccountingRequest is one durable accounting event. EventKey is the idempotency
// key ARSY enforces, so a NAS retransmission cannot double-book a session.
type AccountingRequest struct {
	NASID          string `json:"nasId"`
	Username       string `json:"username"`
	SessionKey     string `json:"sessionKey"`
	EventKey       string `json:"eventKey"`
	EventType      string `json:"eventType"`
	EventAt        string `json:"eventAt"`
	InputOctets    uint64 `json:"inputOctets"`
	OutputOctets   uint64 `json:"outputOctets"`
	SessionSeconds uint64 `json:"sessionSeconds"`
}

// SessionAction is a pending operator instruction the runtime must deliver to a
// NAS as CoA or Disconnect-Request. SessionKey and Username come from the
// session ARSY recorded, because RFC 5176 identifies the target session.
type SessionAction struct {
	ID         string `json:"id"`
	SessionRef string `json:"sessionRef"`
	SessionKey string `json:"sessionKey"`
	Username   string `json:"username"`
	ActionKey  string `json:"actionKey"`
	Action     string `json:"action"`
	State      string `json:"state"`
	Attempts   int    `json:"attempts"`
}

// ActionResult reports what the NAS answered.
type ActionResult struct {
	NASID    string `json:"nasId"`
	ActionID string `json:"actionId"`
	Result   string `json:"result"`
	Detail   string `json:"detail"`
}

// ErrUnavailable reports that ARSY could not answer at all (transport failure or
// a server-side error). The protocol layer must not grant or acknowledge
// anything on this answer.
var ErrUnavailable = errors.New("arsy: ARSY is unavailable")

// ErrDenied reports that the service credential or tenant grant was refused.
// It is an availability problem, not a user decision, so it also fails closed.
var ErrDenied = errors.New("arsy: service credential refused")

// ErrNotFound reports that the NAS or RADIUS user is not authorised for this
// service. Unlike ErrUnavailable it is a definitive answer from ARSY.
var ErrNotFound = errors.New("arsy: record not found")

// ErrConflict reports that an idempotency key was reused for a different record.
var ErrConflict = errors.New("arsy: idempotency conflict")

// Client talks to the ARSY D20 service routes with a mounted D00 API key.
type Client struct {
	baseURL string
	apiKey  string
	http    *http.Client
}

// NewClient builds the adapter. The API key must already be read from its
// mounted file; it is never logged and never sent over a plain host other than
// the configured one.
//
// The base URL is the ARSY origin: when it carries no path the D20 routes are
// reached under ARSY's REST prefix, so deployment configuration names a host,
// not a route layout.
func NewClient(baseURL, apiKey string, timeout time.Duration) (*Client, error) {
	if strings.TrimSpace(baseURL) == "" {
		return nil, errors.New("arsy: base URL is required")
	}
	if strings.TrimSpace(apiKey) == "" {
		return nil, errors.New("arsy: service API key is required")
	}
	parsed, err := url.Parse(baseURL)
	if err != nil || parsed.Host == "" {
		return nil, fmt.Errorf("arsy: invalid base URL %q", baseURL)
	}
	if parsed.Path == "" || parsed.Path == "/" {
		parsed.Path = restPrefix
	}
	if timeout <= 0 {
		timeout = 4 * time.Second
	}
	return &Client{
		baseURL: strings.TrimRight(parsed.String(), "/"),
		apiKey:  apiKey,
		http:    &http.Client{Timeout: timeout},
	}, nil
}

// ResolveNAS asks ARSY which tenant owns a NAS identifier and where its secret
// is mounted. An unresolved answer is a definitive "this NAS is not served".
func (c *Client) ResolveNAS(ctx context.Context, nasID string) (NASResolution, error) {
	var out NASResolution
	err := c.post(ctx, "/isp-radius/nas/resolve", map[string]string{"nasId": nasID}, &out)
	if err != nil {
		return NASResolution{}, err
	}
	return out, nil
}

// Authorize runs the tenant-scoped credential check inside ARSY.
func (c *Client) Authorize(ctx context.Context, nasID, username, password string) (Authorization, error) {
	var out Authorization
	err := c.post(ctx, "/isp-radius/authorize", map[string]string{
		"nasId":    nasID,
		"username": username,
		"password": password,
	}, &out)
	if err != nil {
		return Authorization{}, err
	}
	if out.Decision != "accept" && out.Decision != "reject" {
		return Authorization{}, fmt.Errorf("arsy: unexpected authorize decision %q", out.Decision)
	}
	return out, nil
}

// StoreAccounting persists one accounting event and returns the receipt only
// when ARSY wrote it.
func (c *Client) StoreAccounting(ctx context.Context, req AccountingRequest) (AccountingReceipt, error) {
	var out AccountingReceipt
	err := c.post(ctx, "/isp-radius/accounting", req, &out)
	if err != nil {
		return AccountingReceipt{}, err
	}
	if !out.Acknowledged {
		return AccountingReceipt{}, errors.New("arsy: accounting receipt was not acknowledged")
	}
	return out, nil
}

// PendingActions lists the retryable operator actions ARSY has already recorded
// for this NAS.
func (c *Client) PendingActions(ctx context.Context, nasID string) ([]SessionAction, error) {
	var out []SessionAction
	endpoint := c.baseURL + "/isp-radius/session-actions?nasId=" + url.QueryEscape(nasID)
	err := c.do(ctx, http.MethodGet, endpoint, nil, &out)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// ReportAction records the NAS answer for one action.
func (c *Client) ReportAction(ctx context.Context, res ActionResult) error {
	var out map[string]any
	return c.post(ctx, "/isp-radius/session-actions", res, &out)
}

// Probe answers whether ARSY responds at all; readiness uses it rather than a
// cached assumption.
func (c *Client) Probe(ctx context.Context) error {
	var out map[string]any
	endpoint := c.baseURL + "/health/ready"
	if err := c.do(ctx, http.MethodGet, endpoint, nil, &out); err != nil {
		return err
	}
	return nil
}

func (c *Client) post(ctx context.Context, path string, body any, out any) error {
	return c.do(ctx, http.MethodPost, c.baseURL+path, body, out)
}

func (c *Client) do(ctx context.Context, method, endpoint string, body any, out any) error {
	var payload io.Reader
	if body != nil {
		encoded, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("arsy: encode request: %w", err)
		}
		payload = bytes.NewReader(encoded)
	}
	req, err := http.NewRequestWithContext(ctx, method, endpoint, payload)
	if err != nil {
		return fmt.Errorf("arsy: build request: %w", err)
	}
	req.Header.Set("accept", "application/json")
	if body != nil {
		req.Header.Set("content-type", "application/json")
	}
	req.Header.Set("x-api-key", c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrUnavailable, err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return fmt.Errorf("%w: read response: %v", ErrUnavailable, err)
	}

	switch {
	case resp.StatusCode >= 500:
		return fmt.Errorf("%w: %s returned %d", ErrUnavailable, method+" "+endpoint, resp.StatusCode)
	case resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden:
		return fmt.Errorf("%w: %s returned %d", ErrDenied, method+" "+endpoint, resp.StatusCode)
	case resp.StatusCode == http.StatusNotFound:
		return ErrNotFound
	case resp.StatusCode == http.StatusConflict:
		return ErrConflict
	case resp.StatusCode >= 400:
		return fmt.Errorf("arsy: %s returned %d: %s", method+" "+endpoint, resp.StatusCode, envelopeMessage(data))
	}

	var envelope struct {
		OK   bool            `json:"ok"`
		Data json.RawMessage `json:"data"`
	}
	if err := json.Unmarshal(data, &envelope); err != nil {
		return fmt.Errorf("arsy: decode envelope: %w", err)
	}
	if !envelope.OK || len(envelope.Data) == 0 {
		return errors.New("arsy: response envelope is missing data")
	}
	if out == nil {
		return nil
	}
	if err := json.Unmarshal(envelope.Data, out); err != nil {
		return fmt.Errorf("arsy: decode payload: %w", err)
	}
	return nil
}

// envelopeMessage extracts the ARSY error text without echoing a request body,
// which can carry a credential during an authorize call.
func envelopeMessage(data []byte) string {
	var envelope struct {
		Error struct {
			Message string `json:"message"`
		} `json:"error"`
	}
	if err := json.Unmarshal(data, &envelope); err == nil && envelope.Error.Message != "" {
		return envelope.Error.Message
	}
	return "unreadable error response"
}
