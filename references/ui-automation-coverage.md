# UI Automation Coverage

Use this reference when the task involves browser-based UI automation, especially for admin console forms, tables, drawers, tabs, selectors, and high-frequency operator actions.

## Purpose

This reference extends UI coverage beyond "element exists" checks.

It is meant to ensure that automated UI cases also cover:

- field roundtrip behavior
- invalid input handling
- recovery from invalid to valid input
- combined multi-control stability
- rapid interaction stability
- automatic evidence capture

## Core Principle

UI automation should not stop at static presence checks.

For important forms and interactive pages, coverage should usually span these layers:

1. structure exists
2. field can be filled
3. invalid values are blocked
4. valid values still work after invalid attempts
5. multiple controls work together stably
6. high-frequency actions do not break the page
7. execution evidence is captured when failures happen

## Coverage Layers

### 1. Structure And Field Presence

Check:

- page tabs and sections exist
- list/table headers exist
- drawer/dialog opens successfully
- required fields are visible
- required selectors and action buttons are present

### 2. Field Roundtrip

Check that valid input can be entered, retained, and re-read correctly.

Typical examples:

- input text field roundtrip
- boundary-value roundtrip
- multiline remark roundtrip
- search box roundtrip
- role selector single-select roundtrip
- multi-select member selector roundtrip

### 3. Invalid Input Validation

Check invalid values such as:

- empty value
- pure whitespace
- too short
- too long
- invalid characters
- unexpected special characters
- wrong format

Do not stop at just seeing an error.
Also check whether the page remains stable and usable after the invalid attempt.

### 4. Recovery After Invalid Input

This is a high-value layer that is often missed.

After an invalid input attempt:

- restore the field to a valid value
- confirm the control can recover
- confirm the page can proceed normally

### 5. Combined Multi-Control Stability

Do not only test each field in isolation.

Also test combinations such as:

- mobile + nickname + role + remark
- group name + members + role + remark
- search + status + tab switch
- permission toggles + role name + note

### 6. Rapid Interaction Stability

This should be treated as its own coverage class.

Cover:

- rapid open drawer
- rapid submit
- rapid cancel
- rapid refresh
- rapid tab switch
- rapid search/reset
- rapid checkbox toggle

Expected behavior:

- no duplicated drawer or modal
- no double submit
- no broken page state
- no invisible but still-blocking overlay
- no corrupted selection state

### 7. Search Box Stability

For search controls, cover at least:

- normal keyword
- special characters
- whitespace
- extra-long text
- sequential keyword switching
- reset behavior

Check both:

- page stability
- search result correctness when correctness is in scope

### 8. Selector Controls

Cover:

- single-select remains single-select after switching
- multi-select remains stable with multiple members
- deselection works
- selected value reflects correctly in UI
- selector remains usable after invalid or repeated operations

### 9. Execution Evidence Capture

When automated UI execution fails or surfaces an abnormal page result, capture evidence automatically.

Recommended evidence:

- screenshot
- current URL
- visible page message or popup
- relevant HTML snapshot or DOM excerpt
- case ID / step ID

If supported by the framework, also produce a consolidated HTML report.

## Automation Execution Rules

### Continue On Business Failure

If a case hits:

- business validation error
- popup error
- visible page exception
- unexpected UI result

record it as a real failure signal and continue to the next case unless the script itself cannot continue.

### Stop Only On Script-Level Failure

Only interrupt the run when:

- the script cannot continue
- session or environment is broken beyond recovery
- browser automation is no longer operable

### Aggregate After The Run

Do not rewrite cases while executing.

Finish the planned run first, then aggregate issues into categories such as:

- requirement mismatch
- UI bug
- stability issue
- environment issue
- automation script issue

## Test Data Rules

UI automation often needs deterministic and unique test data.

Recommended rules:

- test data must respect requirement-defined constraints
- generated usernames/group names should remain unique
- boundary data should be explicit and traceable
- invalid data should be intentionally invalid in one dimension at a time when possible

## Recommended Output Pattern

When this dimension is in scope, show it clearly in:

- `覆盖维度`
- `测试类型`
- `备注`

Example labels:

- UI结构
- 字段回填
- 字段异常
- 非法恢复
- 联合填写稳定性
- 高频交互稳定性
- 执行证据采集

## Human-Approved Learning

This reference was expanded using a real UI automation execution summary that emphasized:

- broad field-level recovery testing
- rapid interaction stability
- search-control stress behavior
- automatic exception capture and HTML reporting
- test-data generation rules

These patterns are now part of the reusable skill knowledge base because they were explicitly human-approved before being written back.
