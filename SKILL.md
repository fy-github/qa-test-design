---
name: qa-test-design
description: Use when the user asks to 根据需求生成测试用例、生成测试点、评审测试用例、补追溯矩阵、输出风险摘要，或将 PRD/需求文档/UI/API 转成 QA 测试资产，尤其适用于导出 xlsx/xmind/docx 的场景。
---

# QA Test Design

## Overview

This skill is for reusable QA design work, not only for writing test cases.

Use it when you need to:

- generate test points or detailed test cases from requirements
- review existing test cases for gaps, duplication, or poor executability
- review AI-generated QA artifacts for hallucination and consistency risk
- produce traceability, priority layers, and release-facing risk summaries
- check whether the requirement/design itself is testable before writing cases

Default language is Chinese unless the user asks otherwise.

Default output format is `xlsx`.

Supported output formats:

- `xlsx` (default)
- `xmind`
- `docx`

Keep `SKILL.md` lean. Read reference files only when their scope is relevant.

## When To Use

Use this skill when the user asks for any of the following:

- generate QA cases from a PRD, requirement doc, flow, UI, or API spec
- build a broad and reusable test design, not just a few sample cases
- review whether existing cases are complete, executable, verifiable, deduplicated, and traceable
- check AI-generated test plans, cases, reports, or requirement summaries
- produce export-oriented deliverables in spreadsheet, mind-map, or document form
- assess testability, observability, controllability, traceability, and coverage risk

Do not use this skill for pure execution reporting after test run results already exist; that is a separate reporting workflow.

## Inputs

Accept any combination of:

- PRD or requirement text
- screenshots, prototypes, UI flows
- API docs
- existing test cases
- business rules or acceptance criteria
- historical bug/risk notes

## Requirement Folder Gate

When the task depends on local requirement files, design screenshots, prototypes, or source documents:

- first check whether the current working directory contains a folder named `功能需求`
- if it does not exist, create it automatically
- remind the user to place requirement documents, design screenshots, prototype exports, or related source files into that folder

Preferred script:

- `node scripts/ensure-requirements-folder.mjs`

Default local convention:

- requirement documents go under `./功能需求/`
- design screenshots go under `./功能需求/`
- prototype exports or flow diagrams go under `./功能需求/`

If the user explicitly specifies another location, follow the user instruction.
## Test Case Folder Gate

When the task is generating test point files, test case files, traceability matrices, review outputs, or risk summaries as local deliverables:

- first identify the current requirement folder: use the source document's parent folder when a source file is provided; otherwise use `./功能需求/` under the current working directory
- first check whether that requirement folder contains a child folder named `测试用例`
- if it does not exist, create it automatically
- generated test case artifacts should default to that folder
- never write generated case files or delivery artifacts into the `qa-test-design` skill package root
- after generation, clearly tell the user which path the files were written to

Preferred script:

- `node scripts/ensure-testcases-folder.mjs`

Default local convention:

- generated xlsx / xmind / docx case files go under `<current requirement folder>/测试用例/`
- generated review reports, traceability matrices, and risk summaries may also go under `<current requirement folder>/测试用例/` when they are part of the same delivery set

If the user explicitly specifies another location, follow the user instruction.
## Mandatory Full-Document Reading Gate

If the user provides a specific document, file, exported text, or asks to work "based on this document", you must fully read that source before producing test points, detailed cases, traceability, risk summaries, or review conclusions.

This is a hard gate, not a best-effort suggestion.

Required behavior:

- read the full document, not just the title, TOC, headings, or search hits
- if the document is long, first use the document-reading script to extract full text, then read that extracted text in sequential chunks until the full body is covered
- adapt reading by file type using `scripts/read-document.mjs` for html, doc, pdf, and similar source files
- extract modules, rules, states, permissions, exceptions, and cross-feature relations from the full content
- only after full reading may you start testability review and case generation

Forbidden behavior:

- generating cases from only a summary, a screenshot fragment, or a keyword sample when a fuller source is available
- using only search hits or matching lines as a substitute for full reading
- assuming repeated sections are "same as above" without verifying the full source text
- claiming broad coverage if the underlying document was not read end-to-end

If the request is underspecified, ask only for the minimum missing information:

- target module or business scope
- source material location
- desired output mode

Do not ask for output format unless the user explicitly cares; default to `xlsx`.

## Default Decisions

If the user does not specify mode, choose by intent:

- "生成测试点" -> test points mode
- "生成测试用例" -> detailed cases mode
- "评审用例" -> case review mode
- "检查 AI 产物" -> AI artifact review mode
- "补追溯/风险" -> traceability and risk mode

If the user does not specify output format:

- default to `xlsx`

If the user does not specify output location:

- write final deliverables into `<current requirement folder>/测试用例/`

If a real binary export is requested:

- prefer generating the actual file when tooling exists
- otherwise produce an export-ready structured table/doc outline and clearly say what was not exported

When the target output is xlsx, prefer a two-step file flow:

- first write a structured case JSON into the target output directory
- then export xlsx from that JSON via script

Preferred wrapper script:

- `node scripts/generate-json-and-xlsx.mjs --input <raw-cases.json> [--output-dir <dir>] [--base-name <name>] [--title <title>]`

Real export scripts are bundled in `scripts/`:

- `scripts/read-document.mjs`
- `scripts/generate-xlsx.mjs`
- `scripts/generate-xmind.mjs`
- `scripts/generate-docx.mjs`

## Core Workflow

### 1. Fully read the source before designing cases

When the task is tied to a concrete document or file, complete full-document reading first.

For local requirement-driven work, check or create the `功能需求` folder first, and tell the user to place requirement documents, design screenshots, or design source files there when needed.

Minimum rule:

- no test output before the full source has been read
- for file-based inputs, first run the document-reading script when applicable
- for long documents, read sequentially until the whole document body is covered
- treat full reading as mandatory evidence gathering, not optional context enrichment

Preferred script:

- `node scripts/read-document.mjs --input <source-file> --output <text-file>`

Read [references/document-reading.md](references/document-reading.md) when the source is html, doc, pdf, or another file-based document.

Then read [references/requirement-parsing.md](references/requirement-parsing.md) to extract:

- modules
- actors
- operations
- fields and rules
- state transitions
- permissions
- integrations
- audit/notification side effects

For file output, check or create the `测试用例` folder under the current requirement folder first, and place generated case files there by default unless the user explicitly chooses another location.

### 2. Run a testability scan first

Before generating cases, read [references/testability-review.md](references/testability-review.md) and assess:

- is the behavior observable?
- is it controllable?
- can test data be prepared?
- are permissions/states deterministic?
- are logs, IDs, and side effects inspectable?
- are acceptance criteria specific enough to verify?

If important gaps exist, output a `可测试性问题清单` before or alongside cases.

### 3. Select specialized test dimensions before building coverage

Read [references/specialized-test-dimensions.md](references/specialized-test-dimensions.md) and decide whether the task also needs dimension-specific coverage such as API, UI, CLI, performance, security, compatibility, data, deployment, network, cache, async, file, third-party, search/filter, accessibility, i18n, reliability, compliance, or documentation consistency.

If the source clearly implies any of these dimensions, include them proactively rather than waiting for the user to ask.

### 4. Build a coverage model

Construct a coverage map using combinations such as:

- split the incoming feature scope into small, distinct functional points across relevant dimensions before writing cases
- identify both standalone functional points and cross-point relationships or dependencies before generating final cases
- identify each feature's business-logic endpoint before writing cases; do not stop at surface coverage such as menu visibility, button clickability, route jump, or success toast
- enumerate every in-scope entry, menu item, tab, page, action, and role-state combination before sampling or merging; do not use probability coverage when the requirement lists a finite set of user-facing functions
- module x operation
- actor x permission x object
- state x transition
- happy path x alternate path x exception path
- valid x invalid x boundary input
- UI x API x data x audit side effects

Full-entry coverage means:

- when the requirement lists concrete entries such as centers, menus, tabs, pages, services, roles, or buttons, create a coverage map that contains every listed item
- each listed entry must have at least one case that enters it and verifies the destination page's required content, controls, permissions, data state, and key feedback
- if the destination page supports meaningful operations such as add, edit, delete, enable/disable, bind/unbind, import/export, submit, approve, or configure, cover the representative core operations for that page unless the source explicitly excludes them
- only merge entries into one case when the validation target is genuinely the same and each item is still explicitly enumerated in the steps and expected results
- if full coverage is impossible because downstream page requirements, permissions, or test data are missing, mark the gap as `待确认` instead of silently sampling

Business-logic endpoint coverage means:

- entry coverage: user can enter the target function from the required menu, link, search result, notification, or shortcut
- target-page definition coverage: after entry or jump, the target page, fields, data, permissions, states, and visible rules match the requirement
- core-operation coverage: test the smallest meaningful create/read/update/delete/configure/submit actions on that page, not only that the page opens
- downstream-effect coverage: when an operation changes another business flow, continue to the downstream flow and verify the final business result
- closed-loop coverage: for cross-module changes, validate that the new state is actually consumed by the dependent feature, not merely saved successfully

Examples:

- If `用户中心` includes `概览 / 用户管理 / 角色管理 / 个人中心`, do not test only one or two entries as a representative sample. Each entry should be opened, checked against its page definition, and for pages with operations such as user or role management, lightly cover key add/edit/delete or enable/disable flows.
- If a case clicks `用户中心 -> 用户管理`, the expected result should include jumping to the user management page, verifying that the user management page matches its definition, and lightly testing key add/edit/delete or enable/disable behavior when those operations are in scope.
- If a case changes a withdrawal password in personal center, coverage should continue to a withdrawal scenario using the new password and verify the withdrawal reaches the required final result, such as successful submission or到账 evidence, according to the requirement and test environment.

For permission-heavy modules, treat access control as a first-class dimension, not an optional addon.

### 5. Generate test assets with layered methods

Read [references/test-design-methods.md](references/test-design-methods.md) and apply methods in order:

`EP -> BVA -> ST -> EG`

Then read [references/business-scenarios.md](references/business-scenarios.md) for common reusable scenarios such as:

- list/table
- form/input
- button/submit
- upload/import/export
- detail/read-only display
- permissions
- calculations
- retry/timeout/weak-network behavior

If the domain is user, role, permission, organization, or admin-console heavy, also read [references/domain-user-role-permission.md](references/domain-user-role-permission.md).

If the task involves browser-based UI automation, also read [references/ui-automation-coverage.md](references/ui-automation-coverage.md) and include its layers when relevant.

### 6. Deduplicate by validation target, not by wording

Read [references/priority-and-traceability.md](references/priority-and-traceability.md).

Merge cases when they validate the same target and only differ by:

- wording
- minor data state decoration
- repeated method origin

Keep the more concrete case and preserve source-method tags if useful.

### 7. Assign priority, risk, and traceability

Every output should include enough information to support:

- requirement traceability
- risk-based prioritization
- coverage review
- release decision support

Use the reference guidance for:

- P0/P1/P2/P3 distribution
- coverage target
- risk summary structure

### 8. If the artifact is AI-generated, add an AI quality review

Read [references/ai-output-review.md](references/ai-output-review.md) and explicitly inspect:

- factual accuracy
- logical consistency
- terminology correctness
- source authenticity
- instruction following
- structural completeness
- context retention
- duplication
- culture/common-sense fit

## Output Modes

### Test Points Mode

Use when the user wants breadth first.

Output:

- module breakdown
- coverage dimensions
- high-risk rules
- suggested priority split
- testability gaps

### Detailed Cases Mode

Use when the user wants executable cases.

Each case must be:

- executable
- verifiable
- traceable
- deduplicated

Before writing detailed cases:

- first break the requested feature into small functional points by dimension, not just by page or module name
- write cases for each standalone functional point first
- then write cases for the relationships, dependencies, handoffs, ordering rules, state coupling, or data interactions between functional points
- make sure both standalone functional points and cross-point relationships are covered across all relevant test types instead of covering only the obvious happy path
- when the requirement enumerates a finite list of entries, generate explicit coverage for every entry first; prioritize deduplication after coverage is visible, not before
- for every navigation, configuration, password, permission, account, money, order, project, or other business-affecting case, carry the case to the deepest verifiable business endpoint available in the requirement and environment
- do not treat "clicked successfully", "jumped successfully", "saved successfully", or "toast shown" as sufficient when the business value depends on target-page correctness, CRUD behavior, downstream use, settlement,到账, permission effect, notification, audit, or data synchronization

At minimum include:

- case ID
- title
- requirement link
- preconditions
- steps
- expected results
- priority
- test type

For automated cases in particular:

- expected results must be requirement-driven
- mismatches must fail loudly
- business mismatches are defects, not prompts to relax assertions
- when generating automation test case code, add concise Chinese comments for key business steps, assertions, and necessary setup/cleanup logic

For automated execution in particular:

- complete case generation before starting execution; do not generate and execute in a mixed step-by-step loop
- wait until required page elements and the relevant interactive state are fully loaded before each operation; do not interact with partially loaded pages
- execute every test item to completion against the intended validation target; do not treat partial input as completion when the case requires follow-up actions such as clicking confirm, submit, save, or other decisive controls
- maximize the browser window or set a sufficiently large viewport before interacting with the page so critical UI elements are visible and not hidden by layout constraints
- if a case triggers a page exception, popup, or abnormal message, record the real result and continue with the next case unless the script itself cannot proceed
- after the final step of a test flow, do not close the browser or page immediately; wait at least 1 second first so late prompts, toasts, or validation messages can be observed and recorded
- aggregate and classify issues after the run instead of silently fixing or rewriting cases mid-run
- if the discovered issue means the case definition itself may need to change, pause and ask the human before modifying the case set
- if the same automation execution problem remains unresolved after three troubleshooting rounds, stop the loop, ask the human to supplement missing information or environment details, and only retry after that input is provided

### Case Review Mode

Use when the user provides existing cases.

Review for:

- missing requirement links
- weak titles
- non-executable steps
- unverifiable expected results
- duplicated coverage
- missing permission/state/boundary coverage
- missing testability prerequisites

For normal chat-only review, return findings grouped as:

- blocking
- important
- suggestion

For workbook-based case review, do not leave review suggestions only in chat or a standalone Markdown report by default. Append the structured review findings to a new worksheet named `评审建议` in the reviewed workbook deliverable. If modifying the source workbook in place is not explicitly requested, create a reviewed copy in the current `测试用例/` output folder and preserve the original file.

The `评审建议` sheet must use these columns, in this order:

`序号` / `关联用例ID` / `所属Sheet` / `严重程度` / `评审类别` / `问题描述` / `修改建议` / `提出人` / `提出日期` / `状态` / `处理人` / `处理日期` / `处理备注`

Map finding groups to `严重程度` as follows unless the user provides another convention:

- `blocking` -> `高`
- `important` -> `中`
- `suggestion` -> `低`

Use `评审类别` for the defect type, such as `缺少需求追溯`, `标题较弱`, `步骤不可执行`, `预期不可验证`, `重复覆盖`, `缺少权限/状态/边界覆盖`, `缺少测试前置条件`, or `AI产物风险`. Default `状态` is `待处理`; fill `提出人` with the agent/model name when available and `提出日期` with the current date. Keep `处理人`, `处理日期`, and `处理备注` blank unless the review itself includes disposition results.

### AI Artifact Review Mode

Use when the input artifact is generated by AI.

Output:

- hallucination risk review
- structural completeness review
- instruction-following review
- whether the artifact is safe to use directly or only as draft material

### Traceability And Risk Mode

Use when the user wants release-facing QA output.

Output:

- requirement-to-case matrix
- uncovered requirements
- orphan cases
- coverage rate
- risk summary
- release recommendation or next actions

## Hard Rules

- Full-document reading is mandatory whenever the user provides or references a specific source document for case generation or review.
- Do not generate broad QA outputs from headings, keyword matches, or partial excerpts when the complete document is available.
- If you could not fully read the source, say so explicitly and do not claim complete coverage.
- Requirement-defined behavior is always the expected result baseline.
- Any behavior that does not conform to the requirement document, acceptance criteria, or explicitly confirmed product rule must be exposed as a failure and treated as a bug candidate.
- For automated test cases, expected results and assertions must follow the requirement document and parameter definitions exactly; if the requirement or parameter definition is missing, ambiguous, or incomplete, raise the issue explicitly instead of inventing the assertion baseline.
- Do not "fix", soften, reinterpret, or add compatibility logic just to make business assertions pass.
- Only handle script/runtime exceptions that prevent the test from executing; do not use workaround logic to hide requirement mismatches.
- If actual behavior differs from requirement-defined expectations, raise the mismatch explicitly instead of adapting the test to the current result.
- UI/runtime exception prompts encountered during automated execution should be captured as real execution evidence, written into the automated flow, reported in the final result, and must not stop the remaining case execution by default.
- During automated execution, wait for the necessary page elements and page state to finish loading before performing each operation.
- During automated execution, each test item must be fully carried through to its intended validation point; do not stop after partial data entry when the case requires confirmation, submission, saving, or another completing action.
- Window/viewport setup is mandatory for browser-based automated execution: maximize the window or use a sufficiently large viewport before locating or interacting with UI elements.
- Do not treat element invisibility caused by a small window, collapsed layout, or clipped viewport as a business failure before first correcting the viewport/window state.
- After completing a test flow, do not close the browser or page immediately; wait at least 1 second so delayed prompts, toasts, or validation messages can still be captured.
- Finish completing the case set first; do not switch into a patch-as-you-go loop where you modify cases while still executing them.
- When requirement, parameter-definition, assertion-baseline, or source-material problems are discovered during execution, list the issues first and ask the human for approval before changing the cases, rules, or expected results.
- If the same automation execution blocker remains unresolved after three troubleshooting rounds, stop and ask the human to supplement the missing information, inputs, permissions, environment details, or expected behavior before continuing, to avoid getting stuck in a loop.
- When generating automation test case code, include Chinese comments so reviewers can quickly understand the business intent, key assertions, and critical operation points.
- After automated execution, consolidate all discovered problems into a clear issue list instead of leaving them scattered across intermediate logs or step outputs.
- After each use of this skill, summarize any corrections, gaps, ambiguities, or domain-specific additions discovered during the work.
- This skill should continuously learn and evolve from real usage, but all newly learned reusable knowledge must be human-confirmed before it is written back into the skill package.
- If a reusable rule, workflow step, domain scenario, export rule, or review pattern was missing from the current skill package, first summarize the proposed addition for human review, and only update the skill package after explicit approval.
- Prefer updating the narrowest correct location: `SKILL.md` for core workflow and hard rules, `references/` for domain rules, examples, formats, and detailed guidance.
- Do not leave important newly learned reusable knowledge only in the conversation output when it should become part of the skill, but also do not auto-write such knowledge into the skill without human confirmation.
- Generated case files, review outputs, traceability artifacts, and risk summaries must be written under the current requirement folder, defaulting to `<current requirement folder>/测试用例/`, unless the user explicitly asks for another location.
- For xlsx case-review deliverables, findings must be written into a `评审建议` worksheet in the reviewed workbook or reviewed-copy workbook; do not default to a separate `.md` report unless the user explicitly asks for Markdown or an additional narrative report.
- Do not silently place final deliverables only in temporary directories. Temporary files may be used during processing, but the final deliverable must exist in the current path.
- Do not write generated case files, review outputs, traceability artifacts, or risk summaries into the `qa-test-design` skill package root.
- After writing xlsx, xmind, docx, or other document deliverables, verify that Chinese headings, worksheet names, labels, and body text are not garbled; if garbling exists, do not deliver the file until the encoding or export path is fixed.
- If the requirement depends on Chinese text fidelity, explicitly report that a no-garbled-text check was completed before concluding the task.
- When reading or writing workbooks/documents that involve Chinese paths, Chinese sheet names, or Chinese cell/body text, do not use PowerShell heredoc, inline shell scripts, or long command-line string generation. Write a standalone UTF-8 script file first, run that file, then reopen/read back the output to verify exact content.
- For Windows PowerShell helper scripts that contain Chinese literals and must run under Windows PowerShell, save the helper as UTF-8 with BOM; for Node/Python helper scripts, save as UTF-8 and avoid embedding Chinese file paths directly in a shell command when a working directory plus filename can be used.
- Do not fabricate requirements. If you infer, label the item as `推断` or `待确认`.
- Every detailed case must have a requirement source or an explicit placeholder.
- Expected results must be observable and pass/fail capable.
- Steps should describe actions, not vague verification verbs.
- Do not generate cases that only validate surface interactions when a deeper business endpoint is implied. A navigation case must verify the destination page definition; a configuration or password-change case must verify the changed value works in the dependent business flow; a permission-change case must verify the affected actor's real access; a financial or settlement case must verify the final business result such as balance, order state,到账, or ledger evidence where applicable.
- Do not use probability coverage for finite in-scope user-facing entries. If a requirement lists N menus, tabs, pages, modules, services, or role-state combinations, the case set must explicitly cover all N items or mark the uncovered items and reason as `待确认` / `不覆盖`.
- When a feature point is provided, first split it into smaller functional points across the relevant dimensions before generating cases.
- Generate cases for each standalone functional point first, then generate cases for the relationships between functional points.
- Cover both functional points and functional-point relationships across all relevant test types; do not stop at a shallow subset of happy-path cases.
- Cases may be generated one by one or grouped by functional point, but they must not be produced in a cursory or hand-wavy way.
- Prefer broad but meaningful coverage over inflated case counts.
- Always include main flow, alternate flow, exception flow, and boundary coverage when applicable.
- For user/role/permission systems, always cover actor-permission-state combinations.
- If the requirement is not testable enough, say so explicitly instead of pretending the ambiguity does not matter.

## Format Routing

Read [references/output-formats.md](references/output-formats.md) before producing deliverables.

Use these defaults:

- `xlsx`: default for reusable case libraries
- `xmind`: good for hierarchical exploration, feature trees, and review workshops
- `docx`: good for formal delivery, review circulation, or document-based handoff

## Recommended Output Order

For broad requirement work, prefer:

1. testability issues
2. coverage map
3. risk summary
4. detailed cases
5. traceability matrix

## Few-Shot Stabilization

If the task is broad or wording is noisy, read [references/few-shot-examples.md](references/few-shot-examples.md) and follow its output style before producing the final artifact.

## Post-Use Learning Loop

Before concluding any task that used this skill:

1. summarize what had to be corrected, clarified, or supplemented during execution
2. identify whether the missing knowledge is reusable beyond the current task
3. if reusable and not already captured, prepare a concise proposed skill update for human review
4. only after explicit human approval may the skill package be updated
5. mention in the final response when a proposed learning item was identified and whether it was approved into the skill

Typical items that should be proposed for skill evolution:

- newly discovered domain rules
- repeated user correction patterns
- missing permission or state coverage dimensions
- missing export constraints
- missing anti-slop wording or output structure
- document-reading pitfalls that can lead to incomplete coverage

Approval rule:

- proposed learning items must be shown to a human first
- only approved items may be recorded into `SKILL.md` or `references/`
- rejected items should remain outside the permanent skill knowledge base

If the user asks only for one artifact, output only that artifact plus the minimum supporting context.

## References

- [references/document-reading.md](references/document-reading.md)
- [references/specialized-test-dimensions.md](references/specialized-test-dimensions.md)
- [references/requirement-parsing.md](references/requirement-parsing.md)
- [references/testability-review.md](references/testability-review.md)
- [references/test-design-methods.md](references/test-design-methods.md)
- [references/business-scenarios.md](references/business-scenarios.md)
- [references/domain-user-role-permission.md](references/domain-user-role-permission.md)
- [references/priority-and-traceability.md](references/priority-and-traceability.md)
- [references/ai-output-review.md](references/ai-output-review.md)
- [references/output-formats.md](references/output-formats.md)
- [references/few-shot-examples.md](references/few-shot-examples.md)








