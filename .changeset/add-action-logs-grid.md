---
"@dextinity/cms-admin": minor
---

Add `ActionLogsGrid`

Grid of every action log entry for one entity type, including entries whose entity has since been deleted. Pass the entity's class name; the grid reads the `actionLogs` query and filters by it.

The grid names each entry's entity by the first non-empty of the snapshot fields `name`, `title`, `label`, `slug` and `description`. Pass `getDisplayName` when the entity is named differently.

`ActionLogShowVersionDialog` and its `actionLogShowVersionDialogFragment` are exported along with it.

**Example**

```tsx
<StackPage name="action-log" title={intl.formatMessage({ id: "news.actionLog", defaultMessage: "Action Log" })}>
    <StackToolbar scopeIndicator={<ContentScopeIndicator />}>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
    </StackToolbar>
    <ActionLogsGrid entity="News" />
</StackPage>
```

```tsx
<ActionLogsGrid entity="Customer" getDisplayName={(snapshot) => `${snapshot.firstName} ${snapshot.lastName}`} />
```
