# Specialized Test Dimensions

Use this reference when the task needs broader coverage than only business-functional cases.

It is especially useful when the requirement may involve multiple interaction layers or explicit non-functional expectations.

## Dimension Selection Rule

Before finalizing test points or detailed cases, decide which dimensions apply.

First identify interaction layers:

- UI
- API
- CLI / device command line
- file interaction
- async/background processing
- third-party integration

Then identify non-functional expectations:

- performance
- security
- compatibility
- data correctness
- deployment / upgrade
- network sensitivity
- cache behavior
- search / filter behavior
- accessibility
- internationalization / localization
- reliability / disaster recovery
- compliance
- documentation consistency

If the source document already implies these dimensions, do not wait for the user to ask. Include them proactively.

## Recommended Pre-Check Questions

Use only when the source material does not already answer them:

1. Which interaction layers are involved: UI, API, CLI, device-side, file workflow, or async workflow?
2. Are there explicit performance, security, compatibility, data, deployment, network, or other non-functional expectations?

## Dimension Matrix

| Dimension | Trigger | Core Checks |
|----------|---------|-------------|
| API | requirement includes endpoints, requests, callbacks, services | parameter validation, business logic, exception handling, protocol, versioning, batch, webhook, response consistency |
| UI | requirement includes pages, forms, dialogs, table/list, controls | element state, input validation, interactions, focus, modal behavior, table/list behavior, notifications, responsive behavior |
| CLI | device or shell command flows exist | command availability, parameter validation, permissions, stdout/stderr, exit code, environment dependency |
| Performance | explicit response, throughput, concurrency, or capacity expectations | load, stress, long-run stability, baseline metrics |
| Security | auth, authz, sensitive data, admin actions, third-party trust boundaries | authentication, token lifecycle, overreach, data protection, injection, auditability |
| Compatibility | multi-browser, multi-OS, device or environment support | browser/OS/device/network/timezone compatibility |
| Data | persistence, migration, calculations, import/export, concurrency | integrity, accuracy, locking, backup, sync, cleanup |
| Install / Deploy / Upgrade | install package, rollout, upgrade, rollback, cluster delivery | fresh install, upgrade path, rollback, deployment consistency |
| Network | weak network, reconnect, DNS, proxy, VPN, long connection | latency, packet loss, disconnect/reconnect, name resolution, network switching |
| Cache | caching, stale data, acceleration, distributed cache | hit/miss, invalidation, consistency, penetration, avalanche, hotspot |
| Async / MQ | queue, job, delayed task, callback, eventual consistency | retry, dead-letter, idempotency, backlog, timeout, concurrency control |
| File Operation | upload, download, preview, file parsing | format, size, naming, integrity, authorization, resume support |
| Third-Party Integration | OAuth, payment, SMS, email, cloud storage, external APIs | happy path, timeout, fallback, callback, version compatibility |
| Search / Filter | query, search box, filter, sorting, pagination | exact/fuzzy match, combined filters, empty result, page correctness |
| Accessibility | government, enterprise, inclusive design, explicit a11y expectation | keyboard navigation, screen reader support, contrast, semantic labels |
| i18n / l10n | multi-language, timezone, currency, locale formatting | translation completeness, formatting, RTL/LTR, special scripts |
| Reliability / DR | HA, failover, cluster, cross-zone, fault tolerance | single-point failure, failover, split-brain, recovery |
| Compliance | privacy, retention, regulated industries | retention, deletion, consent, traceability, policy alignment |
| Documentation Consistency | API docs, user manual, examples, operation handbook | doc behavior match, example validity, terminology consistency |

## How To Apply

### API Dimension

Add when the requirement contains interfaces, callbacks, or service-to-service behavior.

Focus on:

- parameter validity
- status code and response structure
- auth and permission
- pagination / sorting / filtering
- idempotency
- timeout, retry, downgrade, and downstream faults

### UI Dimension

Add when the requirement contains forms, tables, lists, tabs, dialogs, or visible states.

Focus on:

- form validation
- loading / empty / error states
- button disabled/loading/repeat submit behavior
- table/list interactions
- modal and navigation behavior
- keyboard and responsive support when relevant

### CLI Dimension

Add when commands or device-side operations are part of the workflow.

Focus on:

- help and parameter handling
- permissions
- output format
- exit code
- interruption and recovery

### Performance Dimension

Add when scale or response speed matters.

Focus on:

- concurrency
- response baseline
- long-run degradation
- resource pressure

### Security Dimension

Add whenever permissions, identity, data sensitivity, or external trust boundaries exist.

Focus on:

- horizontal and vertical privilege escalation
- direct backend bypass of hidden UI controls
- token and session handling
- sensitive data leakage
- audit logs

### Compatibility Dimension

Add when multi-environment support is expected.

Focus on:

- browsers
- OS versions
- device types
- network environments

### Data Dimension

Add whenever persistence or calculations matter.

Focus on:

- CRUD consistency
- precision
- locking / race behavior
- import/export correctness
- backup and recovery where relevant

### Deployment Dimension

Add when installation, upgrade, or rollout is part of the requirement scope.

### Network Dimension

Add when weak network, reconnect, proxy, VPN, or long-connection behavior can affect outcomes.

### Cache Dimension

Add when stale data or performance relies on cache layers.

### Async Dimension

Add when operations are eventual, queued, delayed, or callback-driven.

### File Dimension

Add when users upload, download, preview, or transform files.

### Third-Party Dimension

Add whenever the system depends on external providers.

### Search And Filter Dimension

Add whenever the interface offers keyword search, filtering, sorting, or pagination.

For every search box, filter field, or keyword query, explicitly check whether the case set covers:

- empty input, whitespace-only input, leading/trailing spaces, and clearing after search
- normal valid keywords from the requirement, such as Chinese, English, numbers, exact match, fuzzy match, and case sensitivity when applicable
- long input and overlong input; if the PRD does not define a max length, write a robustness or `待确认` case instead of inventing a fixed limit
- special characters, punctuation, emoji, mixed-width characters, newline/tab pasted text, and other uncommon input characters
- script-like and SQL-like strings as security-oriented negative input; expected results should assert no execution, no error page, no data leak, and no broken layout
- no-result state, result reset, pagination reset, filter combination behavior, and permission/server-side scope filtering

### Other Specialized Dimensions

Use accessibility, i18n/l10n, reliability/DR, compliance, and documentation consistency when those requirements are explicit or the product context makes them high risk.

## Output Guidance

When specialized dimensions are selected, show them clearly in either:

- a `覆盖维度` section, or
- per-case `测试类型` / `设计方法` / `备注`

Do not hide them as implicit assumptions.
