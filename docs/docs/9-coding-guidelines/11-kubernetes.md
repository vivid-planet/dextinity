---
title: Kubernetes
sidebar_position: -5
---

## CronJobs

Do not create cron jobs with intervals of less than 10 minutes. The resource savings do not apply here, and the overhead for cold starts is too high.

**Alternative:** Deploy a continuous process with fewer resources.

## Logging

Be sparing with unnecessary logging, as it causes significant costs. Enable debug/info/trace logs via flag or environment variable.

## Standard Environments

- **dev:** Auto-deployment from main/master. Mainly serves as an integration test (Does deployment work? Do migrations work? Does the API start?). The pipeline
  must ALWAYS be functional. If the pipeline is red, NOTHING may be merged that does not contribute to fixing the pipeline.
  **Automatically deleted after 12 hours without deployment (data is retained).**

- **test:** For internal tests, demos of unmerged or in-progress features allowed. Pushing without review permitted.
  **Automatically deleted after 7 days without deployment (data is retained).**

- **staging:** For customer acceptance. Serves as the base for future production deployments. Only `master/main` may be reset here (= only reviewed code).
  **Permanently operational (= features can be tested here, demo content maintained, etc.).**

- **prod:** Manual deployment from staging.

## Replicas

**TLDR:** Everything on non-prod runs with one replica; everything on prod runs with at least 2 replicas.

Why? On non-prod, we focus on cost-efficiency, so minor interruptions are not a problem. On prod, everything must be highly available. Cluster auto-scaler events or node upgrades MUST NOT interrupt application availability. Consequence: Every microservice needs to be designed to handle multiple replicas (= stateless).

## Resources

### Request

Amount of memory/CPU guaranteed for your container.

### Limit

Amount of memory/CPU your container cannot exceed.

- Exceed CPU → Process throttled
- Exceed RAM → Process killed, exit code 137 (OOM Killed)

Containers are always scheduled based on the Request.

### Which values for request/limit?

- DO NOT over-commit memory (limit higher than request).
- DO NOT limit CPU (we set 2 because we almost always use NodeJS, which is single-threaded).
- CPU-Request: Used CPU at average load.
- RAM-Request: Used RAM at average load + safety margin.

### Example

```yaml
resources:
    requests:
        cpu: 50m
        memory: 512Mi
    limits:
        cpu: 2
        memory: 512Mi
```

### Why set the CPU Limit to 2 instead of 1?

Previously, we set the cpu limit for our single threaded NodeJS applications to 1. But in kubernetes even single threaded applications
can benefit from more than 1 cpu core. This way processes like garbage collections or kubernetes processes can be offloaded to an additional
core, keeping the main core free for the NodeJS application.

We did some tests and came to the conclusion that a cpu limit of 2 is the sweet spot.
