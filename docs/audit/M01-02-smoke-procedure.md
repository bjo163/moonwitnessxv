# M01-02 — Radio, Dock & Headquarters Smoke Test Procedure

- **Audit Date**: 2026-10-26
- **Context**: 3 Apps + 1 Contract Architecture

---

## 1. Application Port Allocation

| Application | Workspace Target | Default Port | Role & Readiness Probe |
|---|---|---|---|
| **Radio Hub** (ARSY) | `apps/radio` | `3000` | Fastify REST/ORM API Hub (`GET http://127.0.0.1:3000/api/v1/health`) |
| **Dock** | `apps/dock` | `3001` | Public Audio & Zine UI (`GET http://127.0.0.1:3001`) |
| **Headquarters** | `apps/headquarters` | `3002` | Admin Command Center (`GET http://127.0.0.1:3002/login`) |

---

## 2. Port Pre-flight Check (Escape Hatch)
Sebelum menjalankan smoke test lokal, pastikan port 3000, 3001, dan 3002 bebas:
```powershell
pnpm ports:free
```

---

## 3. Local Smoke Test Execution

### Opsi A: Development Monorepo (`pnpm dev`)
1. Jalankan development runner:
   ```powershell
   pnpm dev
   ```
2. Verifikasi 3 probe melalui curl / HTTP request:
   ```powershell
   # 1. Probe Hub Radio
   curl.exe -s http://127.0.0.1:3000/api/v1/health
   # Expected response: {"status":"ok", ...}

   # 2. Probe Dock Homepage
   curl.exe -I -s http://127.0.0.1:3001
   # Expected HTTP status: 200 OK

   # 3. Probe Headquarters Login
   curl.exe -I -s http://127.0.0.1:3002/login
   # Expected HTTP status: 200 OK
   ```

### Opsi B: Full Production Docker Stack (`pnpm docker:up`)
```powershell
docker compose up -d --build
docker compose ps
```
- Semua kontainer (`db`, `backup`, `radio`, `dock`, `headquarters`) harus berstatus `healthy` atau `Up`.

---

## 4. Zero Secrets Leakage Rule
- Dilarang menyalin `.env` produksi ke dalam branch publik Git.
- Smoke test lokal wajib menggunakan fallback environment aman dari [`.env.example`](../../.env.example).
