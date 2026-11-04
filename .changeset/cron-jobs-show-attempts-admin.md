---
"@dextinity/cms-admin": minor
---

Show the attempts of a job in the jobs grid of the CronJobs module

The new "Attempts" column shows the number of attempts, whether the job was retried, why an attempt ended abnormally (e.g. "OOMKilled (exit 137)") and why the job failed (e.g. "Deadline exceeded").

Requires `@dextinity/cms-api` with the new `KubernetesJob.attempts`, `failureReason` and `failureMessage` fields.
