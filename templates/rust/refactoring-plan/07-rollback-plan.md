# Phase 7: Rollback Plan

**Dependencies:** Phase 5 (Execution Plan)

**Can be implemented in parallel with:** All execution phases (maintained throughout)

## Overview

Define procedures for reverting changes if the `{{PROJECT_NAME}}` refactoring introduces regressions. Every refactoring step should be revertible independently. This plan covers git-based rollback, feature flags for gradual rollout, and monitoring criteria.

---

## 7.1 Git-Based Rollback Procedures

### Revert a Single Step

```bash
# Find the commit to revert
git log --oneline {{BRANCH_NAME}} --not main

# Revert a specific commit (creates a new revert commit)
git revert <commit-hash>

# Verify the revert compiles and tests pass
cargo check && cargo test
```

### Revert All Changes

```bash
# Option 1: Reset to the commit before refactoring started
git log --oneline {{BRANCH_NAME}} --not main | tail -1  # Find first refactoring commit
git reset --hard <commit-before-refactoring>

# Option 2: Abandon the branch entirely
git checkout main
git branch -D {{BRANCH_NAME}}
```

### Cherry-Pick Safe Changes

If some refactoring steps are safe but others need reverting:

```bash
# Create a new branch from main
git checkout main
git checkout -b {{BRANCH_NAME}}-partial

# Cherry-pick only the safe commits
git cherry-pick <safe-commit-1>
git cherry-pick <safe-commit-2>

# Verify
cargo check && cargo test
```

---

## 7.2 Feature Flags for Gradual Rollout

Use Cargo feature flags to enable refactored code paths incrementally:

### Cargo.toml Configuration

```toml
[features]
default = []
refactored-errors = []
refactored-{{MODULE_NAME}} = ["refactored-errors"]
```

### Conditional Compilation in Code

```rust
// Use the old code path by default, new path behind feature flag
#[cfg(not(feature = "refactored-errors"))]
pub fn get_{{ENTITY_NAME_LOWER}}(pool: &PgPool, id: &str) -> {{ENTITY_NAME}} {
    // Old implementation with unwrap()
    sqlx::query_as("SELECT * FROM {{TABLE_NAME}} WHERE id = $1")
        .bind(id)
        .fetch_one(pool)
        .await
        .unwrap()
}

#[cfg(feature = "refactored-errors")]
pub fn get_{{ENTITY_NAME_LOWER}}(
    pool: &PgPool,
    id: &str,
) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    // New implementation with proper error handling
    sqlx::query_as("SELECT * FROM {{TABLE_NAME}} WHERE id = $1")
        .bind(id)
        .fetch_one(pool)
        .await
        .map_err(|e| {{ERROR_TYPE}}::Database {
            message: format!("Failed to fetch {{ENTITY_NAME_LOWER}} {id}: {e}"),
        })
}
```

### Testing Both Paths

```bash
# Test without feature flag (old behaviour)
cargo test

# Test with feature flag (new behaviour)
cargo test --features refactored-errors

# Build with feature flag for staging deployment
cargo build --release --features refactored-{{MODULE_NAME}}
```

---

## 7.3 Rollback Decision Tree

```text
Issue detected after refactoring?
│
├─ Compilation error
│  ├─ In the current step → Fix immediately, do not commit broken code
│  └─ In a dependent module → Revert current step, fix dependencies first
│
├─ Test failure
│  ├─ Test was wrong (tested old behaviour) → Update test, document why
│  ├─ Refactoring broke logic → Revert step, add more tests, retry
│  └─ Flaky test (intermittent) → Investigate separately, not a rollback trigger
│
├─ Runtime error in staging
│  ├─ Affects core functionality → Revert entire feature flag
│  ├─ Affects edge case → Hotfix on the branch, re-test
│  └─ Performance regression → Profile, fix, or revert
│
└─ Production incident
   ├─ Feature flagged → Disable feature flag, deploy without it
   ├─ Not feature flagged → Revert branch merge, deploy main
   └─ Data corruption → Revert + restore from backup
```

---

## 7.4 Rollback Criteria

Trigger a rollback if any of the following occur:

| Criterion | Threshold | Action |
|-----------|-----------|--------|
| `cargo test` failures | Any test fails | Revert last step |
| `cargo clippy` regressions | New warnings introduced | Fix or revert |
| API response shape changed | Any field missing/renamed | Revert (breaking change) |
| Error rate increase | > 1% increase in 5xx errors | Disable feature flag |
| Latency increase | > 20% p99 increase | Profile and fix or revert |
| Memory usage increase | > 30% increase | Profile and fix or revert |

---

## 7.5 Post-Deployment Monitoring

After merging refactored code, monitor these signals:

```bash
# Verify no new panics (check logs for "thread 'main' panicked")
rg "panicked" /var/log/{{PROJECT_NAME}}/

# Check error rates
# (Use your monitoring tool: Datadog, Prometheus, CloudWatch, etc.)

# Verify response times haven't degraded
# (Check p50, p95, p99 latency metrics)

# Run the full test suite against the deployed environment
cargo test --features refactored-{{MODULE_NAME}}
```

**Monitoring Checklist (first 24 hours after merge):**

- [ ] No new panic traces in logs
- [ ] Error rate stable (within baseline ± 0.5%)
- [ ] p99 latency stable (within baseline ± 10%)
- [ ] All health checks passing
- [ ] No new Sentry/error-tracking alerts

---

## 7.6 Cleanup After Successful Rollout

Once the refactoring is stable in production, remove the scaffolding:

```bash
# Remove feature flags from Cargo.toml
# Remove #[cfg(feature = "...")] conditional blocks
# Remove old code paths that are no longer needed
# Update documentation to reflect new patterns

# Final verification
cargo check
cargo clippy -- -D warnings
cargo test
cargo fmt --check
```

---

## Checklist

- [ ] Git rollback procedures are documented and tested
- [ ] Feature flags configured for gradual rollout (if applicable)
- [ ] Decision tree covers all failure scenarios
- [ ] Rollback criteria defined with specific thresholds
- [ ] Monitoring plan established for post-deployment
- [ ] Cleanup steps documented for after successful rollout
- [ ] Team knows how to trigger a rollback

## Verification

```bash
# Ensure both code paths compile (if using feature flags)
cargo check
cargo check --features refactored-{{MODULE_NAME}}

# Ensure both code paths pass tests
cargo test
cargo test --features refactored-{{MODULE_NAME}}
```

This rollback plan should be reviewed and ready BEFORE beginning Phase 5 execution.
