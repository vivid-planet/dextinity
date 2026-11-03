---
"@dextinity/cms-api": minor
"@dextinity/cms-admin": minor
---

Make blocking files with an invalid license opt-in with `blockFilesWithInvalidLicense`

A project decides whether files whose license has expired or isn't valid yet are blocked. While the option is off, which is the default, such files are delivered as before blocking was added: their URLs don't answer `410 Gone`, blocks don't hide them or replace them with the fallback image, and the DAM hides its "Settings" action, where the fallback image is chosen.

A project that blocks such files since blocking was added needs to enable the option in the API and in the Admin:

```ts
DamModule.register({
    damConfig: {
        enableLicenseFeature: true,
        blockFilesWithInvalidLicense: true,
        // ...
    },
});
```

```tsx
<DextinityConfigProvider dam={{ enableLicenseFeature: true, blockFilesWithInvalidLicense: true /* ... */ }}>
```
