---
"@dextinity/admin": major
---

Remove the `DisableClearable` type parameter and the `disableClearable` prop from `FinalFormAutocomplete`, `FinalFormAsyncAutocomplete`, `AutocompleteField` and `AsyncAutocompleteField`

These components always replace MUI's clear button with their own `ClearInputAdornment`, which is shown depending on `required`, `disabled` and `readOnly`.
Passing `disableClearable={false}` rendered both clear buttons.

**Migration**

Remove the `DisableClearable` type argument where you pass the type arguments explicitly:

```diff
- <AutocompleteField<Option, false, false, false> ... />
+ <AutocompleteField<Option, false, false> ... />
```

Remove the `disableClearable` prop if you pass it.
