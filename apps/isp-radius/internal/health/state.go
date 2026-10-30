// Package health reports what the process can actually prove about itself.
//
// Liveness says the process is serving HTTP. Readiness additionally requires
// every declared listener to be bound and ARSY to answer, so a container
// orchestrator never routes traffic to a runtime that would deny every NAS.
package health

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"sort"
	"sync"
	"time"
)

// Component is one declared dependency of the process, reported truthfully.
type Component struct {
	Ready  bool   `json:"ready"`
	Detail string `json:"detail,omitempty"`
}

// State collects listener status and the ARSY probe.
type State struct {
	mu         sync.Mutex
	components map[string]Component
	upstream   func(context.Context) error
	startedAt  time.Time
}

// NewState builds the readiness state. upstream may be nil only in tests; a nil
// probe is reported as not ready rather than assumed healthy.
func NewState(upstream func(context.Context) error) *State {
	return &State{
		components: map[string]Component{},
		upstream:   upstream,
		startedAt:  time.Now(),
	}
}

// Set records the status of one listener.
func (s *State) Set(name string, ready bool, detail string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.components[name] = Component{Ready: ready, Detail: detail}
}

// Snapshot copies the current component view.
func (s *State) Snapshot() map[string]Component {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make(map[string]Component, len(s.components))
	for name, component := range s.components {
		out[name] = component
	}
	return out
}

// Check answers whether the process is ready and why not.
func (s *State) Check(ctx context.Context) (bool, map[string]Component) {
	components := s.Snapshot()
	allReady := len(components) > 0
	for _, component := range components {
		if !component.Ready {
			allReady = false
		}
	}
	if s.upstream == nil {
		components["arsy"] = Component{Ready: false, Detail: "no upstream probe configured"}
		return false, components
	}
	err := s.upstream(ctx)
	if err != nil {
		components["arsy"] = Component{Ready: false, Detail: err.Error()}
		return false, components
	}
	components["arsy"] = Component{Ready: true, Detail: "reachable"}
	return allReady, components
}

// Handler exposes the two probes.
func (s *State) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{
			"status":     "ok",
			"started_at": s.startedAt.UTC().Format(time.RFC3339),
		})
	})
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()
		ready, components := s.Check(ctx)
		names := make([]string, 0, len(components))
		for name := range components {
			names = append(names, name)
		}
		sort.Strings(names)
		status := http.StatusServiceUnavailable
		outcome := "not-ready"
		if ready {
			status = http.StatusOK
			outcome = "ready"
		}
		writeJSON(w, status, map[string]any{
			"status":     outcome,
			"components": components,
			"order":      names,
			"timestamp":  time.Now().UTC().Format(time.RFC3339),
		})
	})
	return mux
}

// Serve starts the health HTTP server and reports its own readiness. It returns
// when ctx is cancelled or the listener fails.
func (s *State) Serve(ctx context.Context, addr string) error {
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		s.Set("health", false, err.Error())
		return fmt.Errorf("health: bind %s: %w", addr, err)
	}
	s.Set("health", true, listener.Addr().String())
	server := &http.Server{Handler: s.Handler(), ReadHeaderTimeout: 5 * time.Second}
	errs := make(chan error, 1)
	go func() { errs <- server.Serve(listener) }()
	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		// The listener is gone the moment shutdown starts; readiness must say so.
		s.Set("health", false, "shutting down")
		_ = server.Shutdown(shutdownCtx)
		return errors.Join(ctx.Err(), server.Close())
	case err := <-errs:
		s.Set("health", false, err.Error())
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	}
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("content-type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
