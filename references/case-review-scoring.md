# Case Review Scoring

Use this reference only when the user asks for quantified case review, scoring, quality rating, or a case-quality portrait.

Scoring is optional. It does not replace `评审建议`; it summarizes case quality from the review findings.

## Relationship To Review Findings

- `评审建议` is the issue ledger: one case may have multiple review findings.
- `质量评分` is the quality summary: one case should have at most one scoring row.
- A low score must be traceable to one or more review finding IDs, categories, or issue descriptions.
- After review findings are fixed, rerun or update the score as a re-review result.

Do not create scores that cannot be explained by concrete review findings or requirement gaps.

## Default 100-Point Model

Use this default model unless the user provides another rubric:

| Dimension | Points | What To Check |
|-----------|--------|---------------|
| 逻辑完整性 | 25 | The case has a clear validation target, coherent steps, no missing operation, no broken business chain. |
| 预期明确性 | 20 | Expected results are observable, pass/fail capable, requirement-driven, and not vague phrases such as "正常" or "提示正确". |
| 前置条件 | 15 | Required account, role, permission, state, data, environment, and dependencies are explicit enough to execute. |
| PRD覆盖度 | 25 | The case maps to a requirement point and covers required rules, states, permissions, or listed entries. |
| 边界异常覆盖 | 15 | Important boundary, exception, permission, state, invalid data, and alternate paths are included when relevant. |

Score each dimension independently. The total score is the sum of all dimensions.

## Quality Levels

| Score | Quality Level | Handling |
|-------|---------------|----------|
| >= 85 | 可执行 | Can enter execution with minor optimization only. |
| 70-84 | 需修订 | Can be used after fixing review findings. |
| 60-69 | 不建议执行 | Requires substantial supplement and re-review before execution. |
| < 60 | 需重写 | Do not execute directly; rewrite or redesign the case. |

High-priority guardrail:

- If a P0/P1 core-flow case scores below 70, mark it as a blocking review risk even if the average score is acceptable.
- If a requirement module's average score is below 70, treat it as a module-level design-quality problem rather than an isolated case issue.

## Deduction Guidance

Typical deductions:

- missing requirement traceability: -10 to -25, depending on whether the target can still be inferred
- vague expected result: -5 to -20
- missing required precondition: -5 to -15
- steps not executable or missing decisive operation: -10 to -25
- only surface navigation coverage when business endpoint is required: -10 to -25
- missing finite-entry coverage for a listed menu/tab/page/service: -10 to -25
- missing important boundary, exception, permission, or state path: -5 to -15
- duplicated validation target with no new coverage value: -5 to -15
- fabricated or unsupported requirement assumption: -10 to -25 and mark `推断` / `待确认`

Do not over-penalize a case for requirement ambiguity. If the source itself is incomplete, record the gap and mark the affected score as `待确认` when needed.

## Workbook Output

When scoring is enabled for an xlsx case-review deliverable, add a worksheet named `质量评分`.

Recommended columns:

`用例ID` / `所属Sheet` / `总分` / `质量等级` / `逻辑完整性` / `预期明确性` / `前置条件` / `PRD覆盖度` / `边界异常覆盖` / `主要扣分原因` / `关联评审建议序号` / `处理建议` / `复评状态`

Recommended handling values:

- `可执行`
- `需修订`
- `不建议执行`
- `需重写`

Recommended re-review statuses:

- `未复评`
- `已复评`
- `待确认`

## Batch Quality Portrait

When scoring many cases, add a concise quality portrait in `概览` or at the top of `质量评分`:

- total reviewed cases
- average score
- number and ratio of cases below 70
- P0/P1 cases below 70
- lowest scoring modules
- top repeated issue categories
- requirement points or modules with low coverage confidence

Keep the portrait decision-oriented. It should help decide whether the case set can enter execution or needs redesign.
