---
title: Working with cookies 🍪
---

Third-party cookies might be set when embedding external content, e.g., YouTube Videos or Google Maps.
To comply with GDPR, the user must consent to these cookies before the content is loaded.

By configuring the cookie API and using the `<CookieSafe />` component, we can ensure that content is only loaded once the user has consented to the required cookies.

## Cookie APIs

The `useCookieApi` hook provides access to the list of consented cookies and a function that can be called to open the cookie settings.

```ts
import { useCookieApi } from "@dextinity/site-nextjs";

const { consentedCookies, openCookieSettings } = useCookieApi();
```

### Existing hooks for cookie platforms

Hooks for some cookie platforms are already implemented:

- `useOneTrustCookieApi` for [OneTrust](https://www.onetrust.com/)
- `useCookieBotCookieApi` for [CookieBot](https://www.cookiebot.com/)
- `useLocalStorageCookieApi` This should never be used in production, only for local development and other environments that cannot embed the real cookie platform.

For other platforms, a custom hook can be created. It must have the type of `CookieApiHook`.

### LocalStorage Cookie Api

For local development and other environments that do not embed the project's cookie platform, the `useLocalStorageCookieApi` hook can be used.

#### Debugging using the dev tools console

The localStorage cookie api can be accessed via the dev tools console with `window.dextinityLocalStorageCookieApi`.

##### Open Cookie Settings

```js
window.dextinityLocalStorageCookieApi.openCookieSettings();
```

##### View the currently consented cookies

```js
window.dextinityLocalStorageCookieApi.consentedCookies;
```

## Using the `<CookieSafe />` component

The `<CookieSafe />` component should wrap content that loads third-party cookies.
If the required cookies have not been consented to, a fallback component is rendered instead of the children.
While the cookie platform has not been initialized, a loading component is rendered.

```tsx
import { CookieSafe, useCookieApi } from "@dextinity/site-nextjs";
import { cookieIds } from "@src/util/cookieIds";

export const CookieSafeExternalContent = () => {
    const { consentedCookies } = useCookieApi();

    return (
        <CookieSafe
            consented={consentedCookies.includes(cookieIds.thirdParty)}
            loading={<CookieLoading />}
            fallback={<CookieFallback />}
        >
            <ComponentThatLoadsExternalContent />
        </CookieSafe>
    );
};
```

### Fallback component

The fallback component should display a message to the user and allow them to open the cookie settings.

```tsx
import { useCookieApi } from "@dextinity/site-nextjs";

export const CookieFallback = () => {
    const { openCookieSettings } = useCookieApi();
    return (
        <>
            <p>Cookies need to be accepted to view this content.</p>
            <button onClick={() => openCookieSettings()}>Open Cookie Settings</button>
        </>
    );
};
```

### Loading component

The loading component should be a placeholder for when it is unclear if the necessary cookies have been consented to.

```tsx
export const CookieLoading = () => {
    return <p>Loading...</p>;
};
```

## Configuration

### Wrap your application with the `CookieProvider` component

The `CookieProvider` component should wrap the entire application to provide the cookie API to all components.
Pass the cookie API hook depending on the current environment.

For example, the `useLocalStorageCookieApi` hook is used for development, and the `useOneTrustCookieApi` hook is used for production.

E.g., `site/src/app/layout.tsx`

```tsx
import {
    CookieApiProvider,
    useLocalStorageCookieApi,
    useOneTrustCookieApi as useProductionCookieApi,
} from "@dextinity/site-nextjs";
// ...
return (
    <html>
        <body>
            <CookieApiProvider
                api={
                    process.env.NODE_ENV === "development"
                        ? useLocalStorageCookieApi
                        : useProductionCookieApi
                }
            >
                {children}
            </CookieApiProvider>
        </body>
    </html>
);
```

### Store the available cookie IDs in a common file for easy access

These IDs should be provided by the application's cookie platform, e.g., OneTrust or CookieBot.

E.g., `site/src/util/cookieIds.ts`

```ts
export const cookieIds = {
    thirdParty: "THIRD_PARTY",
    analytics: "ANALYTICS",
};
```
