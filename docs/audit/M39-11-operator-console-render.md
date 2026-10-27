# M39-11 — operator console render evidence (structural)

Taken live on `http://127.0.0.1:3106/` (vite client proxying `/api` + `/health` to the running ECHOLOG service on `127.0.0.1:3006`) via the Qoder in-app browser accessibility snapshot; services were started only for this check and stopped immediately after (no listeners left; see below).

Key assertions visible in the page tree (baseline `d54ad43` tree with the M39-11 client changes):

- Title/banner: "ECHOLOG // Storage Console", subtitle states it is a loopback dev console over the documented REST API.
- Session field is opt-in: "No session armed — reads and writes are not attempted." Upload button disabled with "An ARSY session token is required before uploading."
- Service panel: "reachable on this origin", "storage ready", TRACKED OBJECTS 0.
- Scan honesty: "SCAN COVERAGE — not scanned" and "ECHOLOG v1 records scan: skipped for every object; the console says so in words." No `ok`-tone badge.
- Tracked-objects contract: "Consumer references only: {object_key, digest, size, content_type}. Enumeration stays with the service." Stopping tracking "removes the local reference only; it never deletes the stored object."
- Upload: MIME select is exactly the shipped allow-list, note "The server enforces its allow-list and answers 415 for anything else"; retention deadline input; "Apply legal hold at ingest (requires confirmation)" checkbox; "A partially written upload is never an object until ECHOLOG verifies it."
- GC panel: "Administrator action; held objects are reported, never deleted." RUN GC disabled without admin session.

Pixel screenshot could not be captured: the in-app browser reported `NATIVE_BROWSER_VIEWPORT_UNAVAILABLE` (hidden 0x0 viewport) — same environment block already documented for the UI-screens track (docs/audit/ui-screens-evidence-38560d3.md, "pixel screenshots environment-blocked"). The accessibility snapshot above is the render evidence; `pnpm ui:check` reports 0 violations / 111 files including `apps/echolog/client/App.tsx`.

Cleanup: server and vite processes were killed after the snapshot; verified ports 3006/3106 no longer listen.
