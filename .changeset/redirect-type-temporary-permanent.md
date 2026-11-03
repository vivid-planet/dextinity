---
"@dextinity/cms-api": minor
"@dextinity/cms-admin": minor
---

Add an optional redirect type to choose between temporary and permanent redirects

Redirects have a new `redirectType` field (`temporary` or `permanent`), which defaults to `temporary` for new and existing redirects.
The site must handle the redirect type, so the setting is hidden in the admin by default. To enable it, first respect the redirect type in the site:

```tsx
const { redirectBySource } = await graphQLFetch(/* query including redirectBySource { target redirectType } */);

if (redirectBySource.redirectType === "permanent") {
    permanentRedirect(destination); // 308
} else {
    redirect(destination); // 307
}
```

Then enable the setting in the admin:

```tsx title="App.tsx"
<DextinityConfigProvider
    redirects={{
        scopeParts: ["domain"],
        enableRedirectType: true,
    }}
>
```

The redirect type only applies to path redirects.
