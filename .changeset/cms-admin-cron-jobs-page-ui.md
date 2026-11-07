---
"@dextinity/cms-admin": major
---

Build `CronJobsPage` with the `ListDetailLayout` of `@dextinity/ui`

A click on a cron job opens its runs in a side panel next to the list, and a run opens its logs in a `LogViewer` that follows the output of a running job. A cron job is started from its row or from the panel after a confirmation. The URLs of the runs (`<cron job>/jobs`) and the logs (`<cron job>/jobs/<job>/logs`) stay the same.

The page no longer renders a `Stack`, so it doesn't add a breadcrumb to a surrounding `Stack` anymore.
