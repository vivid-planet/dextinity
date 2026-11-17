---
"@dextinity/cms-admin": minor
---

Add components to show the action log

- `ActionLogButton` opens the versions of a single entity and compares two of them
- `ActionLogsGrid` lists every entry of one entity type, including the entries of deleted entities
- `GlobalActionLogPage` lists the entries of all logged entities. A row action opens the versions of the entity of that row, across all scopes the user may read

**Example**

```tsx
<ActionLogButton entity="Product" entityId={id} name={product.title} />
<ActionLogsGrid entity="Product" />
```

`ActionLogsGrid` names each entry by the first non-empty of the snapshot fields `name`, `title`, `label`, `slug` and `description`. Pass `getDisplayName` when the entity is named differently:

```tsx
<ActionLogsGrid entity="Customer" getDisplayName={(snapshot) => `${snapshot.firstName} ${snapshot.lastName}`} />
```

Add `GlobalActionLogPage` to the master menu. It requires the `actionLog` permission:

```tsx
{
    type: "route",
    primary: <FormattedMessage id="menu.actionLog" defaultMessage="Action Log" />,
    route: {
        path: "/system/action-log",
        element: <GlobalActionLogPage />,
    },
    requiredPermission: "actionLog",
}
```
