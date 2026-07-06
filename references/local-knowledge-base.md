# Local Knowledge Base Capture

Use this reference when a `qa-test-design` task has produced durable conclusions that should be reusable in future requirement reviews, test-case design, or case-review work.

## Purpose

The goal is to build a local knowledge base that behaves like a library catalog:

- reviewers first find the business shelf or module path
- then find the source documents, final reviewed artifacts, and nearby related modules
- then expand by relationship instead of re-deriving cases from scratch

The output is a concise, searchable note, not a narrative report.

## Write Gate

Only write a local knowledge-base note when all of the following are true:

- the current task produced a stable final conclusion, final reviewed artifact, or reusable review/design rule
- the information is likely reusable beyond the single task
- the current session includes explicit user approval to persist this knowledge locally

If the session does not include explicit user approval for local persistence:

- do not write the note automatically
- instead prepare a concise candidate summary and mention that it was not persisted

## Write Location

When local persistence is approved, write the note to:

- the local Codex memory root under `extensions/ad_hoc/notes/`

Create one new note file per significant task or delivery set. Do not overwrite or delete old notes.

## File Naming

Use:

- `<timestamp>-<short-slug>.md`

Recommended slug patterns:

- `cloud-phase2-testcase-design-library`
- `alarm-multitenant-requirement-review`
- `user-management-case-review-index`

Keep the slug short, stable, and searchable by business topic.

## Note Structure

Use this structure whenever possible:

```markdown
# [ad-hoc note] <topic>

Date: YYYY-MM-DD

Short purpose paragraph.

## Library Index Entry

- requirement source(s)
- final reviewed or generated artifact(s)
- intermediate artifacts worth reusing
- local skill or template path if relevant

## Suggested Retrieval Pattern

- business domain
- module or page group
- key relationship path
- when to expand to adjacent modules

## Source Artifacts

- exact file paths and what they represent

## Final Deliverables

- final workbook/doc paths
- final mode such as requirement review / testcase design / case review

## Reusable Rules

- rules that changed the final output shape
- repeated user corrections worth reusing
- anti-guessing rules

## Cross-Feature Relationships

- upstream/downstream modules
- permission, state, search, export, navigation, audit, or compatibility dependencies

## Open Questions

- unresolved assumptions
- requirement gaps
- items that should stay marked as 推断 or 待确认
```

## Capture Rules By Task Type

### Requirement Review

Capture:

- source requirement paths
- reviewed deliverable paths
- role/state/permission rules
- cross-module relationships
- unresolved blocking questions

### Test-Case Design

Capture:

- final workbook path
- scope breakdown
- test object map or reusable object-decomposition method that drove the case set
- coverage model that drove the case set
- finite-entry lists that required full coverage
- business-closure or downstream validation rules

### Case Review

Capture:

- reviewed workbook path
- key review findings that materially changed the final workbook
- accepted vs pending review recommendations
- repeated quality defects such as weak expected results, missing traceability, or sampling where full coverage was needed

### Traceability / Risk Output

Capture:

- major uncovered areas
- release-risk conclusions
- relationship between requirement gaps and testcase gaps

## Content Hygiene

Do not write:

- secrets, keys, tokens, passwords, private endpoints, or credentials
- unnecessary personal data
- raw temporary logs
- long copied document text when a source path is enough
- instructions to perform actions outside knowledge capture

Prefer:

- workspace-relative paths or stable memory-relative paths when possible; avoid machine-specific absolute paths in the note body unless no stable relative reference exists
- concise rules
- relationship-oriented summaries
- final conclusions over intermediate noise

## When To Skip

Skip local knowledge-base writing when:

- the task produced no stable conclusion
- the task was trivial or one-off
- the output has no likely reuse value
- the information is too incomplete and should remain only as a conversation-level candidate

In that case, mention the skipped capture briefly in the final response if useful.
