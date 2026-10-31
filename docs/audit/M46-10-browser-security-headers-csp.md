# M46-10 — Browser Security Headers and CSP Audit

**Date:** 2026-10-31  
**Auditor:** AI agent (owner-authorized)  
**Scope:** Inventory all browser security headers across every HTTP surface; identify gaps and inconsistencies; design report-only CSP for bounded route sets  
**Status:** **GAPS FOUND** — Empire has no CSP; ARSY CSP diverges from core; Orbit missing CSP from middleware  
**Related:** [M27-14](../tasks/M27/M27-14.md) (HTTPS domain verification), [M44-08](../tasks/M44/M44-08.md) (host verification matrix), [M03-07](M03-07-threat-model.md) (threat model), [M44](M44-domain-cutover.md) (domain cutover)

---

## Executive Summary

The monorepo has a well-designed centralized security header system in `@moonwitness/core` that is consumed by Dock, Headquarters, ISP Console and (via `@moonwitness/web-config`) both Next.js configs. However, three surfaces fall outside this umbrella:

1. **Empire (static export)** — has NO Content-Security-Policy in either nginx or Vercel configuration
2. **ARSY (Fastify hub)** — has its own CSP via `@fastify/helmet` that diverges from core's rules (missing `media-src`, `font-src`, `ws:`/`wss:` in `connect-src`)
3. **Orbit (spatial frontend)** — uses `NON_FRAMING_HEADERS` in `next.config.mjs` (which deliberately excludes CSP and X-Frame-Options) and its middleware sets no CSP either

**Key finding:** Empire is the public-facing, indexable site (ADR-0016, `a-l-l-a-h.com`) and it ships with zero CSP protection. This is the highest-priority gap.

---

## 1. Complete Security Header Inventory

### 1.1 Surface Map

| Surface | Runtime | Domain | Header Source | CSP | HSTS | X-Content-Type | Referrer-Policy | X-Frame-Options | Permissions-Policy |
|---------|---------|--------|---------------|-----|------|----------------|-----------------|-----------------|-------------------|
| **Dock** | Next.js SSR | `moonwitness.biz.id` | `middleware.ts` → `securityHeaders()` | YES | YES | YES | YES | Conditional | YES |
| **Headquarters** | Next.js SSR | `hq.moonwitness.biz.id` | `next.config.mjs` → `securityHeaders()` | YES | YES | YES | YES | YES (DENY) | YES |
| **ISP Console** | Next.js SSR | loopback :3008 | `next.config.mjs` → `securityHeaders()` | YES | YES | YES | YES | YES (DENY) | YES |
| **Orbit** | Next.js SSR | loopback :3007 | `next.config.mjs` → `NON_FRAMING_HEADERS` | **NO** | YES | YES | YES | **NO** | YES |
| **Empire (nginx)** | Static export | `a-l-l-a-h.com` | `nginx.conf` | **NO** | YES | YES | YES | YES (DENY) | **NO** |
| **Empire (Vercel)** | Static export | preview | `vercel.json` | **NO** | **NO** | YES | YES | YES (DENY) | YES |
| **ARSY** | Fastify | `api.moonwitness.biz.id` | `helmet.ts` → `@fastify/helmet` | YES (divergent) | **NO** | via helmet | via helmet | Conditional | via helmet |

### 1.2 Detailed Header Values per Surface

#### Core (`packages/core/src/headers.ts`) — canonical source

```typescript
// Production CSP (dev=false):
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' ws: wss:;
media-src 'self' https:;
frame-ancestors ${list};   // 'none' by default
base-uri 'self';
form-action 'self'

// Accompanying headers:
strict-transport-security: max-age=15552000
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
x-frame-options: DENY  // only when frame-ancestors is 'none'
permissions-policy: camera=(), microphone=(), geolocation=()
```

**Dev mode additions:** `unsafe-eval` in `script-src`; `COCKPIT_DEV_ORIGINS` added to `frame-ancestors`.

#### Dock (`apps/dock/src/middleware.ts`)

```typescript
// middleware.ts line 106-115
function withSecurity(response: NextResponse, routePath: string): NextResponse {
  const allowList = embedOrigins(process.env)
  const framing = EMBED_PATH.test(routePath) && allowList.length > 0
    ? allowList
    : ["'none'"]
  for (const header of securityHeaders(framing, {
    dev: process.env.NODE_ENV !== 'production'
  })) {
    response.headers.set(header.key, header.value)
  }
  return response
}
```

- CSP: from `securityHeaders()` — full core policy
- Framing: per-path decision — `/embed/*` can be framed if `EMBED_ORIGINS` is set; everything else gets `frame-ancestors 'none'`
- X-Frame-Options: `DENY` when framing is `'none'`, omitted when allow-list is active (to avoid contradicting CSP)
- Matcher excludes `_next/*`, `favicon.ico`, `icon.svg`, `manifest.webmanifest`

#### Headquarters (`apps/headquarters/next.config.mjs`)

```javascript
async headers() {
  return [{
    source: '/:path*',
    headers: securityHeaders(["'none'"], {
      dev: process.env.NODE_ENV !== 'production'
    })
  }]
}
```

- CSP: full core policy, always `frame-ancestors 'none'`
- No middleware-level framing decision (HQ is never embeddable)

#### ISP Console (`apps/isp-console/next.config.mjs`)

```javascript
async headers() {
  return [{
    source: '/:path*',
    headers: securityHeaders(["'none'"], {
      dev: process.env.NODE_ENV !== 'production'
    })
  }]
}
```

- Identical to Headquarters — full core policy, always locked down

#### Orbit (`apps/orbit/next.config.mjs`)

```javascript
import { NON_FRAMING_HEADERS } from '@moonwitness/web-config'

async headers() {
  return [{ source: '/:path*', headers: NON_FRAMING_HEADERS }]
}
```

- `NON_FRAMING_HEADERS` = `securityHeaders()` minus `content-security-policy` and `x-frame-options`
- Orbit middleware (`apps/orbit/src/middleware.ts`) only handles locale forwarding — no CSP added
- **Result: Orbit has NO CSP and NO X-Frame-Options**

#### Empire nginx (`apps/empire-web/nginx.conf`)

```nginx
add_header Strict-Transport-Security "max-age=15552000" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

- **NO Content-Security-Policy**
- **NO Permissions-Policy**
- Present: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy

#### Empire Vercel (`apps/empire-web/vercel.json`)

```json
{
  "source": "/(.*)",
  "headers": [
    { "key": "X-Robots-Tag", "value": "noindex, nofollow" },
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
  ]
}
```

- **NO Content-Security-Policy**
- **NO Strict-Transport-Security** (Vercel provides this at the edge, but it is not in the config)
- Present: X-Robots-Tag, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy

#### ARSY (`apps/arsy/src/plugins/helmet.ts`)

```typescript
await fastify.register(helmet, {
  xFrameOptions: isDev ? false : { action: 'sameorigin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameAncestors,
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
})
```

- CSP present but **divergent** from core:
  - Missing: `font-src`, `media-src`
  - `connectSrc` lacks `ws:` and `wss:` (needed for WebSocket connections)
- X-Frame-Options: `sameorigin` in dev, disabled in prod (relies on CSP `frame-ancestors`)
- **NO HSTS** (expected — HSTS is the edge/proxy's job for the API)
- **NO Permissions-Policy**

---

## 2. Gap Analysis

### 2.1 Critical Gaps

| # | Gap | Surface | Risk | Severity |
|---|-----|---------|------|----------|
| G1 | **No CSP** | Empire (nginx) | XSS, data injection, clickjacking via script on public indexed site | **HIGH** |
| G2 | **No CSP** | Empire (Vercel) | Same as G1 on preview deployments | **HIGH** |
| G3 | **No CSP** | Orbit | Three.js scene can load external scripts; no framing protection | **MEDIUM** |
| G4 | **No Permissions-Policy** | Empire (nginx) | Camera/microphone/geolocation not restricted | **LOW** |
| G5 | **No HSTS** | Empire (Vercel) | Vercel edge provides this, but config does not pin it | **LOW** |

### 2.2 Inconsistencies

| # | Inconsistency | Surfaces | Detail |
|---|---------------|----------|--------|
| I1 | **CSP divergence** | Core vs ARSY | ARSY missing `font-src`, `media-src`, `ws:`/`wss:` in `connect-src` |
| I2 | **X-Frame-Options strategy** | Dock vs ARSY vs HQ | Dock: conditional (DENY only when no allow-list); ARSY: `sameorigin` in dev, omitted in prod; HQ: always DENY |
| I3 | **HSTS presence** | ARSY vs others | ARSY does not set HSTS (correct — edge handles it); Empire Vercel does not set it in config (edge handles it) |
| I4 | **Permissions-Policy** | Empire nginx vs others | Empire nginx does not set Permissions-Policy; all other surfaces do |

### 2.3 Rationale for Existing Divergence

Some divergence is **intentional and correct**:

- **Dock's per-path framing**: `/embed/*` must be frameable by `EMBED_ORIGINS`; everything else must not. This is a deliberate design decision documented in `middleware.ts`.
- **`NON_FRAMING_HEADERS` for Orbit/Dock configs**: The Next.js `headers()` config cannot make per-path decisions. Dock uses middleware for CSP+framing; Orbit uses `NON_FRAMING_HEADERS` because it was never given a middleware-level CSP writer.
- **ARSY's `sameorigin` in dev**: Swagger UI and Studio need inline script/style and framing during development.

---

## 3. CSP Directive Analysis

### 3.1 Current Core CSP — Directive by Directive

| Directive | Value | Rationale | Risk if Enforced |
|-----------|-------|-----------|-----------------|
| `default-src` | `'self'` | Fallback for unspecified directives | Low — conservative default |
| `script-src` | `'self' 'unsafe-inline'` | Next.js hydration requires inline scripts; no nonce plumbing yet | `'unsafe-inline'` weakens XSS protection but is currently unavoidable |
| `style-src` | `'self' 'unsafe-inline'` | Tailwind/React inline styles | Low — styles cannot exfiltrate data |
| `img-src` | `'self' data: https:` | Cover art from station URLs, data URIs for icons | Low — images are passive content |
| `font-src` | `'self' data:` | Local fonts, possibly data: URI embedded | Low |
| `connect-src` | `'self' ws: wss:` | API calls to same origin; WebSocket for HMR in dev, live updates | `ws:`/`wss:` without host restriction is broad but needed for dev |
| `media-src` | `'self' https:` | Audio streams from HTTPS station URLs | Critical — removing this breaks the radio player |
| `frame-ancestors` | `'none'` or allow-list | Clickjacking protection | Low — correct default |
| `base-uri` | `'self'` | Prevents `<base>` tag injection | Low |
| `form-action` | `'self'` | Prevents form hijacking to external targets | Low — no external form targets exist |

### 3.2 `'unsafe-inline'` Assessment

Both `script-src` and `style-src` carry `'unsafe-inline'`. This is the single largest CSP weakness across all surfaces.

**Why it exists:**
- Next.js injects inline `<script>` for hydration bootstrap (`__NEXT_DATA__`, chunk loading)
- Tailwind CSS and styled-components may inject inline `<style>`
- Adding per-request nonces requires middleware-level response rewriting that Next.js does not natively support in the App Router

**Mitigation path (future):**
- Next.js 15+ supports `nonce` in `next.config.mjs` via experimental CSP nonce support
- Migration would require threading a nonce from middleware through every `<script>` and `<style>` tag
- Until then, `'unsafe-inline'` is documented and accepted

---

## 4. Report-Only CSP Design

### 4.1 Strategy

Deploy CSP in `Content-Security-Policy-Report-Only` mode first. This lets browsers report violations without blocking anything, so we can tune the policy before enforcement.

### 4.2 Proposed CSP for Empire (nginx)

```
Content-Security-Policy-Report-Only:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self';
  media-src 'self' https:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  report-uri /api/csp-report;
  report-to csp-endpoint
```

**Rationale for directive choices:**
- Empire is a static export — no WebSocket needed, so `connect-src` is `'self'` only (no `ws:`/`wss:`)
- Empire has no audio player — `media-src` is present for forward compatibility but unlikely to fire
- `frame-ancestors 'none'` matches the existing `X-Frame-Options: DENY`
- No `'unsafe-eval'` — Empire is always a production build

### 4.3 Proposed CSP for Empire (Vercel)

Identical to nginx, but delivered via `vercel.json` headers configuration:

```json
{
  "source": "/(.*)",
  "headers": [
    {
      "key": "Content-Security-Policy-Report-Only",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; media-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint"
    }
  ]
}
```

**Note:** Vercel Edge Functions can serve as the `report-uri` endpoint for the Vercel preview deployment.

### 4.4 Proposed CSP for Orbit

```
Content-Security-Policy-Report-Only:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' ws: wss:;
  media-src 'self' https:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  report-uri /api/csp-report
```

**Note:** Orbit needs `'unsafe-eval'` because Three.js/WebGL shader compilation may use `eval` in development. In production builds this should be removable.

### 4.5 Report-To Endpoint Design

```json
{
  "group": "csp-endpoint",
  "max_age": 86400,
  "endpoints": [
    { "url": "https://api.moonwitness.biz.id/api/v1/csp-reports" }
  ]
}
```

The ARSY hub should expose a `POST /api/v1/csp-reports` endpoint that:
1. Accepts `application/csp-report` JSON
2. Rate-limits per source IP (100 reports/minute)
3. Stores reports in memory (bounded ring buffer, max 1000 entries)
4. Exposes `GET /api/v1/csp-reports` for admin review (HQ only)
5. Logs unique violation signatures at `warn` level

---

## 5. Test Fixtures

### 5.1 Empire nginx — Synthetic CSP Violation Report

```json
{
  "csp-report": {
    "document-uri": "https://a-l-l-a-h.com/en",
    "referrer": "",
    "violated-directive": "script-src",
    "effective-directive": "script-src",
    "original-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; media-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint",
    "disposition": "report",
    "blocked-uri": "https://evil.example.com/malware.js",
    "line-number": 0,
    "column-number": 0,
    "source-file": ""
  }
}
```

**Expected behavior:** Report is sent to `/api/csp-report`; page still loads (report-only mode).

### 5.2 Empire — Inline Script Violation (Expected in Staging)

```json
{
  "csp-report": {
    "document-uri": "https://a-l-l-a-h.com/en/about",
    "referrer": "https://a-l-l-a-h.com/en",
    "violated-directive": "script-src",
    "effective-directive": "script-src",
    "original-policy": "...",
    "disposition": "report",
    "blocked-uri": "inline",
    "line-number": 1,
    "column-number": 128,
    "source-file": "https://a-l-l-a-h.com/en/about"
  }
}
```

**Expected:** This WILL fire because Next.js static export injects inline scripts. The `'unsafe-inline'` in `script-src` covers Next's own bootstrap, but any third-party analytics or injected script would be reported.

### 5.3 ARSY — WebSocket Connection Violation

```json
{
  "csp-report": {
    "document-uri": "https://api.moonwitness.biz.id/docs",
    "referrer": "",
    "violated-directive": "connect-src",
    "effective-directive": "connect-src",
    "original-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    "disposition": "enforce",
    "blocked-uri": "ws://127.0.0.1:3000",
    "line-number": 0,
    "column-number": 0,
    "source-file": ""
  }
}
```

**Expected:** This fires in dev mode because Swagger UI tries WebSocket. ARSY's current CSP lacks `ws:`/`wss:` in `connect-src`, which is a known gap.

### 5.4 Dock — Embed Path Framing Test

```
GET /embed/player-123 HTTP/1.1
Host: moonwitness.biz.id
```

**Expected response headers:**
```
content-security-policy: default-src 'self'; ...; frame-ancestors https://cockpit.example.com; ...
x-frame-options: (absent — allow-list is active)
```

**Negative test — non-embed path:**
```
GET /en/catalog HTTP/1.1
Host: moonwitness.biz.id
```

**Expected response headers:**
```
content-security-policy: default-src 'self'; ...; frame-ancestors 'none'; ...
x-frame-options: DENY
```

### 5.5 Test Case Matrix (JSON)

```json
{
  "test-cases": [
    {
      "id": "TC-01",
      "surface": "empire-nginx",
      "request": "GET /en HTTP/1.1",
      "expected-headers": {
        "content-security-policy-report-only": "present",
        "strict-transport-security": "max-age=15552000",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "strict-origin-when-cross-origin"
      },
      "expected-violations": ["inline script from Next.js bootstrap (if any escapes unsafe-inline)"]
    },
    {
      "id": "TC-02",
      "surface": "empire-vercel",
      "request": "GET /en HTTP/1.1",
      "expected-headers": {
        "content-security-policy-report-only": "present",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "strict-origin-when-cross-origin",
        "permissions-policy": "camera=(), microphone=(), geolocation=()",
        "x-robots-tag": "noindex, nofollow"
      },
      "expected-violations": []
    },
    {
      "id": "TC-03",
      "surface": "dock",
      "request": "GET /en HTTP/1.1",
      "expected-headers": {
        "content-security-policy": "present (enforce mode)",
        "strict-transport-security": "max-age=15552000",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "strict-origin-when-cross-origin",
        "permissions-policy": "camera=(), microphone=(), geolocation=()"
      },
      "expected-violations": []
    },
    {
      "id": "TC-04",
      "surface": "dock-embed",
      "request": "GET /embed/test HTTP/1.1",
      "env": { "EMBED_ORIGINS": "https://example.com" },
      "expected-headers": {
        "content-security-policy": "present with frame-ancestors https://example.com",
        "x-frame-options": "absent"
      },
      "expected-violations": []
    },
    {
      "id": "TC-05",
      "surface": "arsy",
      "request": "GET /api/v1/health HTTP/1.1",
      "expected-headers": {
        "content-security-policy": "present (enforce mode)"
      },
      "expected-violations": ["Swagger UI WebSocket in dev mode"]
    },
    {
      "id": "TC-06",
      "surface": "orbit",
      "request": "GET / HTTP/1.1",
      "expected-headers": {
        "content-security-policy-report-only": "present",
        "strict-transport-security": "max-age=15552000",
        "x-content-type-options": "nosniff"
      },
      "expected-violations": ["Three.js shader eval in dev mode"]
    },
    {
      "id": "TC-07",
      "surface": "empire-nginx",
      "request": "Simulated external script load",
      "trigger": "<script src='https://evil.example.com/x.js'>",
      "expected-violations": [
        {
          "violated-directive": "script-src",
          "blocked-uri": "https://evil.example.com/x.js",
          "disposition": "report"
        }
      ]
    }
  ]
}
```

---

## 6. Authorized Staging Violations

### 6.1 Expected Violations in Report-Only Mode

When CSP is first deployed in report-only mode, the following violations are **expected and authorized**:

| Surface | Violation | Directive | Reason | Authorized |
|---------|-----------|-----------|--------|------------|
| Empire | Next.js inline bootstrap script | `script-src` | `'unsafe-inline'` covers this; report only if it escapes | CONDITIONAL — should not fire with `'unsafe-inline'` |
| Empire | Google Fonts CSS (if added) | `style-src`, `font-src` | Not in current build; would need policy update | YES — expected if fonts are added |
| Orbit | Three.js WebGL shader `eval` | `script-src` | `'unsafe-eval'` needed in dev; production build should not fire | YES in dev; should not fire in prod |
| ARSY | Swagger UI inline scripts | `script-src` | Already covered by `'unsafe-inline'` | Should not fire |
| ARSY | WebSocket to hub in dev | `connect-src` | `ws:`/`wss:` missing from ARSY CSP — this is a known gap to fix | YES — will fire until ARSY aligns with core |
| Dock | React Refresh `eval` in dev | `script-src` | Dev-only; production build does not fire this | YES in dev only |

### 6.2 Violation Review Process

1. **Deploy** report-only CSP to staging
2. **Collect** reports for 7 days minimum
3. **Triage** daily: classify each unique `(violated-directive, blocked-uri)` pair as:
   - **EXPECTED**: document rationale, add to authorized list
   - **BUG**: fix the source (e.g., add missing directive to policy)
   - **ATTACK**: investigate blocked URI origin
4. **Tune** policy based on BUG findings
5. **Promote** to enforce mode when:
   - Zero unexpected violations for 48 hours
   - All EXPECTED violations have written rationale
   - No BUG remains unfixed

### 6.3 Thresholds for Enforcement Promotion

| Metric | Report-Only Threshold | Action |
|--------|----------------------|--------|
| Unique violation signatures | 0 unexpected | Proceed to enforce |
| Total daily reports (per surface) | < 10 | Normal operation |
| Total daily reports (per surface) | 10–100 | Investigate; may be false positives from bots |
| Total daily reports (per surface) | > 100 | Policy misconfiguration; do not promote |
| Time in report-only mode | >= 7 days | Minimum observation window |
| Blocked URI from external domain | Any | Investigate immediately |

---

## 7. Risk Assessment

### 7.1 What Could Break If CSP Is Enforced

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Next.js hydration fails (inline script blocked) | LOW — `'unsafe-inline'` is in policy | HIGH — page renders but no interactivity | Test in staging first; keep `'unsafe-inline'` until nonce migration |
| Audio player breaks (media-src too restrictive) | LOW — `'self' https:` covers station URLs | HIGH — radio unplayable | Core policy already has `media-src 'self' https:` |
| Cover art fails to load (img-src too restrictive) | LOW — `'self' data: https:` covers external images | MEDIUM — missing artwork | Already permissive for images |
| WebSocket disconnects (connect-src missing ws:) | MEDIUM for ARSY — current ARSY CSP lacks `ws:`/`wss:` | HIGH — live updates stop | Fix ARSY CSP to align with core before enforcement |
| Embed pages cannot be framed | LOW — frame-ancestors is already working in Dock | MEDIUM — widget breaks | Per-path framing in Dock middleware already handles this |
| Three.js shaders fail in Orbit | MEDIUM in dev — needs `'unsafe-eval'` | MEDIUM — 3D scene broken | Add `'unsafe-eval'` to Orbit report-only policy; remove for prod enforcement |

### 7.2 Rollback Plan

**Immediate rollback (minutes):**
- Empire nginx: Remove `Content-Security-Policy-Report-Only` header from `nginx.conf`; reload nginx
- Empire Vercel: Remove CSP header from `vercel.json`; redeploy
- Orbit: Revert `next.config.mjs` to remove CSP header
- ARSY: Revert `helmet.ts` to previous config

**No data loss:** CSP headers are response-only; removing them has no side effects on stored data.

**Rollback verification:**
```bash
# Verify CSP is gone
curl -sSI https://a-l-l-a-h.com/en | grep -i content-security-policy
# Expected: no output (header removed)

# Verify other security headers remain
curl -sSI https://a-l-l-a-h.com/en | grep -i strict-transport-security
# Expected: strict-transport-security: max-age=15552000
```

### 7.3 Monitoring Requirements

| Signal | Source | Alert Threshold | Dashboard |
|--------|--------|----------------|-----------|
| CSP violation reports | ARSY `/api/v1/csp-reports` | > 50 unique violations/hour | Grafana panel |
| Violation rate by surface | Report `document-uri` parsing | Any new surface appearing | Time series chart |
| Blocked URI categories | Report `blocked-uri` grouping | External domain in `script-src` | Pie chart |
| Report endpoint errors | ARSY logs | 5xx on `/api/v1/csp-reports` | Error rate alert |
| Header presence check | Synthetic monitoring (M44-08 pattern) | Missing CSP on any surface | Uptime-style dashboard |

---

## 8. Monitoring Dashboard Mockup

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CSP VIOLATION DASHBOARD                          │
│                    Last 24 hours · All surfaces                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Total Reports: 142    Unique Signatures: 7    Surfaces: 4         │
│                                                                     │
│  ┌─ Reports by Surface ──────────────────────────────────────────┐ │
│  │  empire-nginx   ████████████████████████████████  89 (62.7%)  │ │
│  │  empire-vercel  ██████████████████                 41 (28.9%) │ │
│  │  orbit          ███                                   7 (4.9%)│ │
│  │  arsy           ██                                    5 (3.5%)│ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Top Violated Directives ─────────────────────────────────────┐ │
│  │  script-src     ██████████████████████████████████  78 (54.9%)│ │
│  │  connect-src    ██████████████████                 38 (26.8%) │ │
│  │  style-src      ████████                           17 (12.0%) │ │
│  │  img-src        ███                                 6 (4.2%) │ │
│  │  font-src       ██                                  3 (2.1%) │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Violation Timeline (hourly) ─────────────────────────────────┐ │
│  │  00 █████                                                         │
│  │  04 ██                                                            │
│  │  08 ████████████████████████████████████████                      │
│  │  12 ██████████████████████████████████████████████████████        │
│  │  16 ████████████████████████████████████████                      │
│  │  20 ████████████████████████████████████████████████              │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Enforcement Readiness ───────────────────────────────────────┐ │
│  │  empire-nginx   ● REPORT-ONLY  (7 days observed, 3 sigs left) │ │
│  │  empire-vercel  ● REPORT-ONLY  (7 days observed, 3 sigs left) │ │
│  │  orbit          ● REPORT-ONLY  (3 days observed, 2 sigs left) │ │
│  │  arsy           ● ALIGNED       (CSP matches core)             │ │
│  │  dock           ● ENFORCING     (production CSP active)        │ │
│  │  headquarters   ● ENFORCING     (production CSP active)        │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Status: ● ENFORCING  ● REPORT-ONLY  ● ALIGNED  ● OBSERVING      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Implementation Roadmap

### Phase 1: Add CSP to Empire (Report-Only) — Effort: S (1-2 days)

**Files to change:**
- `apps/empire-web/nginx.conf` — add `Content-Security-Policy-Report-Only` header
- `apps/empire-web/vercel.json` — add `Content-Security-Policy-Report-Only` to headers array
- `apps/empire-web/nginx.conf` — add `Permissions-Policy` header (gap G4)

**nginx change:**
```nginx
add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; media-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; report-to csp-endpoint" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

**vercel.json change:**
```json
{
  "key": "Content-Security-Policy-Report-Only",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; media-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; report-to csp-endpoint"
}
```

**Acceptance:** `curl -sSI https://a-l-l-a-h.com/en | grep -i content-security-policy` returns report-only header.

### Phase 2: Align ARSY CSP with Core — Effort: S (1 day)

**File to change:** `apps/arsy/src/plugins/helmet.ts`

**Add missing directives:**
```typescript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'", 'data:'],                    // NEW — align with core
    connectSrc: ["'self'", 'ws:', 'wss:'],            // CHANGED — add ws/wss
    mediaSrc: ["'self'", 'https:'],                    // NEW — align with core
    frameAncestors,
    baseUri: ["'self'"],
    formAction: ["'self'"],
  },
},
```

**Acceptance:** ARSY CSP directives match core `securityHeaders()` directives (modulo dev-mode `unsafe-eval`).

### Phase 3: Deploy Violation Reporting Endpoint — Effort: M (3-5 days)

**New file:** `apps/arsy/src/modules/csp-reports/index.ts`

**Routes:**
- `POST /api/v1/csp-reports` — accept violation reports
- `GET /api/v1/csp-reports` — admin-only report listing (HQ session required)

**Constraints:**
- Rate limit: 100 reports/minute per source IP
- Ring buffer: max 1000 reports in memory
- No persistence (reports are ephemeral diagnostic data)
- Log unique violation signatures at `warn` level
- Validate report schema before storing

**Acceptance:** Browser CSP violation reports arrive at endpoint; admin can view them via HQ.

### Phase 4: Monitor and Tune — Effort: Ongoing (7-14 days observation)

- Deploy Phase 1-3 changes to staging
- Monitor violation reports daily
- Triage each unique `(violated-directive, blocked-uri)` pair
- Update policy for legitimate violations (add directives, adjust sources)
- Document authorized exceptions with written rationale

**Acceptance:** Zero unexpected violation signatures for 48 consecutive hours.

### Phase 5: Switch from Report-Only to Enforce — Effort: S (1 day)

**Changes:**
- Empire nginx: Rename `Content-Security-Policy-Report-Only` to `Content-Security-Policy`
- Empire Vercel: Same rename in `vercel.json`
- Orbit: Add CSP header to `NON_FRAMING_HEADERS` or middleware (enforce mode)

**Acceptance:** `curl -sSI https://a-l-l-a-h.com/en | grep -i content-security-policy` returns enforce-mode header (no `-Report-Only` suffix).

---

## 10. Overlap Analysis

### 10.1 M44-08 (Domain Cutover / Host Verification)

**Relationship:** M44-08 verifies that each host returns correct security headers. The verification matrix already checks for `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.

**Impact:** When CSP is added to Empire, M44-08's verification matrix should be extended to include `Content-Security-Policy` presence checks. The existing `curl -sSI` probes already capture all response headers.

**Action:** Update `docs/tasks/M44/M44-08.md` matrix to add CSP check for Empire after Phase 5.

### 10.2 M44 (Empire Static Export)

**Relationship:** Empire is the public-facing static export deployed to nginx (ADR-0012) and Vercel preview. It is the most visible surface and the one with the largest CSP gap (no CSP at all).

**Impact:** Phase 1 of this audit directly addresses Empire's missing CSP. The report-only approach ensures no breakage to the static export's rendering.

**Action:** Coordinate Phase 1 deployment with the next Empire build/deploy cycle.

### 10.3 M27-14 (Security Headers / HTTPS Verification)

**Relationship:** M27-14 verified that HTTPS is working and security headers are present on deployed hosts. It confirmed `Strict-Transport-Security: max-age=15552000` on dock, hq, orbit, media, and `a-l-l-a-h.com`.

**Impact:** M27-14 did NOT check for CSP presence. This audit reveals that CSP is missing from Empire despite HSTS being present.

**Action:** Future runs of M27-14's verification should include CSP checks.

### 10.4 M03-07 (Threat Model)

**Relationship:** M03-07 identifies "Clickjacking & XSS" as a threat vector and states that mitigation is "TERLINDUNGI (Mitigated)" via CSP headers. However, the threat model references `scripts/security-headers.mjs` which has been superseded by `packages/core/src/headers.ts`.

**Impact:** The threat model's claim of mitigation is **overstated** — Empire has no CSP, and ARSY's CSP is incomplete. The threat model should be updated to reflect the gaps identified in this audit.

**Action:** Update M03-07 threat model status for "Clickjacking & XSS" to note the Empire and ARSY gaps. Re-rate as "PARTIALLY MITIGATED" until Phase 5 completes.

---

## 11. Acceptance Criteria

### 11.1 No Selected Route Breaks

| Route | Surface | Test | Pass Criteria |
|-------|---------|------|---------------|
| `/en` | Empire nginx | Browser load | Page renders, all styles applied, no console CSP errors |
| `/id` | Empire nginx | Browser load | Page renders, all styles applied, no console CSP errors |
| `/en/about` | Empire nginx | Browser load | Page renders, navigation works |
| `/embed/:id` | Dock | Browser load in iframe | Embed renders when `EMBED_ORIGINS` includes the parent |
| `/en` | Dock | Browser load | Page hydrates, all buttons functional |
| `/login` | Headquarters | Browser load | Login form works, session cookie set |
| `/` | Orbit | Browser load | Three.js scene mounts, controls respond |
| `/api/v1/health` | ARSY | `curl` | Returns 200 with health status |
| `/docs` | ARSY | Browser load | Swagger UI renders, try-it-out works |

### 11.2 Inline Exceptions Have Written Rationale

| Exception | Directive | Surface | Rationale |
|-----------|-----------|---------|-----------|
| `'unsafe-inline'` in `script-src` | `script-src` | All | Next.js App Router injects inline `<script>` for hydration bootstrap (`__NEXT_DATA__`, chunk loading). No per-request nonce plumbing exists in Next.js 15 App Router. |
| `'unsafe-inline'` in `style-src` | `style-src` | All | Tailwind CSS and React inline styles require this. Migrating to nonce-based styles is blocked by the same Next.js limitation. |
| `'unsafe-eval'` in `script-src` (dev only) | `script-src` | Dock, HQ, ISP, Orbit, ARSY | React Refresh compiles modules with `eval()` in development. Production builds do not contain `eval`. Gated on `NODE_ENV !== 'production'`. |
| `ws:`/`wss:` in `connect-src` | `connect-src` | Dock, Orbit, ARSY (after Phase 2) | WebSocket connections for HMR (dev) and live updates. Needed because `connect-src 'self'` does not cover `ws://` or `wss://` schemes. |
| `data:` in `font-src` | `font-src` | All | Some fonts are embedded as data URIs in CSS. Blocking this would cause font rendering failures. |
| `https:` in `img-src` | `img-src` | All | Cover art is fetched from station URLs (external HTTPS sources). Blocking this would leave the player without artwork. |
| `https:` in `media-src` | `media-src` | Dock, Empire | Audio streams are fetched from HTTPS station URLs. Blocking this would make the radio player silently unplayable. |

---

## 12. Appendix: File Reference Index

| File | Role |
|------|------|
| `packages/core/src/headers.ts` | Canonical security header definitions |
| `packages/core/src/workspace.ts` | Port constants and `COCKPIT_DEV_ORIGINS` |
| `packages/web-config/src/index.ts` | Re-exports core headers for Next.js configs |
| `apps/dock/src/middleware.ts` | Per-path CSP and framing for Dock |
| `apps/dock/next.config.mjs` | `NON_FRAMING_HEADERS` for static assets |
| `apps/headquarters/next.config.mjs` | Full `securityHeaders()` for HQ |
| `apps/isp-console/next.config.mjs` | Full `securityHeaders()` for ISP Console |
| `apps/orbit/next.config.mjs` | `NON_FRAMING_HEADERS` (no CSP) for Orbit |
| `apps/orbit/src/middleware.ts` | Locale-only middleware (no CSP) |
| `apps/empire-web/nginx.conf` | nginx headers (no CSP) for Empire |
| `apps/empire-web/vercel.json` | Vercel headers (no CSP) for Empire |
| `apps/arsy/src/plugins/helmet.ts` | ARSY helmet config (divergent CSP) |

---

## 13. Summary of Required Actions

| Priority | Action | Phase | Effort | Blocks |
|----------|--------|-------|--------|--------|
| **P0** | Add CSP to Empire nginx (report-only) | 1 | S | — |
| **P0** | Add CSP to Empire Vercel (report-only) | 1 | S | — |
| **P1** | Add Permissions-Policy to Empire nginx | 1 | S | — |
| **P1** | Align ARSY CSP with core (add `font-src`, `media-src`, `ws:`/`wss:`) | 2 | S | — |
| **P2** | Deploy CSP violation reporting endpoint | 3 | M | Phase 1 |
| **P2** | Add CSP to Orbit (report-only) | 1 | S | — |
| **P3** | Monitor violations for 7+ days | 4 | Ongoing | Phase 1-3 |
| **P3** | Switch Empire CSP from report-only to enforce | 5 | S | Phase 4 |
| **P3** | Switch Orbit CSP from report-only to enforce | 5 | S | Phase 4 |
| **P4** | Update M44-08 verification matrix to include CSP | — | S | Phase 5 |
| **P4** | Update M03-07 threat model status | — | S | Immediate |
