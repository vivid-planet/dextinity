---
"@dextinity/cms-api": minor
---

Show retried and killed attempts of Kubernetes Jobs

`KubernetesJob` has new fields `attempts` (the Job's Pods with `podName`, `startedAt`, `finishedAt`, `terminationReason` and `exitCode`), `failureReason` and `failureMessage` (from the Job's `Failed` condition, e.g. `BackoffLimitExceeded` or `DeadlineExceeded`).
`kubernetesJobs` loads the Pods of all Jobs of the CronJob with a single request.

The logs returned by `kubernetesJobLogs` are now sorted by attempt, and each attempt's log is wrapped in a header and footer line stating the Pod, when it started and why it ended (e.g. `OOMKilled, exit code 137`).
If the Job failed, the reason of the `Failed` condition is appended.
