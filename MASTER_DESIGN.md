# MOONWITNESS XV — MASTER DESIGN
**Status: PROPOSED shared behavior/visual contract, not a shipped skin collection.**

Actual source: `packages/moonui/moon.css`, `packages/moonui/src`, Dock/HQ/Cockpit styles. Existing MoonUI tokens include `--ink:#07060b`, `--surface:#13101d`, `--fg:#f7f4ec`, `--accent:#ffd400`, `--pink:#ff007a`, `--cyan:#00d4ff`, `--moon:#9d4edd`, `--muted:#9e96b0`, and spacing `--s1` through `--s5`. New components should use semantic roles, not arbitrary pasted hex.

Visual grammar: evidence-first moonpunk zine, brutalist contrast, readable text, licensed original geometric artwork. Skin changes visual recipe but never keyboard handling, ARIA, form meaning, permissions, source identity, publication/rights state, or machine API. Forms have labels, visible errors and loading states; tabs have arrow/Home/End and focus logic; dialogs return focus; one routed shell only; reduced motion, id/en and RTL scripture/source text remain meaningful.

[Behavior bible](docs/design/COMPONENTS.md) · [App surfaces](docs/design/APPS.md) · [Icon/vector pipeline](docs/design/ASSETS.md). M19/M30 own actual tests and screenshots.
