---
"@dextinity/cms-admin": minor
---

Show the attempts of a job in the jobs grid of the CronJobs module

The status cell now shows, below the status, how many attempts a retried job had, why attempts ended abnormally (e.g. "OOMKilled (exit 137)") and why the job failed (e.g. "Deadline exceeded").

Requires `@dextinity/cms-api` with the new `KubernetesJob.attempts`, `failureReason` and `failureMessage` fields.
