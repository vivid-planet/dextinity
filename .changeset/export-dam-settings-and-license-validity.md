---
"@dextinity/cms-api": minor
---

Export `DamSettings`, `damSettingsByScope` and `isLicenseValid`

A project that lists its MikroORM entities explicitly needs `DamSettings` in that list. A project that builds its own DAM URLs can read a scope's invalid-license fallback image and check a file's license the way `FilesService` does:

```ts
const settings = await entityManager.findOne(DamSettings, damSettingsByScope(file.scope));
const hasInvalidLicense = damConfig.enableLicenseFeature && file.license ? !isLicenseValid(file.license) : false;
```
