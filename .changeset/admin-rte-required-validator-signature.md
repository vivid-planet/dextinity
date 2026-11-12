---
"@dextinity/admin-rte": major
---

Change the type of `requiredValidator` to accept only the field value

`requiredValidator` was typed as `FieldValidator<string | RawDraftContentState | undefined>`.
With `strictFunctionTypes`, that type can't be assigned to the `validate` prop of a field whose value is only `string` or only `RawDraftContentState`.
It now is a plain function that only takes the value, so it can be passed to the `validate` prop of any of these fields.

If you call `requiredValidator` directly with `allValues` or `meta`, pass only the value:

```diff
- const error = requiredValidator(value, allValues);
+ const error = requiredValidator(value);
```
