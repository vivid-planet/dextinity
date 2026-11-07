---
"@dextinity/cms-admin": minor
---

Add `LatestWarningsCard` and `LatestBuildsCard` built on `@dextinity/ui`

The cards show the latest open warnings and site builds on an overview page built with `OverviewLayout`. Each warning leads to its source, each build to the publisher.

```tsx
<OverviewLayout title="Good morning, Max">
    <LatestWarningsCard warningsUrl={`${match.url}/system/warnings`} />
    <LatestBuildsCard publisherUrl={`${match.url}/system/publisher`} />
</OverviewLayout>
```
