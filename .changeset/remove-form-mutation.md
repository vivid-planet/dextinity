---
"@dextinity/admin": major
---

Remove `FormMutation`

The component had no usages, neither in Dextinity nor in any project, and its render-prop API predates hooks.
Call `useMutation` from `@apollo/client` directly instead.

**Example**

```tsx
// Before
<FormMutation createMutation={createMutation} updateMutation={updateMutation}>
    {({ create, update }, { loading, error }) => <MyForm onCreate={create} onUpdate={update} loading={loading} error={error} />}
</FormMutation>;

// After
const [create, { loading: createLoading, error: createError }] = useMutation(createMutation);
const [update, { loading: updateLoading, error: updateError }] = useMutation(updateMutation);
```
