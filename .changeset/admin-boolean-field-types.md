---
"@dextinity/admin": major
---

Type the value of `CheckboxField`, `SwitchField`, `FinalFormCheckbox` and `FinalFormSwitch` as `boolean` instead of `string`

These fields hold a `boolean` in the form, so validators and `parse`/`format` functions typed for `boolean` couldn't be passed to them.

**Migration**

Retype validators and `parse`/`format` functions on these fields from `string` to `boolean`:

```diff
- <CheckboxField name="inStock" validate={(value: string) => ...} />
+ <CheckboxField name="inStock" validate={(value: boolean) => ...} />
```
