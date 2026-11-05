---
"@dextinity/cms-api": patch
---

Don't report a Kubernetes Job as failed while it waits for a retry

After a failed attempt, Kubernetes waits for a backoff delay before it retries the Job, and no Pod is active in the meantime.
The Job was reported as `failed` during this delay, so a CronJob or build could be started a second time while the retry was pending.
The Job is now `pending` until it has the `Failed` condition.
