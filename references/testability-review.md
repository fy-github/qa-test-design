# Testability Review

Use this reference before writing detailed cases. Good cases require testable requirements.

## Testability Dimensions

### Observability

Can the tester tell what happened?

Check whether the requirement exposes:

- visible UI result
- API result
- persisted data result
- audit log
- event or notification
- exportable or queryable evidence

If the only expected result is "系统处理成功", the requirement is not observable enough.

### Controllability

Can the tester create the needed preconditions?

Check whether the tester can control:

- accounts and roles
- data setup
- feature switches
- environment state
- time-based constraints
- third-party responses

If setup depends on hidden or manual backend intervention, note a testability gap.

### Traceability

Can each case be linked to a requirement and each requirement to cases?

Check whether:

- requirement IDs exist
- acceptance criteria are separable
- modules and operations are named consistently

### Determinism

Can the same test reproduce the same result?

Watch for:

- non-deterministic sorting
- hidden asynchronous jobs
- race conditions
- retry timing ambiguity
- dependence on real-time clocks without control hooks

### Data Availability

Check whether required test data is:

- creatable
- unique when needed
- resettable
- queryable after operation

### Permission Clarity

Permission-heavy requirements are often poorly testable if they do not clearly define:

- who can enter
- who can read
- who can change
- who can delete
- whether forbidden actions are hidden or blocked with error

### Side-Effect Visibility

If an operation should:

- emit logs
- notify someone
- update related records
- sync to another service

then the requirement should state how those effects can be checked.

## Output Template

When important gaps exist, produce:

```markdown
## 可测试性问题清单

| 维度 | 问题 | 影响 | 建议 |
|------|------|------|------|
|      |      |      |      |
```

## Common Testability Gaps

- no unique identifier for records
- no clear success or failure evidence
- no role matrix
- no state model
- no error handling definition
- no audit/log expectation
- no test data preparation path
- no cleanup or rollback rule
- no environment dependency definition

## Rule

Do not hide testability problems inside assumptions. Surface them before detailed case generation.
