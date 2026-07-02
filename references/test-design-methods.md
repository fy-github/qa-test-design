# Test Design Methods

Apply methods in this order:

`EP -> BVA -> ST -> EG`

Before applying these methods, split the requested feature scope into small functional points by relevant dimensions. Generate cases for each standalone functional point first, then generate relationship cases for dependencies, ordering, state coupling, data linkage, and cross-feature interactions. Cover both standalone points and relationships across the relevant test types.

## 1. EP: Equivalence Partitioning

Use when there are:

- valid and invalid inputs
- format rules
- enum values
- required fields
- uniqueness rules

Typical partitions:

- valid value
- invalid value
- empty
- duplicate
- wrong type
- out-of-scope value

## 2. BVA: Boundary Value Analysis

Use when there are:

- min / max
- length limits
- count limits
- time windows
- amount precision

Typical points:

- min-1
- min
- normal in-range
- max
- max+1

## 3. ST: Scenario Testing

Use when there is workflow.

Always identify:

- happy path
- alternate path
- exception path
- rollback or recovery path if relevant

For stateful systems, include:

- entry state
- action
- target state
- prohibited state transitions

## 4. EG: Error Guessing

Use to supplement real-world risk.

Typical directions:

- special characters
- repeated submit
- concurrent operations
- timeout
- weak network
- stale page / refresh / back
- import dirty data
- permission bypass
- audit or sync failure

## Method Combination Rules

- Use EP and BVA for field-level correctness.
- Use ST for end-to-end logic.
- Use EG for production-like failure risk.
- Do not explode cases blindly; merge when the validation target is the same.

## High-Value Coverage Dimensions

Always consider whether the requirement needs:

- positive case
- negative case
- boundary case
- permission case
- state transition case
- side-effect case
- data consistency case
- concurrency or retry case
