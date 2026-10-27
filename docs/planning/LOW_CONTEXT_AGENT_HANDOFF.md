# Low-Context Agent Handoff Specification (M29-05)

**Status:** Canonical planning specification.
**Canonical task register:** [TODO.md](../../TODO.md) · [AI execution contract](AI_EXECUTION_CONTRACT.md).
**Prerequisites:** M29-01, M29-02, M29-03, M29-04.

---

## 1. Purpose and Philosophy

In MoonWitness XV, AI agents operate in bounded, low-context windows. When a task is completed, an agent must not assume that the next agent or the human integrator shares its in-memory history, prompt cache, or unrecorded assumptions.

A **Low-Context Agent Handoff** is a self-contained, reproducible cryptographic and architectural envelope that allows any subsequent agent (or human reviewer) with **zero prior context** to:
1. Verify what was claimed versus what was actually changed.
2. Check that all predecessors were verified and satisfied from the authoritative task register and their exact-SHA evidence.
3. Verify that positive tests proved the stated Definition of Done.
4. Verify that negative / adversarial tests proved fail-safe behavior.
5. Check affirmative declarations that source rights, private witness data, security invariants, and unrelated files were preserved.
6. Know the exact rollback procedure and the exact next eligible task.

---

## 2. The Handoff Envelope Schema

A compliant low-context handoff envelope MUST provide the following fields:

```typescript
export interface LowContextHandoffEnvelope {
  /** Canonical task identifier (must be a valid LEAF task, never an UMBRELLA). */
  task_id: string;

  /** Baseline git commit SHA when the task lease began. */
  baseline_sha: string;

  /** Resulting git commit SHA, or 'worktree-only' if uncommitted. */
  result_sha: string;

  /** Stable identifier of the executing worker/agent. */
  worker: string;

  /** Exclusive path scope declared at claim time. */
  claimed_paths: string[];

  /** Actual file paths created, modified, or deleted by the task. */
  actual_changed_paths: string[];

  /** Positive test proving acceptance criteria and Definition of Done. */
  positive_test: {
    command: string;
    observed_output: string;
  };

  /** Negative / adversarial test proving fail-safe rejection under error conditions. */
  negative_test: {
    command: string;
    observed_output: string;
  };

  /** Certification of source rights, privacy, secrets hygiene, and locale invariants. */
  security_rights_privacy: {
    no_secrets: boolean;
    no_private_witness_leak: boolean;
    preserved_source_rights: boolean;
    no_fabricated_deployment: boolean;
  };

  /** Human reviewer or independent review record. */
  reviewer: string;

  /** Scoped, safe rollback procedure that preserves unrelated files. */
  rollback_plan: string;

  /** Explicit boundary limitations (e.g. what is NOT claimed). */
  limitations: string;

  /** Existing task ID proposed as the next handoff; the receiver checks eligibility separately. */
  next_eligible_task: string;
}
```

---

## 3. Invariants & Acceptance Rules

1. **Leaf Confinement:** `task_id` MUST exist in the supplied canonical TODO and be a `LEAF` task according to [`scripts/planning/task-classifier.mjs`](../../scripts/planning/task-classifier.mjs). An unknown task is rejected (`INVALID_HANDOFF_METADATA`); an `UMBRELLA` task is rejected (`CONTRACT_VIOLATION`).
2. **Path Confinement:** Paths must be safe repository-relative paths without absolute roots, backslashes, or `.`/`..` segments. Every path in `actual_changed_paths` MUST be covered by `claimed_paths`. Unsafe paths are rejected (`INVALID_HANDOFF_METADATA`); writes outside declared scope are rejected (`OUT_OF_SCOPE_HANDOFF`).
3. **Mandatory Negative Proof:** An envelope without a valid negative test execution and fail-safe result is incomplete (`HANDOFF_INCOMPLETE`).
4. **Security, privacy, and rights declarations:** `no_secrets`, `no_private_witness_leak`, and `preserved_source_rights` must all be true or the envelope is rejected (`SECURITY_VIOLATION`). `no_fabricated_deployment` must be true or the envelope is rejected (`UNVERIFIED_DEPLOYMENT_CLAIM`). These are assertions in a handoff; they are not cryptographic proof and require human review.
5. **Exact Successor Binding:** `next_eligible_task` MUST identify a syntactically valid task that exists in the supplied TODO (`INVALID_HANDOFF_METADATA`). Existence does not prove priority, open status, dependency eligibility, or that the task is actually unblocked; the receiver must verify those separately.

---

## 4. Verification Workflow for Receiving Agent

When receiving a handoff:
1. **Deserialize Envelope:** Parse envelope from JSON or structured Markdown audit file.
2. **Execute Invariant Checks:** Pass the canonical TODO text to `verifyAgentHandoff(envelope, { todoMarkdown })`; validate fields, task existence, and scope. The caller remains responsible for provenance of TODO, baseline/result SHA, claimed paths, test output, reviewer identity and eligibility of the proposed successor.
3. **Verify prerequisites:** Read the task's dependency cell from TODO, then confirm every predecessor is checked and its evidence is valid at the reported integrated SHA. The envelope validator does not inspect dependency completion or exact-SHA provenance.
4. **Reproduce Verification:** Run the stated `positive_test.command` and `negative_test.command` against the working tree to confirm exact reproducibility.
5. **Accept or Reject:**
   - If all checks pass: acknowledge handoff and proceed to `next_eligible_task`.
   - If any check fails: reject handoff with specific error code, leaving files untouched.
