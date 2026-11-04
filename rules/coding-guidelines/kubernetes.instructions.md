---
description: CronJob intervals, environments, replicas, resource requests/limits
applyTo: "**/*.yaml,**/*.yml,**/helm/**,**/k8s/**"
paths:
    - "**/*.{yaml,yml}"
    - "**/helm/**"
    - "**/k8s/**"
globs:
    - "**/*.{yaml,yml}"
    - "**/helm/**"
    - "**/k8s/**"
alwaysApply: false
---

# Kubernetes Rules

## CronJobs

- **Minimum interval: 10 minutes.** Shorter crons are not worth it — cold-start overhead dwarfs the resource savings.
- For anything more frequent, deploy a long-running process with reduced resources instead.

## Logging

- Logging has real cost in k8s. Default to warnings/errors; make debug/info/trace toggleable via env var or flag. See also [api-nestjs.instructions.md](api-nestjs.instructions.md#logging).

## Environments

| Env       | Deploy                                 | Lifetime                                    | Notes                                                                       |
| --------- | -------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| `dev`     | Auto from `main`/`master`              | Deleted after 12 h of no deploy (data kept) | Integration canary — if pipeline is red, **nothing** merges except the fix. |
| `test`    | Manual push, no review required        | Deleted after 7 d of no deploy (data kept)  | Internal demos / WIP features.                                              |
| `staging` | Only `main`/`master` may be reset here | Permanent                                   | Customer acceptance; basis for prod.                                        |
| `prod`    | Manual deploy from `staging`           | Permanent                                   | Only cherry-pick commits already on `main`.                                 |

## Replicas

- **Non-prod**: 1 replica — optimize for cost; brief interruptions are acceptable.
- **Prod**: ≥2 replicas — must survive cluster-autoscaler and node upgrades.
- Consequence: every microservice must be **stateless** so multiple replicas can run concurrently.

## Resources (requests / limits)

- Never over-commit memory: `memory.limit == memory.request`.
- Do **not** set a CPU limit below 2 on Node.js services. Node is single-threaded, but the second core lets GC and k8s overhead run off the main thread.
- `cpu.request` = CPU at average load. `memory.request` = RAM at average load + safety margin.

Example:

```yaml
resources:
    requests:
        cpu: 50m
        memory: 512Mi
    limits:
        cpu: 2
        memory: 512Mi
```

- CPU overrun → throttled. Memory overrun → OOM-killed (exit 137). Pods are scheduled based on requests, not limits.
