// Command isp-radius is the D20 RADIUS and RadSec protocol runtime.
//
// It speaks the protocol and nothing else: tenants, credentials, accounting and
// operator actions all live in ARSY, and shared secrets only ever come from
// mounted files. Disabling this process is the rollback - it owns no data.
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/arsy"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/config"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/health"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/radiusd"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/radsec"
	"github.com/bjo163/moonwitnessxv/apps/isp-radius/internal/secrets"
)

func main() {
	dryRun := flag.Bool("check", false, "validate configuration and mounted material, then exit")
	flag.Parse()

	if err := run(context.Background(), *dryRun); err != nil {
		fmt.Fprintln(os.Stderr, "isp-radius:", err)
		os.Exit(1)
	}
}

func run(parent context.Context, dryRun bool) error {
	env := func(key string) string { return strings.TrimSpace(os.Getenv(key)) }
	cfg, err := config.Load(env)
	if err != nil {
		return err
	}
	log := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: levelFrom(env("ISP_LOG_LEVEL")),
	}))

	apiKey, err := readMountedKey(cfg.ARSYKeyFile)
	if err != nil {
		return err
	}
	store, err := secrets.NewStore(cfg.SecretsDir, cfg.SecretCache, cfg.SecretTTL)
	if err != nil {
		return err
	}
	client, err := arsy.NewClient(cfg.ARSYBaseURL, apiKey, cfg.ARSYTimeout)
	if err != nil {
		return err
	}
	handler, err := radiusd.NewHandler(radiusd.Deps{
		ARSY:          client,
		Secrets:       store,
		MsgAuth:       cfg.MsgAuth,
		Log:           log,
		MaxNASTracked: cfg.MaxNASTracked,
	})
	if err != nil {
		return err
	}
	state := health.NewState(client.Probe)

	sender, err := radiusd.NewSender(radiusd.COAConfig{
		Timeout:     cfg.COATimeout,
		MaxAttempts: cfg.COAMaxAttempts,
	}, store, log)
	if err != nil {
		return err
	}
	runner, err := radiusd.NewRunner(client, sender, handler, cfg.PollInterval, state, log)
	if err != nil {
		return err
	}

	if dryRun {
		// Config and mounted material are enough to answer a check; no socket
		// opens, so a validation run cannot disturb a live NAS.
		log.Info("isp-radius: configuration and mounted material are valid", "arsy", cfg.ARSYBaseURL)
		return nil
	}

	ctx, cancel := context.WithCancel(parent)
	defer cancel()
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(signals)

	errs := make(chan error, 5)
	supervised := 0
	supervise := func(work func() error) {
		supervised++
		go func() { errs <- work() }()
	}

	supervise(func() error {
		return runListener(ctx, &radiusd.Listener{Name: "radius_auth", Addr: cfg.AuthAddr, Handler: handler, State: state, Log: log})
	})
	supervise(func() error {
		return runListener(ctx, &radiusd.Listener{Name: "radius_acct", Addr: cfg.AcctAddr, Handler: handler, State: state, Log: log})
	})
	if cfg.RadSecAddr != "" {
		material := radsec.Material{CertFile: cfg.RadSecCert, KeyFile: cfg.RadSecKey, CAFile: cfg.RadSecCA}
		tlsConfig, err := material.ServerConfig()
		if err != nil {
			return err
		}
		supervise(func() error {
			return (&radsec.Listener{Addr: cfg.RadSecAddr, Config: tlsConfig, Handler: handler, State: state, Log: log}).Serve(ctx)
		})
	}
	supervise(func() error { return runner.Run(ctx) })
	supervise(func() error { return state.Serve(ctx, cfg.HealthAddr) })

	consumed := 0
	select {
	case sig := <-signals:
		log.Info("isp-radius: shutting down", "signal", sig.String())
		cancel()
	case err := <-errs:
		consumed = 1
		cancel()
		if err != nil {
			return err
		}
	}

	// Drain the supervised goroutines so a shutdown leaves nothing half-closed.
	for i := 0; i < supervised-consumed; i++ {
		err := <-errs
		if err != nil && !errors.Is(err, http.ErrServerClosed) && !errors.Is(err, context.Canceled) {
			return err
		}
	}
	log.Info("isp-radius: stopped", "counters", fmt.Sprintf("%+v", handler.Stats()))
	return nil
}

func runListener(ctx context.Context, listener *radiusd.Listener) error {
	err := listener.Serve(ctx)
	if errors.Is(err, context.Canceled) {
		return nil
	}
	return err
}

// readMountedKey loads the D00 service key from its mounted file. The value is
// never logged and never placed in the environment.
func readMountedKey(path string) (string, error) {
	raw, err := os.ReadFile(path) //nolint:gosec // path is operator configuration
	if err != nil {
		return "", fmt.Errorf("read mounted ARSY service key %q: %w", path, err)
	}
	key := strings.TrimRight(string(raw), "\r\n")
	if key == "" {
		return "", fmt.Errorf("mounted ARSY service key %q is empty", path)
	}
	return key, nil
}

func levelFrom(value string) slog.Level {
	switch strings.ToLower(value) {
	case "debug":
		return slog.LevelDebug
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
