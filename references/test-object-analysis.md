# Test Object Analysis

Use this reference before generating or reviewing test cases when the source describes business behavior, page navigation, permissions, data changes, state changes, or cross-module effects.

## Purpose

Do not jump directly from requirement text to detailed cases. First identify what must be tested, then expand those objects into scenarios, and only then write executable cases.

Preferred flow:

`requirement -> test object map -> test scenarios -> test cases`

This is a quality gate, not a mandatory large deliverable. For small requests, the map may be a concise internal checklist or a short visible summary. For broad or risky requirements, make the map explicit before detailed cases.

## Object Categories

Build the test object map with these categories when applicable:

| Category | What To Identify |
|----------|------------------|
| Page and interaction objects | menus, tabs, forms, buttons, lists, dialogs, empty/loading/error states, prompts |
| Business entity objects | users, roles, orders, projects, coupons, payments, tickets, records, memberships, resources |
| State transition objects | draft, pending, enabled, disabled, approved, rejected, expired, removed, refunded, failed, retried |
| Permission and role objects | actor, role, resource, action, data scope, backend authorization, old-link or direct-API access |
| Data and consistency objects | persistence, list/detail sync, cache, export, audit, notification, ledger, third-party callbacks, historical compatibility |
| Risk and confirmation objects | concurrency, idempotency, rollback, time limit, quota, ownership, unclear rules, unsupported assumptions |

## Scenario Expansion

For each important object, expand scenarios before writing cases:

- main flow
- alternate flow
- exception flow
- boundary and invalid input
- state transition
- permission and data-scope boundary
- data consistency and downstream side effect
- risk or unresolved confirmation item

If a scenario has no requirement basis but is a plausible risk, mark it as `待确认` or `扩展建议` instead of writing it as confirmed behavior.

## Case Selection

Not every scenario must immediately become a detailed case.

Classify scenarios by the most useful follow-up:

- `手工测试`: high-value business paths, UI flows, and exploratory judgment points
- `接口测试`: backend authorization, state transition, idempotency, data consistency, direct API access
- `自动化`: stable regression paths with clear setup, action, assertion, and cleanup
- `探索测试`: unclear, high-risk, or experience-sensitive behavior
- `待确认`: requirement gaps, missing baselines, unsupported assumptions, or product decisions

When the user asks for detailed cases, prioritize confirmed high-value scenarios and explicitly mark unconfirmed ones rather than inventing expected results.

## Anti-Patterns

Avoid:

- treating page elements as the whole test object set
- writing many cases that only restate the requirement
- expanding generic scenarios unrelated to the current object map
- using "displayed normally", "processed correctly", or "successfully handled" as expected results
- merging finite business entries before every listed object is visible in the coverage map
- turning assumptions about permissions, state, timing, or data consistency into confirmed expected results

## Review Checklist

When reviewing existing cases, check whether the case set proves that the author understood:

- which business entities are changed or queried
- which states can enter, leave, repeat, or fail
- who can perform each action and who must be blocked
- which downstream data, permissions, notifications, audit logs, or financial/accounting results must change
- which risks were intentionally covered, deferred, or marked as unclear

If the cases only cover page clicks, form validation, route jumps, or success toasts while the object map implies deeper business effects, write a review finding for missing test-object coverage.
