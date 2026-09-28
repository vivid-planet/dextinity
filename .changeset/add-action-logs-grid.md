---
"@comet/cms-admin": minor
---

Add `ActionLogsGrid`

Grid of every action log entry for one entity type, including entries whose entity has since been deleted. It reads the top-level entity-scoped query that `ActionLogsModule.forFeature()` generates on the API, so pass that query's name and your app's `GQLQuery` as the generic to have the name checked against the schema.

`ActionLogShowVersionDialog` and `actionLogRowFragment` are exported along with it.

**Example**

```tsx
<StackPage name="action-log" title={intl.formatMessage({ id: "news.actionLog", defaultMessage: "Action Log" })}>
    <StackToolbar scopeIndicator={<ContentScopeIndicator />}>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
    </StackToolbar>
    <ActionLogsGrid<GQLQuery> queryName="newsActionLogs" />
</StackPage>
```
