---
"@dextinity/cms-admin": minor
---

Support optional values in `createCompositeBlockSelectField`

Set `defaultValue` to `undefined` for a single select whose block field is nullable. The user can then clear the select:

```tsx
badgeColor: {
    block: createCompositeBlockSelectField<MyBlockData["badgeColor"]>({
        label: <FormattedMessage id="myBlock.badgeColor" defaultMessage="Badge color" />,
        defaultValue: undefined,
        options: badgeColorOptions,
    }),
},
```
