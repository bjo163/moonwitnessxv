package config

import (
	"strings"
	"testing"
	"time"
)

func TestNilEnvironmentAccessorCannotDescribeTheRuntime(t *testing.T) {
	cfg, err := Load(nil)
	if err == nil {
		t.Fatalf("Load(nil) = %+v, want an error: a runtime with no environment must not start", cfg)
	}
	if cfg != (Config{}) {
		t.Fatalf("config = %+v, want the zero configuration alongside the error", cfg)
	}
}

func TestRequiredEnvironmentValuesFailClosed(t *testing.T) {
	cases := []struct {
		name   string
		mutate func(map[string]string)
		wantIn string
	}{
		{
			name:   "no ARSY address",
			mutate: func(v map[string]string) { delete(v, "ISP_ARSY_URL") },
			wantIn: "ISP_ARSY_URL",
		},
		{
			name:   "whitespace is not an ARSY address",
			mutate: func(v map[string]string) { v["ISP_ARSY_URL"] = "   " },
			wantIn: "ISP_ARSY_URL",
		},
		{
			name: "an inline service key is not accepted",
			mutate: func(v map[string]string) {
				delete(v, "ISP_ARSY_KEY_FILE")
				// The key is only ever read from a mount, so an inline value must
				// not satisfy the contract.
				v["ISP_ARSY_KEY"] = "synthetic-inline-service-key"
			},
			wantIn: "ISP_ARSY_KEY_FILE",
		},
		{
			name:   "no secrets directory",
			mutate: func(v map[string]string) { delete(v, "ISP_SECRETS_DIR") },
			wantIn: "ISP_SECRETS_DIR",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			values := validEnvironment()
			tc.mutate(values)
			cfg, err := Load(env(values))
			if err == nil {
				t.Fatalf("Load = %+v, nil error, want the runtime to refuse to start", cfg)
			}
			if !strings.Contains(err.Error(), tc.wantIn) {
				t.Fatalf("error = %q, want it to name %s", err, tc.wantIn)
			}
			if cfg != (Config{}) {
				t.Fatalf("config = %+v, want the zero configuration on a rejected environment", cfg)
			}
		})
	}
}

func TestTheServiceKeyContractSaysItIsAMountedFile(t *testing.T) {
	values := validEnvironment()
	delete(values, "ISP_ARSY_KEY_FILE")

	_, err := Load(env(values))
	if err == nil {
		t.Fatalf("Load accepted an environment with no service key file, want a refusal")
	}
	if !strings.Contains(err.Error(), "mounted file") {
		t.Fatalf("error = %q, want it to state that the D00 service key is a mounted file and never an environment value", err)
	}
}

func TestARSYAddressMustBeAnAbsoluteHttpOrHttpsURLWithAHost(t *testing.T) {
	cases := []string{
		"arsy.invalid:8443",
		"//arsy.invalid/endpoint",
		"ftp://arsy.invalid",
		"http:///no-host",
		"https://",
		"http://%zz.arsy.invalid",
	}
	for _, raw := range cases {
		t.Run(raw, func(t *testing.T) {
			values := validEnvironment()
			values["ISP_ARSY_URL"] = raw
			cfg, err := Load(env(values))
			if err == nil {
				t.Fatalf("Load(%q) = %+v, want a refusal: the runtime cannot name the ARSY it trusts", raw, cfg)
			}
			if !strings.Contains(err.Error(), "ISP_ARSY_URL") {
				t.Fatalf("error = %q, want it to name ISP_ARSY_URL", err)
			}
		})
	}
}

func TestTrailingSlashesAreNormalisedOutOfTheARSYAddress(t *testing.T) {
	cases := map[string]string{
		"https://arsy.invalid:8443":      "https://arsy.invalid:8443",
		"https://arsy.invalid:8443/":     "https://arsy.invalid:8443",
		"http://arsy.invalid///":         "http://arsy.invalid",
		"  https://arsy.invalid:8443/  ": "https://arsy.invalid:8443",
	}
	for raw, want := range cases {
		values := validEnvironment()
		values["ISP_ARSY_URL"] = raw
		cfg, err := Load(env(values))
		if err != nil {
			t.Fatalf("Load(%q): %v, want the address accepted", raw, err)
		}
		if cfg.ARSYBaseURL != want {
			t.Fatalf("ARSYBaseURL = %q from input %q, want %q", cfg.ARSYBaseURL, raw, want)
		}
	}
}

func TestAuthenticationAndAccountingListenersMustBeDistinct(t *testing.T) {
	values := validEnvironment()
	values["ISP_RADIUS_AUTH_ADDR"] = "127.0.0.1:1812"
	values["ISP_RADIUS_ACCT_ADDR"] = "127.0.0.1:1812"
	if cfg, err := Load(env(values)); err == nil {
		t.Fatalf("Load = %+v, want a refusal: one port cannot answer both Access-Request and Accounting-Request", cfg)
	}

	values = validEnvironment()
	values["ISP_RADIUS_AUTH_ADDR"] = "127.0.0.1:1812"
	values["ISP_RADIUS_ACCT_ADDR"] = "127.0.0.1:1814"
	cfg, err := Load(env(values))
	if err != nil {
		t.Fatalf("Load with distinct listeners: %v", err)
	}
	if cfg.AuthAddr != "127.0.0.1:1812" || cfg.AcctAddr != "127.0.0.1:1814" {
		t.Fatalf("listeners = %s and %s, want the addresses the environment declared", cfg.AuthAddr, cfg.AcctAddr)
	}
}

func TestMessageAuthenticatorAcceptsOnlyTheThreeModesAndDefaultsToWarn(t *testing.T) {
	cases := []struct {
		raw  string
		want string
	}{
		{raw: "", want: MsgAuthWarn},
		{raw: "   ", want: MsgAuthWarn},
		{raw: "disabled", want: MsgAuthDisabled},
		{raw: "warn", want: MsgAuthWarn},
		{raw: "enforce", want: MsgAuthEnforce},
		{raw: "ENFORCE", want: MsgAuthEnforce},
		{raw: "WaRn", want: MsgAuthWarn},
		{raw: " enforce ", want: MsgAuthEnforce},
	}
	for _, tc := range cases {
		values := validEnvironment()
		values["ISP_MSG_AUTHENTICATOR"] = tc.raw
		cfg, err := Load(env(values))
		if err != nil {
			t.Fatalf("Load with ISP_MSG_AUTHENTICATOR=%q: %v, want it accepted", tc.raw, err)
		}
		if cfg.MsgAuth != tc.want {
			t.Fatalf("MsgAuth = %q from input %q, want %q", cfg.MsgAuth, tc.raw, tc.want)
		}
	}

	for _, raw := range []string{"silent", "required", "off"} {
		values := validEnvironment()
		values["ISP_MSG_AUTHENTICATOR"] = raw
		cfg, err := Load(env(values))
		if err == nil {
			t.Fatalf("Load with ISP_MSG_AUTHENTICATOR=%q = %+v, want a refusal: an unknown mode cannot describe how packets are checked", raw, cfg)
		}
		if !strings.Contains(err.Error(), "ISP_MSG_AUTHENTICATOR") {
			t.Fatalf("error = %q, want it to name ISP_MSG_AUTHENTICATOR", err)
		}
	}
}

func TestRadSecIsAllOrNothing(t *testing.T) {
	cases := []struct {
		name   string
		set    map[string]string
		wantIn string
	}{
		{
			name:   "a certificate with no RadSec listener",
			set:    map[string]string{"ISP_RADSEC_CERT_FILE": "/run/secrets/radsec.crt"},
			wantIn: "ISP_RADSEC_ADDR",
		},
		{
			name:   "a key with no RadSec listener",
			set:    map[string]string{"ISP_RADSEC_KEY_FILE": "/run/secrets/radsec.key"},
			wantIn: "ISP_RADSEC_ADDR",
		},
		{
			name:   "a client CA with no RadSec listener",
			set:    map[string]string{"ISP_RADSEC_CA_FILE": "/run/secrets/radsec-ca.crt"},
			wantIn: "ISP_RADSEC_ADDR",
		},
		{
			name: "a listener with no client CA",
			set: map[string]string{
				"ISP_RADSEC_ADDR":      "127.0.0.1:2083",
				"ISP_RADSEC_CERT_FILE": "/run/secrets/radsec.crt",
				"ISP_RADSEC_KEY_FILE":  "/run/secrets/radsec.key",
			},
			wantIn: "client CA",
		},
		{
			name: "a listener with only a certificate",
			set: map[string]string{
				"ISP_RADSEC_ADDR":      "127.0.0.1:2083",
				"ISP_RADSEC_CERT_FILE": "/run/secrets/radsec.crt",
			},
			wantIn: "client CA",
		},
		{
			name:   "a listener with no material at all",
			set:    map[string]string{"ISP_RADSEC_ADDR": "127.0.0.1:2083"},
			wantIn: "client CA",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			values := validEnvironment()
			for key, raw := range tc.set {
				values[key] = raw
			}
			cfg, err := Load(env(values))
			if err == nil {
				t.Fatalf("Load = %+v, want the runtime to refuse a RadSec port %s", cfg, tc.name)
			}
			if !strings.Contains(err.Error(), tc.wantIn) {
				t.Fatalf("error = %q, want it to name %s", err, tc.wantIn)
			}
		})
	}

	values := validEnvironment()
	values["ISP_RADSEC_ADDR"] = "127.0.0.1:2083"
	values["ISP_RADSEC_CERT_FILE"] = "/run/secrets/radsec.crt"
	values["ISP_RADSEC_KEY_FILE"] = "/run/secrets/radsec.key"
	values["ISP_RADSEC_CA_FILE"] = "/run/secrets/radsec-ca.crt"
	cfg, err := Load(env(values))
	if err != nil {
		t.Fatalf("Load with the complete RadSec trio: %v", err)
	}
	if cfg.RadSecAddr != "127.0.0.1:2083" || cfg.RadSecCert == "" || cfg.RadSecKey == "" || cfg.RadSecCA == "" {
		t.Fatalf("RadSec settings = %+v, want the mounted trio carried through unchanged", cfg)
	}
}

func TestEveryTimeoutMustBePositive(t *testing.T) {
	cases := []struct {
		name  string
		key   string
		value string
	}{
		{"a zero ARSY timeout", "ISP_ARSY_TIMEOUT", "0s"},
		{"a negative ARSY timeout", "ISP_ARSY_TIMEOUT", "-3s"},
		{"a zero ARSY timeout in seconds", "ISP_ARSY_TIMEOUT", "0"},
		{"a negative CoA timeout", "ISP_COA_TIMEOUT", "-1ms"},
		{"a zero CoA timeout", "ISP_COA_TIMEOUT", "0s"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			values := validEnvironment()
			values[tc.key] = tc.value
			cfg, err := Load(env(values))
			if err == nil {
				t.Fatalf("Load with %s=%s = %+v, want a refusal: an unset deadline is not a bound", tc.key, tc.value, cfg)
			}
			if !strings.Contains(err.Error(), "positive") {
				t.Fatalf("error = %q, want it to say the timeouts must be positive", err)
			}
		})
	}
}

func TestTheActionPollIntervalIsBoundedToTheReviewedRange(t *testing.T) {
	for _, raw := range []string{"200ms", "1s", "60s"} {
		values := validEnvironment()
		values["ISP_ACTION_POLL_INTERVAL"] = raw
		cfg, err := Load(env(values))
		if err != nil {
			t.Fatalf("Load with ISP_ACTION_POLL_INTERVAL=%s: %v, want the boundary accepted", raw, err)
		}
		want, err := time.ParseDuration(raw)
		if err != nil {
			t.Fatalf("parse %q: %v", raw, err)
		}
		if cfg.PollInterval != want {
			t.Fatalf("PollInterval = %s, want %s", cfg.PollInterval, want)
		}
	}

	for _, raw := range []string{"199ms", "100ms", "0s", "61s", "600s", "-1s"} {
		values := validEnvironment()
		values["ISP_ACTION_POLL_INTERVAL"] = raw
		cfg, err := Load(env(values))
		if err == nil {
			t.Fatalf("Load with ISP_ACTION_POLL_INTERVAL=%s = %+v, want a refusal outside 200ms to 60s", raw, cfg)
		}
		if !strings.Contains(err.Error(), "ISP_ACTION_POLL_INTERVAL") {
			t.Fatalf("error = %q, want it to name ISP_ACTION_POLL_INTERVAL", err)
		}
	}
}

func TestAMalformedDurationFallsBackToTheDefaultInsteadOfCrashing(t *testing.T) {
	cases := []struct {
		key  string
		want time.Duration
	}{
		{"ISP_ACTION_POLL_INTERVAL", defaultPollInterval},
		{"ISP_ARSY_TIMEOUT", defaultARSYTimeout},
		{"ISP_COA_TIMEOUT", defaultCOATimeout},
	}
	for _, tc := range cases {
		values := validEnvironment()
		values[tc.key] = "in-a-bit"
		cfg, err := Load(env(values))
		if err != nil {
			t.Fatalf("Load with %s=nonsense: %v, want the default used", tc.key, err)
		}
		got := map[string]time.Duration{
			"ISP_ACTION_POLL_INTERVAL": cfg.PollInterval,
			"ISP_ARSY_TIMEOUT":         cfg.ARSYTimeout,
			"ISP_COA_TIMEOUT":          cfg.COATimeout,
		}[tc.key]
		if got != tc.want {
			t.Fatalf("%s = %s, want the %s default after an unreadable value", tc.key, got, tc.want)
		}
	}
}

func TestUnsetSettingsTakeTheReviewedDefaults(t *testing.T) {
	cfg, err := Load(env(validEnvironment()))
	if err != nil {
		t.Fatalf("Load with only the required values: %v", err)
	}
	if cfg.ARSYBaseURL != "https://arsy.invalid:8443" {
		t.Fatalf("ARSYBaseURL = %q, want the address the environment declared", cfg.ARSYBaseURL)
	}
	if cfg.ARSYKeyFile != "/run/secrets/arsy-d00-key" {
		t.Fatalf("ARSYKeyFile = %q, want the mounted path the environment declared", cfg.ARSYKeyFile)
	}
	if cfg.SecretsDir != "/run/secrets/isp-nas" {
		t.Fatalf("SecretsDir = %q, want the mounted directory the environment declared", cfg.SecretsDir)
	}
	if cfg.AuthAddr != defaultAuthAddr || cfg.AcctAddr != defaultAcctAddr || cfg.HealthAddr != defaultHealthAddr {
		t.Fatalf("listeners = %s, %s and %s, want the defaults %s, %s and %s",
			cfg.AuthAddr, cfg.AcctAddr, cfg.HealthAddr, defaultAuthAddr, defaultAcctAddr, defaultHealthAddr)
	}
	if cfg.MsgAuth != MsgAuthWarn {
		t.Fatalf("MsgAuth = %q, want the %q default", cfg.MsgAuth, MsgAuthWarn)
	}
	if cfg.ARSYTimeout != defaultARSYTimeout || cfg.COATimeout != defaultCOATimeout || cfg.PollInterval != defaultPollInterval {
		t.Fatalf("timeouts = %s, %s and %s, want the defaults %s, %s and %s",
			cfg.ARSYTimeout, cfg.COATimeout, cfg.PollInterval, defaultARSYTimeout, defaultCOATimeout, defaultPollInterval)
	}
	if cfg.SecretTTL != defaultSecretTTL || cfg.SecretCache != defaultSecretCache {
		t.Fatalf("secret view = %s for %d references, want %s for %d",
			cfg.SecretTTL, cfg.SecretCache, defaultSecretTTL, defaultSecretCache)
	}
	if cfg.COAMaxAttempts != defaultCOAMaxAttempts || cfg.MaxNASTracked != defaultMaxNasTracked {
		t.Fatalf("bounded state = %d CoA attempts and %d NASs, want %d and %d",
			cfg.COAMaxAttempts, cfg.MaxNASTracked, defaultCOAMaxAttempts, defaultMaxNasTracked)
	}
	if cfg.RadSecAddr != "" || cfg.RadSecCert != "" || cfg.RadSecKey != "" || cfg.RadSecCA != "" {
		t.Fatalf("RadSec settings = %+v, want them unset when the environment asks for no RadSec port", cfg)
	}
}

func validEnvironment() map[string]string {
	return map[string]string{
		"ISP_ARSY_URL":      "https://arsy.invalid:8443",
		"ISP_ARSY_KEY_FILE": "/run/secrets/arsy-d00-key",
		"ISP_SECRETS_DIR":   "/run/secrets/isp-nas",
	}
}

func env(values map[string]string) func(string) string {
	return func(key string) string { return values[key] }
}
