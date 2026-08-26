---
title: Cron Jobs
---

Cron Jobs are defined as [console commands](../console-commands). The preferred way to run them is as a [Kubernetes CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/). Advantages of using Kubernetes Cron Jobs:

- You can run multiple instances of the API in parallel without additional configuration for Cron Jobs.
- Different resources can be used for Cron Jobs and the API.
- You don't have to worry about blocking the API event loop.

## Best Practices

- Test your Cron Job locally with the specified memory resource request.

```bash
NODE_OPTIONS='--max-old-space-size=256' npm run console demo-command
```

- If you're using Kubernetes, avoid running a Cron Job every minute, as this will create a lot of overhead.

- Don't run every Cron Job simultaneously (e.g. always on the first minute of an hour), as this might create a considerable load on all involved systems.

- If you need alerting, consider using a Heartbeat monitor.

- Ensure that your Cron Job allows repeated runs so manual runs are possible.

## Cron Job Module

If Kubernetes Cron Jobs are used, Dextinity can help you manage them.

### API

A `CronJobModule` is available for `@dextinity/cms-api` which adds GraphQL queries and mutations for interacting with Cron Jobs. The `CronJobModule`requires the `KubernetesModule` to be included.

:::caution
If including the Cron Job module, ensure you have proper access control in place as this module allows interacting with the Kubernetes API.
:::

### Admin

A `CronJobsPage` is available for `@dextinity/cms-admin` to display and manage Cron Jobs.

### Scoping

The Cron Job Module respects the [Kubernetes annotation](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/) `dextinity.com/content-scope` and will only allow access to the Cron Job if the user can access the specified content scope.

```yaml
…
metadata:
    annotations:
        dextinity.com/content-scope: "{ \"domain\": \"main\", \"language\": \"en\" }"
…
```

### Labeling

Cron Jobs and Jobs can be given a human-readable label using the [Kubernetes annotation](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/) `dextinity.com/label`.

```yaml
…
metadata:
    annotations:
        dextinity.com/label: "Demo Cron Job"
…
```

### Legacy `comet-dxp.com` labels and annotations

All labels and annotations read by Dextinity use the `dextinity.com` prefix.
The former `comet-dxp.com` prefix (for instance, `comet-dxp.com/content-scope`) is still supported, so existing Helm charts keep working.
Resources are expected to use one prefix or the other: if no resource matches the `dextinity.com` labels, the `comet-dxp.com` ones are used instead.
