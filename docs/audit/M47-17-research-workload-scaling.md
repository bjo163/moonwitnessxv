# M47-17 — Research Workload and Resource Scaling Simulation

**Status:** BASELINE ESTABLISHED · **Date:** 2026-10-31 · **Owner:** Research/Operations

## Objective

Model synthetic reader/research workloads to explore capacity and cost sensitivity, providing ranges rather than falsely precise forecasts.

## Scope

1. Define scenarios (reader, researcher, power user)
2. Obtain baseline if available (from M46-18 benchmark)
3. Model uncertainty (variance in usage patterns)
4. Vary cost drivers (compute, storage, network, AI inference)
5. Document breakpoints (where does performance degrade?)

## Scenario definitions

### Scenario 1: Casual reader

**Profile:** Occasional user reading Quranic passages with audio navigation

**Usage pattern:**
- 10 sessions/week
- 5 minutes/session
- 3 passages/session
- 1 audio playback/session
- 0 research queries/session

**Monthly volume:**
- 40 sessions/month
- 120 passages/month
- 40 audio plays/month
- 0 research queries/month

**Resource consumption:**
- Compute: ~0.5 CPU-hours/month
- Storage: ~10 MB/month (cached passages)
- Network: ~50 MB/month (text + audio)
- AI inference: 0 tokens/month

### Scenario 2: Active researcher

**Profile:** Regular user conducting citation-bounded research

**Usage pattern:**
- 20 sessions/week
- 30 minutes/session
- 10 passages/session
- 5 audio plays/session
- 10 research queries/session

**Monthly volume:**
- 80 sessions/month
- 800 passages/month
- 400 audio plays/month
- 800 research queries/month

**Resource consumption:**
- Compute: ~10 CPU-hours/month
- Storage: ~200 MB/month (research notes + citations)
- Network: ~1 GB/month (text + audio + query results)
- AI inference: ~8M tokens/month (800 queries × 10k tokens/query)

### Scenario 3: Power researcher

**Profile:** Intensive user running large-scale corpus analysis

**Usage pattern:**
- 5 sessions/week
- 2 hours/session
- 50 passages/session
- 0 audio plays/session
- 50 research queries/session (complex, multi-hop)

**Monthly volume:**
- 20 sessions/month
- 1000 passages/month
- 0 audio plays/month
- 1000 research queries/month (complex)

**Resource consumption:**
- Compute: ~20 CPU-hours/month
- Storage: ~500 MB/month (large research datasets)
- Network: ~2 GB/month (bulk data transfer)
- AI inference: ~50M tokens/month (1000 queries × 50k tokens/query, multi-hop)

## Baseline from M46-18

**M46-18 benchmark (simulated):**
- Ingestion throughput: 240-500 records/second
- Memory usage: ~350 MB for 1000 passages
- Storage: ~350 KB for 1000 passages

**Scaling assumption:** Linear scaling for small workloads, sub-linear for large workloads (due to caching and batching).

## Uncertainty modeling

### Usage variance

**Assumption:** User behavior follows a log-normal distribution (most users are casual, few are power users).

**Parameters:**
- Mean: 1.5 (active researcher)
- Standard deviation: 1.0
- 95% of users fall within 0.5-3.5 (casual to power researcher)

**Monthly user distribution (for 1000 users):**
- Casual readers: 600 users (60%)
- Active researchers: 300 users (30%)
- Power researchers: 100 users (10%)

### Cost variance

**Assumption:** Cloud provider pricing has ±10% variance due to:
- Spot instance availability
- Regional pricing differences
- Volume discounts

**Parameters:**
- Compute: $0.05-0.06/CPU-hour
- Storage: $0.02-0.025/GB/month
- Network: $0.09-0.11/GB
- AI inference: $0.000001-0.0000015/token

## Cost modeling

### Fixed costs

| Component | Monthly cost | Notes |
|-----------|--------------|-------|
| Database (PostgreSQL) | $10 | Self-hosted on Coolify VPS |
| Object storage (ECHOLOG) | $5 | S3-compatible, 100 GB |
| VPS (Coolify) | $50 | 4 vCPU, 8 GB RAM |
| **Total fixed** | **$65** | — |

### Variable costs (per 1000 users)

| Component | Casual (600 users) | Active (300 users) | Power (100 users) | Total |
|-----------|-------------------|-------------------|------------------|-------|
| Compute (CPU-hours) | 300 hours × $0.05 = $15 | 3000 hours × $0.05 = $150 | 2000 hours × $0.05 = $100 | $265 |
| Storage (GB) | 6 GB × $0.02 = $0.12 | 60 GB × $0.02 = $1.20 | 50 GB × $0.02 = $1.00 | $2.32 |
| Network (GB) | 30 GB × $0.10 = $3 | 300 GB × $0.10 = $30 | 200 GB × $0.10 = $20 | $53 |
| AI inference (M tokens) | 0 × $0.000001 = $0 | 2400M × $0.000001 = $2.40 | 50000M × $0.000001 = $50 | $52.40 |
| **Total variable** | **$18.12** | **$183.60** | **$171** | **$372.72** |

### Total monthly cost (1000 users)

| Category | Low | High | Notes |
|----------|-----|------|-------|
| Fixed | $65 | $65 | — |
| Variable | $372 | $410 | ±10% variance |
| **Total** | **$437** | **$475** | — |

**Cost per user:** $0.44-0.48/user/month

## Sensitivity analysis

### If user count doubles (2000 users)

| Component | 1000 users | 2000 users | Change |
|-----------|------------|------------|--------|
| Fixed | $65 | $65 | 0% |
| Variable | $372 | $744 | +100% |
| **Total** | **$437** | **$809** | **+85%** |

**Breakpoint:** Fixed costs become negligible; variable costs dominate.

### If AI inference cost increases 10x

| Component | Current | 10x AI cost | Change |
|-----------|---------|-------------|--------|
| AI inference | $52.40 | $524 | +900% |
| **Total** | **$437** | **$909** | **+108%** |

**Breakpoint:** AI inference becomes the dominant cost driver.

### If compute cost decreases 50% (spot instances)

| Component | Current | 50% compute | Change |
|-----------|---------|-------------|--------|
| Compute | $265 | $132.50 | -50% |
| **Total** | **$437** | **$304.50** | **-30%** |

**Breakpoint:** Compute savings are significant but not transformative.

## Performance modeling

### Throughput

**Assumption:** ARSY API can handle 100 requests/second (baseline from M46-18).

**Request rate (1000 users):**
- Casual: 40 requests/month = 0.015 requests/second
- Active: 800 requests/month = 0.31 requests/second
- Power: 1000 requests/month = 0.39 requests/second
- **Total:** 0.72 requests/second (well below capacity)

**Request rate (2000 users):**
- **Total:** 1.44 requests/second (still below capacity)

**Breakpoint:** ~10,000 users would approach 7 requests/second, nearing capacity.

### Latency

**Assumption:** Average request latency is 200ms (from M46-18 benchmark).

**Latency by scenario:**
- Casual: 200ms (simple queries)
- Active: 500ms (research queries with citations)
- Power: 2000ms (complex multi-hop queries)

**Latency at scale (10,000 users):**
- Casual: 250ms (+25%)
- Active: 700ms (+40%)
- Power: 3000ms (+50%)

**Breakpoint:** Latency degrades significantly above 5000 users.

### Memory

**Assumption:** Each active session uses 50 MB RAM (from M46-18 benchmark).

**Concurrent sessions (1000 users):**
- Casual: 10 concurrent sessions = 500 MB
- Active: 40 concurrent sessions = 2000 MB
- Power: 5 concurrent sessions = 250 MB
- **Total:** 2750 MB (within 8 GB VPS)

**Concurrent sessions (10,000 users):**
- **Total:** 27,500 MB (exceeds 8 GB VPS)

**Breakpoint:** Memory becomes a constraint above 3000 users.

## Resource scaling recommendations

### Phase 1: 0-1000 users

**Infrastructure:** Single Coolify VPS (4 vCPU, 8 GB RAM)  
**Cost:** $437-475/month  
**Performance:** All metrics within acceptable range

### Phase 2: 1000-5000 users

**Infrastructure:** Add read replicas for PostgreSQL, increase VPS to 8 vCPU, 16 GB RAM  
**Cost:** $800-1000/month  
**Performance:** Latency increases 20-30%, still acceptable

### Phase 3: 5000-10,000 users

**Infrastructure:** Migrate to managed database (RDS), add load balancer, horizontal scaling  
**Cost:** $2000-3000/month  
**Performance:** Requires architectural changes to maintain latency

### Phase 4: 10,000+ users

**Infrastructure:** Kubernetes cluster, distributed caching, CDN for static assets  
**Cost:** $5000-10,000/month  
**Performance:** Requires significant engineering effort

## Breakpoint analysis

### Critical breakpoints

1. **1000 users:** Variable costs exceed fixed costs
2. **3000 users:** Memory constraint on single VPS
3. **5000 users:** Latency degradation becomes noticeable
4. **10,000 users:** Architectural changes required

### Cost breakpoints

1. **AI inference cost 5x:** Total cost increases 50%
2. **Compute cost 2x:** Total cost increases 30%
3. **User count 2x:** Total cost increases 85% (due to variable costs)

### Performance breakpoints

1. **Request rate 10x:** Latency increases 50%
2. **Concurrent sessions 3x:** Memory constraint hit
3. **Query complexity 2x:** Latency increases 100%

## Uncertainty statement

**Overall confidence:** MEDIUM

**Key uncertainties:**
1. User behavior distribution (casual vs active vs power) is estimated
2. AI inference cost is highly variable (±50%)
3. Performance at scale is extrapolated from small-scale benchmarks
4. Cloud provider pricing may change

**Recommendation:** Instrument actual usage patterns and costs to reduce uncertainty to ±20%.

## Overlap analysis

- **M46-18** (corpus ingestion benchmark): This task uses M46-18's throughput and memory baselines to model scaling. Complementary.
- **M46-31** (recurring service cost): M46-31 measures actual costs; this task models costs at scale. Complementary.
- **M46-20** (graph query fan-out): M46-20 defines query budgets; this task models how those budgets affect performance at scale. Complementary.

## Gaps and deferrals

1. **Real usage data:** This baseline uses synthetic scenarios. Actual usage patterns are unknown.
2. **Performance testing:** Scaling models are extrapolated from small-scale benchmarks. Load testing is deferred.
3. **Cost optimization:** Specific cost reduction strategies (e.g., caching, batching) are not modeled.
4. **Regional variance:** Pricing and performance may vary by region. This is not modeled.

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| User growth exceeds projections | Medium | High | Horizontal scaling plan |
| AI inference cost increases | High | Medium | Cache common queries |
| Performance degrades at scale | Medium | High | Load testing before Phase 3 |
| Cloud provider pricing changes | Low | Medium | Multi-cloud strategy |

## Rollback plan

If scaling fails:
1. Revert to single-VPS architecture
2. Implement rate limiting
3. Reduce user capacity
4. Optimize queries and caching

## Metrics

**Track:**
- Monthly active users (MAU)
- Cost per user
- Request rate (requests/second)
- Latency (p50, p95, p99)
- Memory usage (GB)
- AI inference tokens (millions)

**Targets:**
- Cost per user < $0.50/month
- Latency p95 < 1000ms
- Memory usage < 80% of VPS capacity

## Success criteria

- [x] Scenarios defined (casual/active/power researcher)
- [x] Baseline obtained (from M46-18)
- [x] Uncertainty modeled (usage variance, cost variance)
- [x] Cost drivers varied (compute, storage, network, AI)
- [x] Breakpoints documented (1000/3000/5000/10,000 users)
- [ ] Real usage data (deferred)
- [ ] Load testing (deferred)
- [ ] Cost optimization strategies (deferred)

## Evidence

- M46-18 corpus ingestion benchmark: `docs/audit/M46-18-corpus-ingestion-benchmark.md`
- M46-31 recurring service cost: `docs/audit/M46-31-recurring-service-cost.md`
- M46-20 graph query fan-out: `docs/audit/M46-20-graph-query-fanout.md`
- Scaling model: synthetic scenarios (no real usage data)

## Approval

**Document owner:** Research/Operations team  
**Reviewed by:** Owner authority (M47-17 task)  
**Approved:** 2026-10-31  
**Next review:** After 1000-user milestone
