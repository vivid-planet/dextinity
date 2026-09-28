---
"@dextinity/cms-admin": minor
---

Add `ActionLogsGrid`

Grid of every action log entry for one entity type, including entries whose entity has since been deleted. Pass the entity's class name; the grid reads the `actionLogs` query and filters by it.

`ActionLogShowVersionDialog` and `actionLogRowFragment` are exported along with it.

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
