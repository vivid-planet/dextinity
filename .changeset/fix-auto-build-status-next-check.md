---
"@dextinity/cms-api": patch
---

Fix `autoBuildStatus` reporting the wrong `nextCheck`/`lastCheck` when multiple builder cron jobs are allowed for a user

`getAutoBuildStatus` only looked at the first allowed builder cron job, so editors with access to several scopes could see a `nextCheck` time that had nothing to do with the cron job that would actually run next. It now takes the earliest `nextCheck` and the most recent `lastCheck` across all allowed cron jobs.
