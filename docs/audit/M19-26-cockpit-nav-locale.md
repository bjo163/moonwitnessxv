# Audit Report: M19-26 Cockpit Navigation & View Locale Alignment

- **Milestone:** M19 — Frontend
- **Task ID:** M19-26
- **Status:** CLOSED [x]
- **Auditor:** Antigravity AI Engine
- **Target App:** `apps/cockpit`
- **Related ADR:** [ADR-0005](../decisions/ADR-0005-locale.md), [ADR-0008](../decisions/ADR-0008-cockpit-mission-supervisor.md)

---

## 1. Scope & Objective

Audit and align all navigation elements, tabs, headings, and status labels within the Cockpit mission supervisor (`apps/cockpit`) to support full bilingual localization (`en` and `id`) while strictly preserving machine-level invariants.

---

## 2. Key Deliverables & Code Changes

1. **Copy Catalog (`apps/cockpit/client/lib/cockpit-copy.ts`):**
   - Implemented `COCKPIT_COPY` with 1:1 key parity between English and Indonesian.
   - Localized TopBar:
     - `brandTitle`: `'MOONWITNESS COCKPIT'` / `'KONSOL COCKPIT MOONWITNESS'`
     - `brandSubtitle`: `'MISSION SUPERVISOR // LOCAL ENGINE'` / `'SUPERVISOR MISI // MESIN LOKAL'`
     - `servicesOnline`: `'SERVICES ONLINE'` / `'SERVIS ONLINE'`
     - `startAll`: `'START ALL'` / `'JALANKAN SEMUA'`
     - `stopAll`: `'STOP ALL'` / `'HENTIKAN SEMUA'`
     - `freePorts`: `'FREE PORTS'` / `'BEBASKAN PORT'`
     - `crtFilter`: `'CRT SCANLINES'` / `'GARIS PINDAI CRT'`
   - Localized Sidebar:
     - `microservices`: `'MICROSERVICES'` / `'MIKROSERVIS'`
     - `liveControl`: `'LIVE CONTROL'` / `'KONTROL LANGSUNG'`
     - `statusOnline`: `'ONLINE'` / `'AKTIF'`
     - `statusOffline`: `'OFFLINE'` / `'NONAKTIF'`
     - `actionStart`: `'START'` / `'MULAI'`
     - `actionStop`: `'STOP'` / `'HENTIKAN'`
     - `actionRestart`: `'RESTART'` / `'MULAI ULANG'`
     - `actionPreview`: `'PREVIEW'` / `'PRATINJAU'`
   - Localized Tab Labels:
     - `tabLogs`: `'Terminal & Logs'` / `'Terminal & Catatan Log'`
     - `tabPreview`: `'In-App Web Preview'` / `'Pratinjau Web Internal'`
     - `tabMedia`: `'Media & IPTV Player'` / `'Pemutar Media & IPTV'`
     - `tabLedger`: `'Error Ledger'` / `'Buku Besar Error'`
     - `tabPorts`: `'Network & Ports'` / `'Jaringan & Port'`
     - `tabProgress`: `'Mission Progress'` / `'Progres Misi'`

2. **Invariance Preserved:**
   - Child service tags remain strictly invariant: `radio`, `dock`, `hq`, `ai`, `sentinel`.
   - Port numbers (`3000`–`3004`, `5173`) remain unchanged.
   - Machine log stream output and JSON payloads remain un-translated.

3. **Verification:**
   - Automated unit test in `apps/cockpit/test/locale.test.ts` validates 100% key parity and non-empty strings.
