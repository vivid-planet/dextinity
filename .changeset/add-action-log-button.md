---
"@dextinity/cms-admin": minor
---

Add `ActionLogButton`

Drop-in button that opens the `ActionLogDialog` and manages its open state internally. The button label defaults to "Action Log" but can be overridden via `children`.

**Example**

```tsx
<ActionLogButton<GQLQuery> id={id} rootField="manufacturer" name={manufacturer.name} />
```
