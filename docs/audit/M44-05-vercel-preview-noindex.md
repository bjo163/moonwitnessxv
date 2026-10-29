# M44-05 — Vercel preview stays non-canonical: observed evidence

**Repository-side half verified 2026-10-29 at `9900868` (remote `dev` = `main`).** The operator half — detaching any custom domain and recording the remaining aliases — is still open; this note records only what HTTP actually returned.

## What was requested

`curl -sSI https://<vercel-alias>/en` returns `X-Robots-Tag: noindex, nofollow` while the same build served by Coolify declares `index, follow`. Two different hosts, one indexable.

## Observed

Alias checked: `https://a-l-l-a-h-empire-web.vercel.app` (Vercel project `a-l-l-a-h-empire-web`).

| Request | Result |
|---|---|
| `curl -sS -D - https://a-l-l-a-h-empire-web.vercel.app/en` | `HTTP/1.1 200`, `Cache-Control: public, max-age=0, must-revalidate`, **`X-Robots-Tag: noindex, nofollow`**, `X-Vercel-Id: sin1::pvtjh-…` |
| `curl -sS -D - https://a-l-l-a-h-empire-web.vercel.app/robots.txt` | `HTTP/1.1 200`, `X-Robots-Tag: noindex, nofollow` |
| `curl -sS …/en` body head | `<meta name="robots" content="index, follow">`, `<link rel="canonical" href="https://a-l-l-a-h.com/en">` |
| `curl -o /dev/null -w '%{http_code}' …/sitemap.xml` | `200` |

The alias therefore serves the **post-ADR-0016 build** (canonical and sitemap already point at the apex) and still refuses indexing through the response header. That is the intended split: the page declares `index, follow` because the canonical host is indexable, and the preview host is hidden by `X-Robots-Tag` from `apps/empire-web/vercel.json:12-13`, which `apps/empire-web/test/contracts.test.mjs:36` pins. A crawler that does reach the alias is additionally pointed at `https://a-l-l-a-h.com/<path>` by the canonical link.

## Still open (operator, not verifiable from this host)

- Whether `a-l-l-a-h.com` or `www.a-l-l-a-h.com` is attached to the Vercel project. Removing an attached custom domain is a Vercel dashboard/API action; no Vercel token is configured here, so this note makes **no claim** about attached domains beyond the `*.vercel.app` alias above.
- The packet's required report (project name, remaining aliases, removed custom domains) therefore still needs the operator's Vercel view.
- The Coolify side of the same check (`index, follow` over real HTTPS on `a-l-l-a-h.com`) belongs to M44-08.

## Rollback

Nothing was changed. If the preview is ever re-attached to the apex, the pre-ADR indexing commit must be reverted too, or two indexable hosts exist at once.
