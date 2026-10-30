package secrets

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestNewStoreRefusesAMountThatIsNotAReadableDirectory(t *testing.T) {
	dir := t.TempDir()
	regularFile := filepath.Join(dir, "not-a-directory")
	if err := os.WriteFile(regularFile, []byte("synthetic-nas-secret\n"), 0o600); err != nil {
		t.Fatalf("seed fixture: %v", err)
	}

	cases := []struct {
		name string
		dir  string
	}{
		{"an empty directory", ""},
		{"whitespace instead of a directory", "   "},
		{"a mount that is not present", filepath.Join(dir, "absent")},
		{"a path that is a file, not a directory", regularFile},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			store, err := NewStore(tc.dir, 8, time.Minute)
			if err == nil {
				t.Fatalf("NewStore(%q) = %p, want a startup failure: a missing secret mount must not surprise the runtime later", tc.dir, store)
			}
			if store != nil {
				t.Fatalf("NewStore(%q) returned a store built on %q, want nothing", tc.dir, tc.dir)
			}
		})
	}
}

func TestDirReportsTheAbsolutePathOfTheMountedDirectory(t *testing.T) {
	root := t.TempDir()
	mount := filepath.Join(root, "mount")
	if err := os.Mkdir(mount, 0o700); err != nil {
		t.Fatalf("create mount fixture: %v", err)
	}
	t.Chdir(root)

	store, err := NewStore("mount", 8, time.Minute)
	if err != nil {
		t.Fatalf("NewStore on a relative mount: %v", err)
	}
	want := filepath.Join(root, "mount")
	if store.Dir() != want {
		t.Fatalf("Dir() = %q, want the resolved absolute mount %q", store.Dir(), want)
	}
}

func TestSecretReferenceOutsideTheMountedDirectoryIsRejected(t *testing.T) {
	root := t.TempDir()
	mount := filepath.Join(root, "mount")
	outside := filepath.Join(root, "outside")
	for _, d := range []string{mount, outside} {
		if err := os.Mkdir(d, 0o700); err != nil {
			t.Fatalf("create fixture directory %s: %v", d, err)
		}
	}
	// The escape targets are real files so a rejection can only come from the
	// reference check, not from a missing path.
	for _, path := range []string{filepath.Join(outside, "victim.secret"), filepath.Join(mount, "nas-a.secret")} {
		if err := os.WriteFile(path, []byte("synthetic-nas-secret\n"), 0o600); err != nil {
			t.Fatalf("seed fixture %s: %v", path, err)
		}
	}

	store, err := NewStore(mount, 8, time.Minute)
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}

	cases := []struct {
		name string
		ref  string
	}{
		{"an empty reference", ""},
		{"whitespace as a reference", "   "},
		{"an absolute path", filepath.Join(outside, "victim.secret")},
		{"a drive-letter path", `C:\run\secrets\victim.secret`},
		{"a backslash path", `nas-a\synthetic.secret`},
		{"a parent traversal", "../outside/victim.secret"},
		{"a nested parent traversal", "sub/../../outside/victim.secret"},
		{"a drive letter reaching a mounted name", "C:./nas-a.secret"},
		{"a colon-delimited reference", "nas-a:secret"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			secret, err := store.Get(tc.ref)
			if err == nil {
				t.Fatalf("Get(%q) = %q, want a refusal to read outside the mounted directory", tc.ref, secret)
			}
			if !errors.Is(err, ErrRefRejected) {
				t.Fatalf("Get(%q) error = %v, want it to report %v", tc.ref, err, ErrRefRejected)
			}
			if len(secret) != 0 {
				t.Fatalf("Get(%q) = %q and an error, want no bytes returned alongside a rejection", tc.ref, secret)
			}
		})
	}
}

func TestSymlinkInsideTheMountCannotReachAFileOutsideIt(t *testing.T) {
	root := t.TempDir()
	mount := filepath.Join(root, "mount")
	outside := filepath.Join(root, "outside")
	for _, d := range []string{mount, outside} {
		if err := os.Mkdir(d, 0o700); err != nil {
			t.Fatalf("create fixture directory %s: %v", d, err)
		}
	}
	victim := filepath.Join(outside, "victim.secret")
	if err := os.WriteFile(victim, []byte("synthetic-outside-secret\n"), 0o600); err != nil {
		t.Fatalf("seed escape target: %v", err)
	}

	link := filepath.Join(mount, "nas-a.secret")
	if err := os.Symlink(victim, link); err != nil {
		t.Skipf("this environment cannot create symlinks (%v); the mount cannot be asked to hold one, so the escape is not observable here", err)
	}

	store, err := NewStore(mount, 8, time.Minute)
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}
	secret, err := store.Get("nas-a.secret")
	if err == nil {
		t.Fatalf("Get followed a symlink out of the mount and returned %q, want a refusal", secret)
	}
	if !errors.Is(err, ErrRefRejected) {
		t.Fatalf("Get error = %v, want it to report %v", err, ErrRefRejected)
	}
}

func TestMountedSecretIsTrimmedAndSizeChecked(t *testing.T) {
	dir := t.TempDir()
	store, err := NewStore(dir, 8, time.Minute)
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}
	seed := func(name, content string) {
		t.Helper()
		if err := os.WriteFile(filepath.Join(dir, name), []byte(content), 0o600); err != nil {
			t.Fatalf("seed %s: %v", name, err)
		}
	}

	cases := []struct {
		name      string
		file      string
		content   string
		want      string
		wantError string
	}{
		{name: "a bare secret", file: "bare.secret", content: "synthetic-nas-secret", want: "synthetic-nas-secret"},
		{name: "a line-feed terminator is trimmed", file: "lf.secret", content: "synthetic-nas-secret\n", want: "synthetic-nas-secret"},
		{name: "a carriage-return line-feed terminator is trimmed", file: "crlf.secret", content: "synthetic-nas-secret\r\n", want: "synthetic-nas-secret"},
		{name: "a folded terminator is trimmed to the secret", file: "fold.secret", content: "synthetic-nas-secret\r\n\r\n", want: "synthetic-nas-secret"},
		{name: "the longest accepted secret", file: "max.secret", content: strings.Repeat("a", 128), want: strings.Repeat("a", 128)},
		{name: "an empty file", file: "empty.secret", content: "", wantError: "is empty"},
		{name: "a file holding only a newline", file: "blank.secret", content: "\n", wantError: "is empty"},
		{name: "a secret over the octet limit", file: "over.secret", content: strings.Repeat("a", 129), wantError: "128"},
		{name: "a secret whose terminator hid an overlong value", file: "over-trailing.secret", content: strings.Repeat("a", 129) + "\n", wantError: "128"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			seed(tc.file, tc.content)
			secret, err := store.Get(tc.file)
			if tc.wantError != "" {
				if err == nil {
					t.Fatalf("Get(%q) = %q, want a refusal mentioning %q", tc.file, secret, tc.wantError)
				}
				if !strings.Contains(err.Error(), tc.wantError) {
					t.Fatalf("Get(%q) error = %v, want it to mention %q", tc.file, err, tc.wantError)
				}
				return
			}
			if err != nil {
				t.Fatalf("Get(%q): %v, want the mounted secret", tc.file, err)
			}
			if string(secret) != tc.want {
				t.Fatalf("Get(%q) = %q, want %q", tc.file, secret, tc.want)
			}
		})
	}

	if _, err := store.Get("never-mounted.secret"); err == nil {
		t.Fatalf("Get reported a secret for a reference with no mounted file, want a read failure")
	}
}

func TestCachedSecretSurvivesAFileRotationUntilTheTTLExpires(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "nas-a.secret"), []byte("original-secret\n"), 0o600); err != nil {
		t.Fatalf("seed fixture: %v", err)
	}
	store, err := NewStore(dir, 8, time.Minute)
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}
	clock := time.Unix(1700000000, 0)
	store.now = func() time.Time { return clock }

	first, err := store.Get("nas-a.secret")
	if err != nil {
		t.Fatalf("Get: %v", err)
	}
	if string(first) != "original-secret" {
		t.Fatalf("Get = %q, want the secret on disk", first)
	}

	// A rotation on disk must stay invisible until the view ages out, otherwise a
	// busy NAS turns every packet into a filesystem read.
	if err := os.WriteFile(filepath.Join(dir, "nas-a.secret"), []byte("rotated-secret\n"), 0o600); err != nil {
		t.Fatalf("rotate fixture: %v", err)
	}
	clock = clock.Add(time.Minute - time.Second)
	second, err := store.Get("nas-a.secret")
	if err != nil {
		t.Fatalf("cached Get: %v", err)
	}
	if string(second) != "original-secret" {
		t.Fatalf("Get inside the TTL = %q, want the cached original rather than a re-read", second)
	}

	clock = clock.Add(2 * time.Second)
	third, err := store.Get("nas-a.secret")
	if err != nil {
		t.Fatalf("Get after the TTL: %v", err)
	}
	if string(third) != "rotated-secret" {
		t.Fatalf("Get after the TTL = %q, want the rotated secret without a process restart", third)
	}
}

func TestTheSecretCacheIsABoundNotAHint(t *testing.T) {
	dir := t.TempDir()
	for _, name := range []string{"nas-a.secret", "nas-b.secret", "nas-c.secret"} {
		if err := os.WriteFile(filepath.Join(dir, name), []byte("original-secret\n"), 0o600); err != nil {
			t.Fatalf("seed %s: %v", name, err)
		}
	}
	store, err := NewStore(dir, 2, time.Hour)
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}
	clock := time.Unix(1700000000, 0)
	store.now = func() time.Time { return clock }

	for _, name := range []string{"nas-a.secret", "nas-b.secret"} {
		if _, err := store.Get(name); err != nil {
			t.Fatalf("Get(%s): %v", name, err)
		}
	}
	if got := len(store.entries); got != 2 {
		t.Fatalf("cache holds %d entries after two references, want 2", got)
	}

	// The third reference reaches the ceiling, so the whole view is dropped.
	if err := os.WriteFile(filepath.Join(dir, "nas-a.secret"), []byte("rotated-secret\n"), 0o600); err != nil {
		t.Fatalf("rotate fixture: %v", err)
	}
	if _, err := store.Get("nas-c.secret"); err != nil {
		t.Fatalf("Get(nas-c.secret): %v", err)
	}
	if got := len(store.entries); got > 2 {
		t.Fatalf("cache holds %d entries with a bound of 2, want the bound to hold", got)
	}

	// Inside its TTL the evicted reference is re-read from disk, which proves the
	// entry really left the cache.
	reloaded, err := store.Get("nas-a.secret")
	if err != nil {
		t.Fatalf("Get(nas-a.secret) after eviction: %v", err)
	}
	if string(reloaded) != "rotated-secret" {
		t.Fatalf("Get after eviction = %q, want the disk value: an evicted reference must not serve stale bytes", reloaded)
	}
}
