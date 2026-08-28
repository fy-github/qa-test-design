# Test Report Template Following

Read this when a user supplies a DOCX test report, report template, or prior report and asks to follow its format.

## Template Authority

The supplied DOCX is the format authority. Do not replace it with a generic report layout, a new chapter design, or a simplified summary.

Before authoring, inventory the template:

- title paragraph style and direct formatting, including font, size, spacing, borders, and alignment
- every heading's exact text, style level, and ordering
- plain-text labels that are not headings, such as `注：`, `一、`, `二、`, `测试执行概况`, `测试覆盖范围`, `整体质量评估`, and `缺陷处理评估`
- each table's order, count, column count, header row text, column order, and explanatory paragraph before or after it
- list/bullet usage, table row split behavior, page geometry, headers, and footers

Build the final report from a copy of the template. Preserve the template itself unchanged.

## Content Rules

- Preserve the template's chapter sequence and heading levels exactly unless the user explicitly asks for a structural change.
- Preserve plain-text labels as plain text. Do not promote them to headings or replace them with a new title.
- Preserve each table's original header row and column order. Do not add an extra title row, a second header row, or a new table solely for convenience.
- Do not configure repeated header rows on table page breaks unless the template itself uses them or the user requests them.
- Keep explanatory paragraphs in the same relative position and the same narrative form as the template. For example, retain the template's `注：` prefix and its bullet or prose format.
- Do not invent business assertions, test environment details, dates, people, or root causes to fill template fields. Keep the template field and mark its value `待补充` when the source does not provide it.

## Data Source Rules

Use test-case execution records and BUG records as separate sources.

### Test Case Execution

When relevant workbooks are available under the current `功能需求/测试用例/` folder:

- choose the latest reviewed same-topic workbook using the normal baseline priority
- calculate execution metrics from `全部用例` using `是否执行` and `测试结果`, not workbook titles or unverified overview totals
- report total cases, executed cases, passed cases, failed cases, NA cases, and pass rate only from the actual fields present
- identify failed case IDs and linked defect IDs in the report where the template has a matching place
- do not state that a module passed when no relevant executable case exists; record the missing coverage or `待补充`

### BUG Data

- use BUG exports for defect counts, priority, workflow status, owners, and residual-risk tables
- a BUG status such as `完成` or `已修复` is not evidence that a test case passed
- if a report needs a defect-resolution rate, state the source field and calculation basis in the surrounding template-compatible explanation
- deduplicate only when the report defines a deduplicated metric; retain source-specific counts for source-specific tables

## Verification Gates

Before delivery:

1. Re-read the final DOCX and reconcile all report metrics with their source workbooks and BUG exports.
2. Compare against the template inventory: title formatting, heading order, plain-text labels, table count, table headers, column order, and explanatory text placement must match.
3. Confirm no additional table-header rows or table-title paragraphs were introduced. Confirm no repeated table-header configuration exists unless required by the template.
4. Render every page and check Chinese glyphs, title border/spacing, table width, row clipping, page breaks, and duplicate headers.
5. State any source gaps explicitly, such as unavailable environment, tester, execution date, or performance baseline, rather than filling them from assumption.
