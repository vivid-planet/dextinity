---
"@dextinity/cms-admin": major
---

Remove the MUI dashboard widgets in favor of `OverviewLayout` and the overview cards

`DashboardHeader`, `DashboardWidgetRoot`, `LatestBuildsDashboardWidget`, `LatestWarningsDashboardWidget` and `LatestContentUpdatesDashboardWidget` are removed. Build the dashboard with `OverviewLayout` of `@dextinity/ui`, which brings the greeting header, and use `LatestWarningsCard` and `LatestBuildsCard` for warnings and builds. A list of recently edited content becomes a `Card` with a `CardRow` per entry.

```tsx
<OverviewLayout title="Good morning, Max">
    <LatestWarningsCard warningsUrl={`${match.url}/system/warnings`} />
    <LatestBuildsCard publisherUrl={`${match.url}/system/publisher`} />
</OverviewLayout>
```
