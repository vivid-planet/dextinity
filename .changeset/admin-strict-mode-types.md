---
"@dextinity/admin": major
---

Change the event type of `onOpen` and `onClose` in `AsyncOptionsProps` from `ChangeEvent` to `SyntheticEvent`

MUI's `Select` and `Autocomplete` call these handlers with a `SyntheticEvent`, so the previous type didn't match how they are called and couldn't be passed to MUI in TypeScript strict mode.
This affects the props returned by `useAsyncOptionsProps` and `useAsyncAutocompleteOptionsProps`.

**Migration**

If you implement these handlers yourself, type the event as `SyntheticEvent`:

```diff
- const onOpen = (event: ChangeEvent) => { ... };
+ const onOpen = (event: SyntheticEvent) => { ... };
```
