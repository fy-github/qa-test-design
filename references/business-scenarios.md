# Reusable Business Scenarios

Use these as broad coverage supplements after method-based design.

## List / Table

Cover when relevant:

- empty list
- default sorting
- changed sorting
- filter combination
- search hit / no hit
- pagination
- cross-page selection
- large data volume
- export consistency
- permission-based row actions

## Form / Input

Cover when relevant:

- required fields
- format validation
- uniqueness
- boundary length
- special characters
- pure whitespace
- invalid dependency combinations
- edit mode data echo
- save then re-open consistency

## Button / Submit

Cover when relevant:

- disabled state
- loading state
- repeated click
- weak network repeated submit
- submit success
- submit failure
- cancel with confirmation

## Role / Permission

Cover when relevant:

- page visibility by role
- action button visibility by role
- backend rejection when frontend control is bypassed
- role change effect timing
- inherited or combined permission rules
- removed / disabled role impact on bound users

## State Management

Cover when relevant:

- enable / disable
- deleted but referenced
- referenced but locked
- draft / active / inactive transitions
- state shown consistently in list, detail, export, and downstream view

## Import / Export

Cover when relevant:

- correct template
- wrong template
- partial valid data
- duplicate data
- oversized file
- unsupported format
- exported content matches filtered list

## Detail / Read-Only View

Cover when relevant:

- field completeness
- data echo accuracy
- hidden field rules
- long text
- empty field placeholders
- audit information

## Calculation / Statistics

Cover when relevant:

- precision
- rounding
- zero values
- negative or prohibited values
- state-based inclusion rules
- list total vs summary total consistency

## Integration / Side Effect

Cover when relevant:

- notification sent or not sent
- audit log written
- async job triggered
- downstream sync success
- downstream sync failure handling
- retry or compensation path
