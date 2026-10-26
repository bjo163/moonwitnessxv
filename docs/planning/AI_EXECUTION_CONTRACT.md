# One low-context AI execution and ownership contract
[TODO](../../TODO.md) is the sole task status register. Blueprint owns architecture, Master Design UI semantics, ADRs accepted decisions, real tests runtime evidence.

1. Re-fetch current `dev` SHA; claim one **LEAF** with satisfied predecessors. Never assign a parent/umbrella and its child implementation to separate agents.
2. Read only the assigned task packet, relevant canonical contracts, and actual files; record worker, SHA, and at most three primary files unless necessarily coupled. One integrator coordinates shared TODO/manifests and submits changes through a PR to `dev`; shared MoonUI, i18n, and ARSY have designated owners. Do not push directly to `dev` or `main`, and do not force-push.
3. Check source rights, role/consent, legal/payment or physical-energy decision. If missing, return BLOCKED, not invented completion.
4. Produce one small result, positive and negative tests, preserved APIs and source/locale/security invariants; inspect diff for secrets and unrelated changes.
5. Return exact commands/results, changed paths, baseline/result SHA, reviewer, rollback/limitations, and next eligible ID. The integrator alone marks tasks checked after reviewing evidence. A passing CI is not a deployment or full milestone. After a PR merges into `dev`, GitHub Actions promotes the exact verified commit to `main`; do not perform that promotion manually.
