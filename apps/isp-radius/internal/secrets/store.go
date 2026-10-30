// Package secrets reads RADIUS shared secrets from mounted files only.
//
// ARSY stores the location of a secret (isp_nas.secretRef); the value never
// travels through the API, a log line, or this process's environment.
package secrets

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// ErrRefRejected reports a secret reference that is not a plain relative path
// inside the mounted directory.
var ErrRefRejected = errors.New("secrets: secret reference is outside the mounted directory")

type entry struct {
	secret   []byte
	loadedAt time.Time
}

// Store caches mounted secret files behind a bounded, time-limited view so a
// busy NAS does not turn every packet into a filesystem read, and a rotated
// file is picked up without a restart.
type Store struct {
	dir     string
	max     int
	ttl     time.Duration
	now     func() time.Time
	mu      sync.Mutex
	entries map[string]entry
}

// NewStore opens the given directory. The directory must exist and be readable;
// a missing mount is a startup failure rather than a runtime surprise.
func NewStore(dir string, max int, ttl time.Duration) (*Store, error) {
	if strings.TrimSpace(dir) == "" {
		return nil, errors.New("secrets: directory is required")
	}
	abs, err := filepath.Abs(dir)
	if err != nil {
		return nil, fmt.Errorf("secrets: resolve %q: %w", dir, err)
	}
	info, err := os.Stat(abs)
	if err != nil {
		return nil, fmt.Errorf("secrets: open mounted directory %q: %w", abs, err)
	}
	if !info.IsDir() {
		return nil, fmt.Errorf("secrets: %q is not a directory", abs)
	}
	if max < 1 {
		max = 1
	}
	if ttl <= 0 {
		ttl = time.Minute
	}
	return &Store{dir: abs, max: max, ttl: ttl, now: time.Now, entries: map[string]entry{}}, nil
}

// Dir reports the mounted directory the store reads from. It is safe to log.
func (s *Store) Dir() string { return s.dir }

// Get returns the secret bytes for one reference. The reference comes from
// ARSY, so it is treated as untrusted input: it must resolve to a file that
// stays inside the mounted directory.
func (s *Store) Get(ref string) ([]byte, error) {
	if strings.TrimSpace(ref) == "" {
		return nil, fmt.Errorf("%w: empty reference", ErrRefRejected)
	}
	clean, err := s.pathFor(ref)
	if err != nil {
		return nil, err
	}

	s.mu.Lock()
	cached, ok := s.entries[ref]
	s.mu.Unlock()
	if ok && s.now().Sub(cached.loadedAt) < s.ttl {
		return cached.secret, nil
	}

	raw, err := os.ReadFile(clean) //nolint:gosec // path is confined by pathFor
	if err != nil {
		return nil, fmt.Errorf("secrets: read %q: %w", ref, err)
	}
	secret := trimTrailingNewline(raw)
	if len(secret) == 0 {
		return nil, fmt.Errorf("secrets: %q is empty", ref)
	}
	if len(secret) > 128 {
		return nil, fmt.Errorf("secrets: %q exceeds the 128 octet shared secret limit", ref)
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if len(s.entries) >= s.max {
		// Bounded state: drop the whole view rather than grow without limit. The
		// next read repopulates the few entries that are actually in use.
		clear(s.entries)
	}
	s.entries[ref] = entry{secret: secret, loadedAt: s.now()}
	return secret, nil
}

func (s *Store) pathFor(ref string) (string, error) {
	if filepath.IsAbs(ref) || strings.ContainsAny(ref, ":\\") {
		return "", fmt.Errorf("%w: %q", ErrRefRejected, ref)
	}
	joined := filepath.Join(s.dir, filepath.FromSlash(ref))
	resolved, err := filepath.EvalSymlinks(joined)
	if err != nil {
		return "", fmt.Errorf("secrets: resolve %q: %w", ref, err)
	}
	inside, err := filepath.Rel(s.dir, resolved)
	if err != nil || inside == ".." || strings.HasPrefix(inside, ".."+string(filepath.Separator)) {
		return "", fmt.Errorf("%w: %q", ErrRefRejected, ref)
	}
	return resolved, nil
}

func trimTrailingNewline(raw []byte) []byte {
	return []byte(strings.TrimRight(string(raw), "\r\n"))
}
