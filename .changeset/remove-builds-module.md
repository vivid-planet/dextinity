---
"@dextinity/cms-admin": major
"@dextinity/cms-api": major
---

Remove the `BuildsModule` and the other features for static site generation

Projects no longer generate their sites statically, so builds of the site aren't needed anymore.

The following exports are removed:

- API: `BuildsModule`, `BuildsResolver`, `BuildsService`, `AutoBuildStatus`, `ChangesSinceLastBuild`, `SkipBuild`, `SKIP_BUILD_METADATA_KEY`, `BUILDS_CONFIG` and `BUILDS_MODULE_OPTIONS`
- Admin: `BuildEntry`, `PublisherPage` and `LatestBuildsDashboardWidget`

The `check-changes` console command and the `builds` permission are removed as well.
A migration drops the `ChangesSinceLastBuild` table.

**Migrating**

Remove the usages of the exports above, the `check-changes` CronJob and the builder CronJobs from your deployment.
Remove the `builds` permission from your permission assignments.

The cron jobs and jobs now check the content scope of a CronJob against the `cronJobs` permission instead of the `builds` permission.
Users that should see the CronJobs of a content scope need the `cronJobs` permission for it.
