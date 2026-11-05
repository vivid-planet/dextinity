---
"@dextinity/cms-admin": patch
---

Show an error inside `LatestBuildsDashboardWidget` when the builds can't be loaded

Previously, a failing `builds` query replaced the whole dashboard with an error and opened the global error dialog. On deployments without Kubernetes, where the query is always forbidden, the dialog wrongly reported an expired login session.
