---
"@dextinity/admin-rte": patch
---

Type `requiredValidator` and `ControlButton`'s `onButtonClick` more precisely

`requiredValidator` is now generic over the field value. `FieldValidator` is invariant in it, so the previous single instantiation could not be passed to a `string`-valued `Field`.

`ControlButton` receives its `onButtonClick` handler with a `MouseEvent<HTMLButtonElement>`, matching the `button` element the handler is attached to.
