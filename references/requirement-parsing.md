# Requirement Parsing

Use this reference when converting raw material into a stable testing model.

## Parse In This Order

1. Scope
2. Actors
3. Modules
4. Operations
5. Data fields and rules
6. States and transitions
7. Permissions
8. Integrations and side effects
9. Acceptance criteria
10. Ambiguities and testability gaps

## Extract These Objects

### Scope

Capture:

- business domain
- affected modules
- in-scope behavior
- out-of-scope behavior if stated

### Actors

Capture all user types and system roles:

- end users
- admins
- operators
- auditors
- background jobs
- external systems

For each actor, identify:

- what they can do
- what they can see
- what they cannot do

### Modules

Break the requirement into stable functional areas:

- list / query
- create
- edit
- delete
- detail
- enable / disable
- assign / bind / unbind
- import / export
- permission / approval

Prefer functional grouping over page-by-page fragmentation.

### Operations

For each module, extract actions such as:

- create
- edit
- delete
- submit
- approve
- reject
- assign role
- revoke role
- reset password
- enable user
- disable role

### Data Fields And Rules

For every important field, capture:

- type
- required or optional
- allowed values
- uniqueness
- length or numeric limits
- format rules
- cross-field dependency

### States And Transitions

Look for:

- draft / active / inactive / deleted
- enabled / disabled
- assigned / unassigned
- pending / approved / rejected

Testing becomes much broader once state transitions are explicit.

### Permissions

Extract:

- who can access which page
- who can perform which operation
- who can see which data
- whether the control is front-end only or back-end enforced

For permission-heavy systems, create a coverage matrix:

- actor x page
- actor x action
- actor x resource state

### Integrations And Side Effects

Capture:

- API calls
- notifications
- audit logs
- exports
- imported data
- downstream synchronization

Each side effect is a test target, not just the visible page result.

## Ambiguity Patterns

Flag these early:

- vague success criteria such as "正常" or "正确"
- missing failure behavior
- missing role boundaries
- missing state definitions
- missing uniqueness rules
- missing data ownership rules
- missing post-operation side effects

## Coverage Skeleton

After parsing, build this skeleton before detailed cases:

- module x operation
- operation x actor
- operation x state
- operation x input class
- operation x failure condition

This is the minimum structure needed for broad coverage.

## Special Notes For User / Role / Permission Domains

Always parse these explicitly:

- role creation and edit rules
- role-user binding relations
- deleted or disabled role behavior
- inherited permissions if any
- whether existing users are affected immediately after role change
- whether list/detail/export views reflect permission changes consistently
