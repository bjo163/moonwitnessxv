// Package config holds the runtime's environment contract.
//
// Every durable fact belongs to ARSY; this package only describes where the
// process listens, which mounted files it may read, and how long it waits.
package config

import (
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"
)

// MsgAuth modes mirror the reviewed source semantics: incoming packets are
// validated and every signed-capable response is signed, unless disabled.
const (
	MsgAuthDisabled = "disabled"
	MsgAuthWarn     = "warn"
	MsgAuthEnforce  = "enforce"
)

const (
	defaultAuthAddr     = "127.0.0.1:1812"
	defaultAcctAddr     = "127.0.0.1:1813"
	defaultHealthAddr   = "127.0.0.1:8081"
	defaultARSYTimeout  = 4 * time.Second
	defaultSecretTTL    = 30 * time.Second
	defaultPollInterval = 2 * time.Second
	// defaultCOATimeout bounds one CoA/Disconnect attempt and defaultCOAMaxAttempts
	// bounds its retransmissions; both come from the reviewed source's budget.
	defaultCOATimeout     = 5 * time.Second
	defaultCOAMaxAttempts = 3
	// The runtime keeps bounded in-memory state only, so every size below is a hard
	// ceiling rather than a hint.
	defaultMaxNasTracked = 256
	defaultSecretCache   = 512
)

// Config is the validated process configuration.
type Config struct {
	ARSYBaseURL    string
	ARSYKeyFile    string
	ARSYTimeout    time.Duration
	SecretsDir     string
	SecretCache    int
	SecretTTL      time.Duration
	AuthAddr       string
	AcctAddr       string
	RadSecAddr     string
	RadSecCert     string
	RadSecKey      string
	RadSecCA       string
	HealthAddr     string
	MsgAuth        string
	COATimeout     time.Duration
	COAMaxAttempts int
	PollInterval   time.Duration
	MaxNASTracked  int
}

// Load reads the configuration from the supplied environment accessor and fails
// closed on anything ambiguous: a runtime that cannot tell which ARSY it talks
// to, or where its secrets live, must not open a protocol listener.
func Load(getenv func(string) string) (Config, error) {
	if getenv == nil {
		return Config{}, errors.New("isp-radius: no environment accessor")
	}
	cfg := Config{
		ARSYBaseURL:    strings.TrimSpace(getenv("ISP_ARSY_URL")),
		ARSYKeyFile:    strings.TrimSpace(getenv("ISP_ARSY_KEY_FILE")),
		SecretsDir:     strings.TrimSpace(getenv("ISP_SECRETS_DIR")),
		SecretCache:    defaultSecretCache,
		SecretTTL:      defaultSecretTTL,
		AuthAddr:       value(getenv, "ISP_RADIUS_AUTH_ADDR", defaultAuthAddr),
		AcctAddr:       value(getenv, "ISP_RADIUS_ACCT_ADDR", defaultAcctAddr),
		RadSecAddr:     strings.TrimSpace(getenv("ISP_RADSEC_ADDR")),
		RadSecCert:     strings.TrimSpace(getenv("ISP_RADSEC_CERT_FILE")),
		RadSecKey:      strings.TrimSpace(getenv("ISP_RADSEC_KEY_FILE")),
		RadSecCA:       strings.TrimSpace(getenv("ISP_RADSEC_CA_FILE")),
		HealthAddr:     value(getenv, "ISP_HEALTH_ADDR", defaultHealthAddr),
		MsgAuth:        strings.ToLower(value(getenv, "ISP_MSG_AUTHENTICATOR", MsgAuthWarn)),
		MaxNASTracked:  defaultMaxNasTracked,
		ARSYTimeout:    duration(getenv, "ISP_ARSY_TIMEOUT", defaultARSYTimeout),
		COATimeout:     duration(getenv, "ISP_COA_TIMEOUT", defaultCOATimeout),
		COAMaxAttempts: defaultCOAMaxAttempts,
		PollInterval:   duration(getenv, "ISP_ACTION_POLL_INTERVAL", defaultPollInterval),
	}

	if cfg.ARSYBaseURL == "" {
		return Config{}, errors.New("isp-radius: ISP_ARSY_URL is required")
	}
	parsed, err := url.Parse(cfg.ARSYBaseURL)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return Config{}, fmt.Errorf("isp-radius: ISP_ARSY_URL %q must be an absolute http(s) address", cfg.ARSYBaseURL)
	}
	cfg.ARSYBaseURL = strings.TrimRight(cfg.ARSYBaseURL, "/")
	if cfg.ARSYKeyFile == "" {
		return Config{}, errors.New("isp-radius: ISP_ARSY_KEY_FILE is required (the D00 service key is a mounted file, never an environment value)")
	}
	if cfg.SecretsDir == "" {
		return Config{}, errors.New("isp-radius: ISP_SECRETS_DIR is required")
	}
	if cfg.AuthAddr == cfg.AcctAddr {
		return Config{}, errors.New("isp-radius: authentication and accounting listeners need distinct addresses")
	}
	switch cfg.MsgAuth {
	case MsgAuthDisabled, MsgAuthWarn, MsgAuthEnforce:
	default:
		return Config{}, fmt.Errorf("isp-radius: ISP_MSG_AUTHENTICATOR %q must be one of disabled, warn, enforce", cfg.MsgAuth)
	}
	if cfg.RadSecAddr == "" && (cfg.RadSecCert != "" || cfg.RadSecKey != "" || cfg.RadSecCA != "") {
		return Config{}, errors.New("isp-radius: RadSec certificate material requires ISP_RADSEC_ADDR")
	}
	if cfg.RadSecAddr != "" && (cfg.RadSecCert == "" || cfg.RadSecKey == "" || cfg.RadSecCA == "") {
		// A RadSec listener without a client CA bundle would advertise trust it
		// cannot check.
		return Config{}, errors.New("isp-radius: ISP_RADSEC_ADDR needs a certificate, key and client CA file")
	}
	if cfg.ARSYTimeout <= 0 || cfg.COATimeout <= 0 {
		return Config{}, errors.New("isp-radius: ARSY and CoA timeouts must be positive")
	}
	if cfg.PollInterval < 200*time.Millisecond || cfg.PollInterval > time.Minute {
		return Config{}, errors.New("isp-radius: ISP_ACTION_POLL_INTERVAL must be between 200ms and 60s")
	}
	return cfg, nil
}

func value(getenv func(string) string, key, fallback string) string {
	raw := strings.TrimSpace(getenv(key))
	if raw == "" {
		return fallback
	}
	return raw
}

func duration(getenv func(string) string, key string, fallback time.Duration) time.Duration {
	raw := strings.TrimSpace(getenv(key))
	if raw == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(raw)
	if err != nil {
		return fallback
	}
	return parsed
}
