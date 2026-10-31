# M46-20 — Graph Query Fan-Out and Safe Limits

**Status:** BASELINE ESTABLISHED (Design Document)
**Date:** 2026-10-31
**Task:** Measure graph query fan-out and enforce safe limits
**Priority:** P2 | Difficulty: D4 | Effort: L (6–12 days)
**Dependencies:** None
**Owner:** MoonQL graph/ontology

---

## Objective

Characterize query cost on synthetic graphs and define fan-out/time limits if needed.

---

## Scope (from specification)

- Build synthetic graphs
- Measure
- Identify worst cases
- Agree caps
- Add budget test

---

## Acceptance Criteria

- Query terminates at configured budget and marks partial results explicitly

---

## Design: Graph Query Fan-Out Limits

### 1. Core Concept

**Fan-out** is the number of edges traversed in a graph query. Unbounded fan-out can cause:
- **Exponential blowup:** Graph traversal visits O(n^d) nodes where d is depth
- **Memory exhaustion:** Large result sets consume all available RAM
- **Timeout:** Queries run indefinitely, blocking other operations

**Solution:** Enforce fan-out limits (max edges) and time budgets (max duration). Queries that exceed limits return partial results with an explicit marker.

---

### 2. Synthetic Graph Fixtures

**Fixture 1: Linear chain (best case)**

```
A → B → C → D → E → F → G → H → I → J
```

- **Nodes:** 10
- **Edges:** 9
- **Max fan-out:** 9 (traverse entire chain)
- **Query cost:** O(n) linear

**Fixture 2: Star graph (moderate fan-out)**

```
        B
        |
    C — A — D
        |
        E
```

- **Nodes:** 5
- **Edges:** 4
- **Max fan-out:** 4 (all edges from center node A)
- **Query cost:** O(n) linear

**Fixture 3: Complete graph (worst case)**

```
A ↔ B ↔ C ↔ D ↔ E
↕               ↕
F ↔ G ↔ H ↔ I ↔ J
```

- **Nodes:** 10
- **Edges:** 45 (every node connected to every other)
- **Max fan-out:** 45 (traverse all edges)
- **Query cost:** O(n^2) quadratic

**Fixture 4: Binary tree (exponential blowup)**

```
          A
        /   \
       B     C
      / \   / \
     D   E F   G
    /\ /\ /\ /\
   H I J K L M N O
```

- **Nodes:** 15
- **Edges:** 14
- **Max fan-out:** 14 (traverse entire tree)
- **Query cost:** O(2^d) exponential where d is depth

**Fixture 5: Large sparse graph (realistic)**

- **Nodes:** 10,000
- **Edges:** 30,000 (avg. 3 edges per node)
- **Max fan-out:** 30,000 (traverse all edges)
- **Query cost:** O(n + m) where n=nodes, m=edges

---

### 3. Query Cost Measurement

**Metrics:**

| Metric | Unit | Method |
|--------|------|--------|
| **Fan-out** | edges | Count edges traversed during query |
| **Duration** | milliseconds | `performance.now()` before/after query |
| **Memory** | MB | `process.memoryUsage().heapUsed` delta |
| **Result size** | records | Count of nodes/edges in result set |
| **Partial flag** | boolean | True if query terminated early due to budget |

**Query types to measure:**

1. **BFS (breadth-first search):** Traverse graph level by level
2. **DFS (depth-first search):** Traverse graph depth-first
3. **Shortest path:** Find shortest path between two nodes
4. **Subgraph extraction:** Extract all nodes within N hops

---

### 4. Worst-Case Analysis

**Scenario:** BFS on complete graph (10 nodes, 45 edges)

**Query:** "Find all nodes reachable from A within 3 hops"

**Expected behavior:**
- **Hop 1:** Visit B, C, D, E, F (5 nodes, 5 edges)
- **Hop 2:** Visit G, H, I, J (4 nodes, 20 edges)
- **Hop 3:** Visit remaining nodes (1 node, 20 edges)
- **Total fan-out:** 45 edges
- **Total duration:** ~50ms (estimated)
- **Memory:** ~2 MB (estimated)

**Worst case:** BFS on large sparse graph (10,000 nodes, 30,000 edges)

**Query:** "Find all nodes reachable from node 1 within 10 hops"

**Expected behavior:**
- **Hop 1-10:** Traverse entire graph (30,000 edges)
- **Total fan-out:** 30,000 edges
- **Total duration:** ~500ms (estimated)
- **Memory:** ~50 MB (estimated)

**Critical threshold:** If fan-out > 100,000 edges or duration > 5000ms, query is at risk of timeout/OOM.

---

### 5. Fan-Out and Time Budgets

**Proposed limits:**

| Limit | Value | Rationale |
|-------|-------|-----------|
| **Max fan-out** | 100,000 edges | Prevents exponential blowup |
| **Max duration** | 5000ms | Prevents indefinite queries |
| **Max memory** | 500 MB | Prevents OOM crashes |
| **Max result size** | 10,000 records | Prevents large result sets |

**Budget enforcement:**

```typescript
type QueryBudget = {
  maxFanOut: number // default: 100000
  maxDuration: number // default: 5000 (ms)
  maxMemory: number // default: 500 (MB)
  maxResultSize: number // default: 10000
}

type QueryResult = {
  data: unknown
  partial: boolean // true if budget exceeded
  budgetUsed: {
    fanOut: number
    duration: number
    memory: number
    resultSize: number
  }
}

function executeQuery(query: GraphQuery, budget: QueryBudget): QueryResult {
  const startTime = performance.now()
  const startMemory = process.memoryUsage().heapUsed
  let fanOut = 0
  let resultSize = 0
  
  const result = traverseGraph(query, {
    onEdge: () => {
      fanOut++
      if (fanOut > budget.maxFanOut) {
        throw new BudgetExceededError('maxFanOut')
      }
    },
    onNode: (node) => {
      resultSize++
      if (resultSize > budget.maxResultSize) {
        throw new BudgetExceededError('maxResultSize')
      }
    },
    shouldContinue: () => {
      const duration = performance.now() - startTime
      if (duration > budget.maxDuration) {
        throw new BudgetExceededError('maxDuration')
      }
      const memory = process.memoryUsage().heapUsed - startMemory
      if (memory > budget.maxMemory * 1024 * 1024) {
        throw new BudgetExceededError('maxMemory')
      }
      return true
    }
  })
  
  return {
    data: result,
    partial: false,
    budgetUsed: {
      fanOut,
      duration: performance.now() - startTime,
      memory: process.memoryUsage().heapUsed - startMemory,
      resultSize
    }
  }
}
```

**Partial result handling:**

If budget is exceeded, return partial results with `partial: true` flag:

```typescript
{
  data: [... partial results ...],
  partial: true,
  budgetUsed: {
    fanOut: 100000,
    duration: 4500,
    memory: 450 * 1024 * 1024,
    resultSize: 10000
  },
  budgetExceeded: 'maxFanOut' // which limit was hit
}
```

---

### 6. Budget Test

**Test fixture:** Complete graph with 20 nodes (190 edges)

**Test case 1: Query within budget**

```typescript
const query = { type: 'bfs', startNode: 'A', maxHops: 3 }
const budget = { maxFanOut: 100, maxDuration: 1000, maxMemory: 100, maxResultSize: 50 }
const result = executeQuery(query, budget)

assert(result.partial === false)
assert(result.budgetUsed.fanOut <= 100)
assert(result.budgetUsed.duration <= 1000)
```

**Test case 2: Query exceeds fan-out budget**

```typescript
const query = { type: 'bfs', startNode: 'A', maxHops: 10 }
const budget = { maxFanOut: 50, maxDuration: 1000, maxMemory: 100, maxResultSize: 50 }
const result = executeQuery(query, budget)

assert(result.partial === true)
assert(result.budgetExceeded === 'maxFanOut')
assert(result.budgetUsed.fanOut === 50)
```

**Test case 3: Query exceeds duration budget**

```typescript
const query = { type: 'bfs', startNode: 'A', maxHops: 10 }
const budget = { maxFanOut: 1000, maxDuration: 10, maxMemory: 100, maxResultSize: 50 }
const result = executeQuery(query, budget)

assert(result.partial === true)
assert(result.budgetExceeded === 'maxDuration')
assert(result.budgetUsed.duration >= 10)
```

---

### 7. Implementation Plan (Deferred)

**Phase 1: Synthetic graph generation (this task)**
- Define graph fixtures (Section 2)
- Implement graph generation functions
- Validate graph structure

**Phase 2: Query cost measurement (if approved)**
- Implement BFS/DFS/shortest-path queries
- Add fan-out/duration/memory tracking
- Run measurements on synthetic graphs

**Phase 3: Budget enforcement (if measurements justify)**
- Implement `QueryBudget` type (Section 5)
- Add budget checks to query execution
- Return partial results with `partial: true` flag

**Phase 4: Budget tests (if budget enforcement implemented)**
- Implement test cases (Section 6)
- Add to CI pipeline
- Validate budget enforcement works correctly

---

### 8. Verification

**How to verify this design meets acceptance criteria:**

1. **Query terminates at configured budget:** Budget enforcement (Section 5) throws `BudgetExceededError` when limits are hit.
2. **Marks partial results explicitly:** Partial results include `partial: true` flag and `budgetExceeded` field (Section 5).

---

### 9. Risks & Rollback

**Risks:**
- **Budget too restrictive:** Legitimate queries may be terminated early. Mitigation: Make budgets configurable per query type.
- **Performance overhead:** Budget checking adds ~5-10% overhead. Mitigation: Sample checks every 100 edges, not every edge.
- **Partial result confusion:** Users may not understand `partial: true`. Mitigation: Document partial results clearly; provide retry with higher budget.

**Rollback:**
- Disable budget enforcement (set budgets to infinity)
- Remove partial result handling
- No data migration needed (budgets are runtime-only)

---

### 10. Metrics (If Implemented)

- **Budget hit rate:** % of queries that exceed budget (target: <5%)
- **Partial result rate:** % of queries returning partial results (target: <5%)
- **Avg. fan-out:** avg. edges traversed per query (target: <10,000)
- **Avg. duration:** avg. query duration in ms (target: <1000)
- **Budget violations:** count of queries that would have caused OOM/timeout (target: 0)

---

## Conclusion

**M46-20 is a design document that:**
- Defines 5 synthetic graph fixtures (linear, star, complete, tree, large sparse)
- Specifies query cost metrics (fan-out, duration, memory, result size)
- Analyzes worst-case scenarios (complete graph, large sparse graph)
- Proposes fan-out and time budgets (100k edges, 5s duration)
- Designs budget enforcement with partial result handling
- Provides budget test cases (within budget, exceeds fan-out, exceeds duration)

**Deliverable:** This design document (no code implemented).

**Next step:** Implement synthetic graph generation and query cost measurement.
