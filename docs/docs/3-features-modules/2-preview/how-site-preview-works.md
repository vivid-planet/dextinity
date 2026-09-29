---
title: How Site Preview Works
---

The Site Preview lets editors view unpublished content on the real site, including pages in any visibility state and optionally invisible blocks. This page explains the technical flow end to end.

## Overview

The Site Preview is accessed through a dedicated URL on the **preview domain** (a separate hostname used only for preview, e.g. `preview.example.com`). The flow has three main phases:

1. **JWT generation** – the admin generates a short-lived token containing the scope, user identity and preview settings.
2. **Cookie handshake** – the `/site-preview` route on the site validates the JWT, stores the preview parameters in a cookie, and redirects to the requested path.
3. **Preview rendering** – subsequent requests read the cookie to determine the scope and preview settings and render the page in draft mode.

## Step-by-Step Flow

### 1. Admin Generates a JWT

When an editor opens the Site Preview in the admin UI, the `SitePreview` component executes the `sitePreviewJwt` GraphQL query on the API:

```graphql
query SitePreviewJwt($scope: JSONObject!, $path: String!, $includeInvisible: Boolean!) {
    sitePreviewJwt(scope: $scope, path: $path, includeInvisible: $includeInvisible)
}
```

The `SitePreviewResolver` (in `@dextinity/cms-api`) signs a short-lived JWT (valid for 10 seconds) using a shared secret (`SITE_PREVIEW_SECRET`). The token payload contains:

| Field                        | Description                                    |
| ---------------------------- | ---------------------------------------------- |
| `scope`                      | The content scope (e.g. `{ domain, language }`) |
| `path`                       | The path the preview should open at (e.g. `/`) |
| `userId`                     | The ID of the currently logged-in editor        |
| `previewData.includeInvisible` | Whether invisible blocks should be shown       |

### 2. Admin Navigates the IFrame to the `/site-preview` Route

The admin opens an `<iframe>` pointed at:

```
https://<preview-domain>/site-preview?jwt=<token>
```

The path used for `sitePreviewApiUrl` defaults to `{siteConfig.url}/site-preview` but can be overridden in the site config.

:::info

The `/site-preview` route must be on its own domain (the preview domain) when deployed. This is because the cookie set in the next step is scoped to that domain.

:::

### 3. `/site-preview` Route Validates the JWT and Sets a Cookie

The site exposes a `/site-preview` route that handles the handshake. With the App Router (Next.js), this is a route handler that calls `sitePreviewRoute` from `@dextinity/site-nextjs`:

```ts title="app/site-preview/route.ts"
import { sitePreviewRoute } from "@dextinity/site-nextjs/server";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    return sitePreviewRoute(request);
}
```

`sitePreviewRoute` performs the following:

1. Reads the `jwt` query parameter.
2. Verifies the JWT signature using `SITE_PREVIEW_SECRET`.
3. Stores the preview parameters (scope, preview data, user ID) in an `HttpOnly` cookie named `__dextinity_site_preview` as a new, longer-lived JWT (valid for 1 day).
4. Enables [Next.js Draft Mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode).
5. Redirects to the `path` contained in the JWT.

### 4. Site Reads the Cookie to Determine the Scope

After the redirect, the normal site rendering pipeline runs. The middleware calls `getSiteConfigForHost`, which internally calls `previewParams()` from `@dextinity/site-nextjs/server`:

```ts
// Simplified version of getSiteConfigForHost
export async function getSiteConfigForHost(host: string) {
    const sitePreviewParams = await previewParams({ skipDraftModeCheck: true });
    if (sitePreviewParams?.scope) {
        return getSiteConfigs().find(
            (siteConfig) => siteConfig.scope.domain === sitePreviewParams.scope.domain,
        );
    }
    // fall back to matching by hostname
    return getSiteConfigs().find(
        (siteConfig) => siteConfig.domains.main === host || siteConfig.domains.preliminary === host,
    );
}
```

`previewParams()` reads and verifies the `__dextinity_site_preview` cookie and returns the `{ scope, previewData }` stored during the handshake. This is how a single preview domain can serve previews for multiple sites/scopes without any URL-based routing.

### 5. Site Renders in Preview Mode

Because Next.js Draft Mode was enabled in step 3, `draftMode().isEnabled` is `true` for every request that carries the session cookie. The layout wraps the page in `SitePreviewProvider`:

```tsx title="app/[visibility]/[domain]/layout.tsx"
const isDraftModeEnabled = (await draftMode()).isEnabled;

return (
    <SiteConfigProvider siteConfig={siteConfig}>
        {isDraftModeEnabled ? <SitePreviewProvider>{children}</SitePreviewProvider> : children}
    </SiteConfigProvider>
);
```

`SitePreviewProvider` sets the `previewType` context to `"SitePreview"` (used by `usePreview()` in block components) and sends location messages back to the admin iframe bridge so the admin UI can track navigation within the preview.

### 6. API Requests Include Invisible Content

When the site makes GraphQL requests to the API it passes the `x-include-invisible-content` header, constructed from `previewData`. Unpublished pages are always included when preview data is present. The `includeInvisible` flag from the JWT controls whether invisible blocks are also included. See [Content Visibility](/docs/core-concepts/content-visibility) for details.

## Architecture Diagram

```
Admin UI
  │
  │  sitePreviewJwt GraphQL query
  ▼
API (SitePreviewResolver)
  │  Signs JWT { scope, path, userId, previewData } — valid 10 s
  ▼
Admin opens iframe:
  https://<preview-domain>/site-preview?jwt=<token>
  │
  ▼
Site /site-preview route (sitePreviewRoute)
  │  Verifies JWT
  │  Sets __dextinity_site_preview cookie { scope, previewData, userId } — valid 1 day
  │  Enables Next.js Draft Mode
  │  Redirects to <path>
  ▼
Site <path> (e.g. /)
  │  middleware: getSiteConfigForHost → previewParams() reads cookie → resolves scope
  │  layout: SitePreviewProvider wraps children (Draft Mode is active)
  │  GraphQL requests include x-include-invisible-content header
  ▼
Editor sees unpublished / invisible content in the iframe
```

## Security Considerations

- The initial JWT is valid for only **10 seconds** to limit the window for replay attacks. The `__dextinity_site_preview` cookie JWT is valid for **1 day**, matching the editor's working session.
- The cookie is `HttpOnly` and `SameSite=Lax` to prevent access from JavaScript and limit CSRF exposure.
- The `/site-preview` route validates that the redirect path is a relative path (starts with `/` and not `//`) to prevent open redirect vulnerabilities.
- The `SITE_PREVIEW_SECRET` must be kept confidential and should be a strong random value. It is shared between the API and the site.

## Environment Variables

| Variable              | Service | Description                                           |
| --------------------- | ------- | ----------------------------------------------------- |
| `SITE_PREVIEW_SECRET` | API     | Secret used to sign site-preview JWTs                 |
| `SITE_PREVIEW_SECRET` | Site    | Same secret, used to verify the JWTs on the site side |
| `PREVIEW_DOMAIN`      | Site    | Hostname of the preview domain                        |
