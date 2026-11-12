---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

Show retried and killed attempts of jobs in the CronJobs module

The status cell of the jobs grid now shows, below the status, how many attempts a retried job had, why attempts ended abnormally (e.g. "OOMKilled (exit 137)") and why the job failed (e.g. "Deadline exceeded").

For this, `KubernetesJob` has new fields `attempts` (the Job's Pods with `podName`, `startedAt`, `finishedAt`, `terminationReason` and `exitCode`), `failureReason` and `failureMessage` (from the Job's `Failed` condition, e.g. `BackoffLimitExceeded` or `DeadlineExceeded`).
`kubernetesJobs` loads the Pods of all Jobs of the CronJob with a single request.

The logs returned by `kubernetesJobLogs` are now sorted by attempt, and each attempt's log is wrapped in a header and footer line stating the Pod, when it started and why it ended (e.g. `OOMKilled, exit code 137`).
If the Job failed, the reason of the `Failed` condition is appended.

A Job is no longer reported as `failed` while it waits for a retry.
After a failed attempt, Kubernetes waits for a backoff delay before it retries the Job, and no Pod is active in the meantime.
The Job was reported as `failed` during this delay, so a CronJob or build could be started a second time while the retry was pending.
The Job is now `pending` until it has the `Failed` condition.
