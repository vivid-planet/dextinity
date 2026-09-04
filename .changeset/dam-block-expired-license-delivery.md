---
"@dextinity/cms-api": minor
---

Add `blockFilesWithExpiredLicense` option to `DamConfig`

Until now, the license duration of a DAM file was purely informational: expired licenses were surfaced as warnings in the Admin, but the public DAM routes kept delivering the file. Enable `blockFilesWithExpiredLicense` to respond with a 404 for files whose license has expired. It requires `enableLicenseFeature` and defaults to `false`, so delivery is unchanged unless the option is set.

The public routes cache aggressively (1 year for browsers, 1 day for CDNs). Therefore, the cache lifetime of files with a license end date is capped at the expiration date when the option is enabled — otherwise caches would keep serving a file long after its license expired.

**Example**

```ts
DamModule.register({
    damConfig: {
        // ...
        enableLicenseFeature: true,
        blockFilesWithExpiredLicense: true,
    },
});
```
