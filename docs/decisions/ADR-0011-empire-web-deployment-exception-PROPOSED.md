# ADR-0011 (PROPOSED) — Separate Empire Gateway frontend

Date: 2026-10-29 (WIB) · Status: PROPOSED / NOT RATIFIED
Repository: moonwitnessxv, branch feature/empire-web-vercel

## Background
ADR-0004 and BLUEPRINT §2A initially place LIGHTHOUSE within Dock. The latest owner request explicitly asks for a **new app and branch** with independent Vercel deployment. This proposal documents that potential change rather than silently overriding accepted architecture.

## Proposed bounded decision
Create apps/empire-web as an isolated static Next.js landing pilot, hosted in a separate Vercel project. It uses MoonUI, reads no private data, owns no SQL, API, identity, task state, research, authoring, or release authority. Dock, ARSY, HQ, SKYLINK and ECHOLOG remain governed by existing ADRs.

## Non-goals
- No automatic DNS change or claim that a-l-l-a-h.com is controlled or production-ready.
- No new login, domain tables, CRUD API, independent publisher, payment flow or provider token.
- No application named Lighthouse deployed in parallel without reviewing canonical domain ownership.
- No regressions or deployment of Dock, ARSY, HQ or internal tooling to Vercel.

## Acceptance
Verify app and specific Git SHA; review bilingual routes and WCAG; approve text/rights; validate preview noindex; authorize final domain and canonical URL policy; review any production authentication/integration changes. Decide retain-separate vs fold-into-Dock after preview. TODO.md remains the only canonical task/status register.
