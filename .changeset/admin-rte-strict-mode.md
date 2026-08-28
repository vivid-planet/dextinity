---
"@dextinity/admin-rte": patch
---

Type `requiredValidator` and `ControlButton`'s `onButtonClick` more precisely

`requiredValidator` is no longer declared as a `FieldValidator`. Its optional `meta` parameter made the type invariant in the field value, which kept the validator from being used for a `string`-valued field.

`ControlButton` receives its `onButtonClick` handler with a `MouseEvent<HTMLButtonElement>`, matching the `button` element the handler is attached to.
