---
"@dextinity/eslint-config": major
---

Enable `@typescript-eslint/no-floating-promises` rule

Unhandled promises are a common source of bugs, for instance, a missing `await` before `flush()` in a service.
The rule reports promises that are neither awaited, returned, nor handled with `.catch()`.
Mark intentional fire-and-forget calls with the `void` operator:

```ts
void refetch();
```
