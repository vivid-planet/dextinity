---
"@dextinity/admin-generator": major
---

Type the `validate` option of form fields according to the field's value

Previously, `validate` was typed as `FieldValidator<unknown>`, so a validator for a concrete type (e.g., `(value: string) => …`) failed to compile with `strictFunctionTypes`.
Now, the validator receives the field's value, which is `null` or `undefined` for an empty field:

| Field type     | Value                                               |
| -------------- | --------------------------------------------------- |
| `text`, `date` | `string \| null \| undefined`                       |
| `number`       | `number \| null \| undefined`                       |
| `numberRange`  | `{ min: number; max: number } \| null \| undefined` |
| `boolean`      | `boolean \| null \| undefined`                      |
| `dateTime`     | `Date \| null \| undefined`                         |
| `staticSelect` | `string \| string[] \| null \| undefined`           |

A validator can't be annotated as final-form's `FieldValidator<… | null | undefined>`, as that type doesn't fit the field components' `FieldValidator`. Use a plain function instead.

`validate` is no longer accepted for `asyncSelect`, `asyncSelectFilter`, `block` and `fileUpload` fields, where it was silently ignored.

**Migration:** Handle empty values in your validators:

```diff
- validate: (value: string) => (value.length < 3 ? "Too short" : undefined),
+ validate: (value?: string | null) => (value && value.length < 3 ? "Too short" : undefined),
```
