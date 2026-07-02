# Priority And Traceability

## Priority Defaults

Start from these defaults:

- happy path: P0
- important alternate path: P1
- main boundary path: P1
- invalid input handling: P1/P2
- exception path: P2
- edge EG case: P3

## Priority Raise Conditions

Raise priority when the case involves:

- security
- permission control
- money or settlement
- user management
- role or identity impact
- high-frequency path
- irreversible change
- historical defect hotspot

## Priority Lower Conditions

Lower priority only when the issue:

- is low frequency
- has a clear fallback
- affects appearance only

## Distribution Guardrail

Use this as a sanity check, not a blind quota:

- P0: 10% - 15%
- P1: 30% - 40%
- P2: 30% - 40%
- P3: 10% - 20%

## Traceability Rules

Every detailed case should include:

- requirement ID
- module
- operation
- source or assumption marker

If the source lacks IDs, create stable placeholders and mark them clearly.

## Coverage Target

General target:

- requirement coverage >= 95%

Also check:

- no uncovered critical requirement
- no orphan cases
- no case with missing validation target

## Deduplication Rule

Merge two cases when they validate the same target and differ only in:

- wording
- cosmetic setup difference
- repeated method origin

Keep separate cases when they validate different targets, such as:

- UI visibility vs backend enforcement
- state transition vs state display
- save result vs export result

## Risk Summary Template

```markdown
## 质量风险摘要

- 范围：
- 总体判断：
- 高风险模块：
- 已验证关键风险：
- 未验证关键风险：
- 覆盖率：
- 建议动作：
```

## Review Findings Template

```markdown
## Findings

### Blocking
- ...

### Important
- ...

### Suggestion
- ...
```
