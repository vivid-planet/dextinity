---
"@dextinity/cms-api": minor
"@dextinity/cms-admin": minor
---

Make the invalid-license fallback image opt-in with `enableInvalidLicenseFallbackImage`

A project decides whether images with an invalid license are replaced by a fallback image. While the option is off, which is the default, such images aren't delivered, and the DAM hides its "Settings" action, where the fallback image is chosen.

A project that uses the fallback image since it was added needs to enable it in the API and in the Admin:

```ts
DamModule.register({
    damConfig: {
        enableLicenseFeature: true,
        enableInvalidLicenseFallbackImage: true,
        // ...
    },
});
```

```tsx
<DextinityConfigProvider dam={{ enableLicenseFeature: true, enableInvalidLicenseFallbackImage: true /* ... */ }}>
```
