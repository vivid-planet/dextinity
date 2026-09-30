---
"@dextinity/cms-admin": minor
---

Add `GlobalActionLogPage`

Page that lists the changes to all entities decorated with `@ActionLogs()`, including deleted ones. It shows only the entries the user could also read in the action log of the single entities.

**Example**

```tsx
{
    type: "route",
    primary: <FormattedMessage id="menu.actionLog" defaultMessage="Action Log" />,
    route: {
        path: "/system/action-log",
        component: GlobalActionLogPage,
    },
    requiredPermission: "actionLog",
}
```
