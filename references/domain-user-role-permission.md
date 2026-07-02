# Domain Scenarios: User / Role / Permission

Use this reference when the requirement involves:

- user management
- role management
- permission management
- admin console
- organization or tenant control
- identity or access control

## Core Coverage Model

Build coverage at minimum across these dimensions:

- actor x page
- actor x action
- role x permission
- user x role binding state
- object state x allowed action

Do not treat permission as a small addon. In this domain it is usually the main risk source.

## User Management Scenarios

Cover when relevant:

- user create success
- required field validation
- duplicate account or identifier
- invalid account format
- edit existing user
- disable or enable user
- delete user
- delete blocked when user has protected dependency
- list / search / filter / pagination
- detail accuracy
- export consistency
- reset password or credential action
- audit trail after create/edit/disable/delete

## Role Management Scenarios

Cover when relevant:

- create role
- duplicate role name
- edit role
- enable or disable role
- delete role
- delete blocked when role is still referenced
- role permission set save and re-open consistency
- role list / search / filter / pagination
- export consistency
- audit trail after role changes

## User-Role Binding Scenarios

Cover when relevant:

- bind one role to one user
- bind multiple roles if supported
- unbind role
- bind forbidden role by insufficient permission
- role change effect timing
- existing session effect after role change
- list/detail/export consistency after binding change

## Permission Enforcement Scenarios

Always separate:

- UI visibility control
- backend enforcement

These are not the same test target.

## State And Lifecycle Scenarios

Cover when relevant:

- active user + active role
- active user + disabled role
- disabled user + active role
- deleted role still referenced by user
- deleted user still present in audit history
- role disabled after assignment

## Consistency Scenarios

Check consistency across:

- list
- detail
- edit form
- export
- audit log
- downstream permission behavior

## Auditability

If the system is admin-facing, check whether these actions are observable:

- who changed what
- before/after values
- when it changed
- whether binding or permission changes are logged

## High-Risk Areas

Raise priority for:

- over-permission
- under-permission on critical admin path
- stale permission after role update
- delete without reference check
- hidden UI but unprotected backend
- batch operations on users or roles
