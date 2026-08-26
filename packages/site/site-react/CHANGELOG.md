# @comet/site-react

## 10.1.0

## 10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/site-react` to `@dextinity/site-react`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename the `cometType` property of iframe messages to `dextinityType`. A matching `@dextinity/cms-admin` version is required
    - Rename the window property of `useLocalStorageCookieApi` from `window.cometLocalStorageCookieApi` to `window.dextinityLocalStorageCookieApi` and its localStorage key from `comet-dev-cookie-api-consented-cookies` to `dextinity-dev-cookie-api-consented-cookies`. Previously consented cookies are therefore reset in local development

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/site-react` to `@dextinity/site-react`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename the `cometType` property of iframe messages to `dextinityType`. A matching `@dextinity/cms-admin` version is required
    - Rename the window property of `useLocalStorageCookieApi` from `window.cometLocalStorageCookieApi` to `window.dextinityLocalStorageCookieApi` and its localStorage key from `comet-dev-cookie-api-consented-cookies` to `dextinity-dev-cookie-api-consented-cookies`. Previously consented cookies are therefore reset in local development

## 9.5.0

## 9.4.0

## 9.3.0

### Minor Changes

- 924b66c: Add `underline` support to `createTipTapRichTextBlock`

    The `underline` inline style is now part of the `supports` list and can be toggled via a new toolbar button. The underline mark is validated by the API, rendered as `<u>` by `renderTipTapRichText`, and the DraftJS migration maps the `UNDERLINE` inline style to it when supported. Per default it is disabled, pass a `supports` list with `underline` to enable it.

## 9.2.2

## 9.2.1

### Patch Changes

- 94a1d58: Fix client-side crash in `useCookieBotCookieApi` when Cookiebot is not yet initialized

    The hook read `window.Cookiebot.consent` in its initial call, but `window.Cookiebot` exists as soon as the Cookiebot script has run, while `consent` is only populated once Cookiebot fires `CookiebotOnConsentReady`. Calling `Object.keys(consent)` before that threw `TypeError: Cannot convert undefined or null to object`, crashing the client. The initial call is now a no-op until consent is available.

## 9.2.0

### Minor Changes

- ee0bf93: Add AI content disclosure for DAM assets (EU AI Act, Article 50)

    Editors can mark a DAM asset as **AI generated** or **AI modified** in the file settings. When such an asset is published, the site renders the official EU AI-content label and merges the disclosure into the media element's accessible name, so screen-reader users learn which asset is AI.

    **API**

    New `aiContentType` field (`Generated` | `Modified`) on DAM files, exposed through the `PixelImage` and `DamVideo` blocks.

    **Admin**

    New "AI content" field in the DAM file settings, shown for image, video and audio assets only (other file types cannot constitute a deep fake).

    **Site**

    `PixelImageBlock` and `DamVideoBlock` render the disclosure automatically for marked assets. Both accept props to customize it:
    - `aiContentDisclosureProps` — override the badge.
    - `customAiContentDisclosure` — render your own disclosure, or `null` for none.
    - `aiContentAltTextPrefixLabels` — localize the accessible-name prefix (defaults to English).

    `@comet/site-react` also exports the `AiContentDisclosure` badge and the `getAiContentAltTextWithPrefix` helper.

## 9.1.1

## 9.1.0

## 9.0.1

## 9.0.0

### Major Changes

- 8b3932d: Move server-only exports to `/server` subpath

    Server-only exports have been moved to a separate `/server` entry point to prevent server-only code from being pulled into client bundles. While tree-shaking previously removed unused server code, this is an optional optimization — Vite's dev server, for example, does not tree-shake, causing errors when importing these packages in non-server environments (e.g., Storybook).

    **`@comet/site-nextjs`**: `sitePreviewRoute`, `legacyPagesRouterSitePreviewApiHandler`, `previewParams`, `legacyPagesRouterPreviewParams`, and `persistedQueryRoute` must now be imported from `@comet/site-nextjs/server`:

    ```diff
    - import { sitePreviewRoute } from "@comet/site-nextjs";
    + import { sitePreviewRoute } from "@comet/site-nextjs/server";
    ```

    ```diff
    - import { previewParams } from "@comet/site-nextjs";
    + import { previewParams } from "@comet/site-nextjs/server";
    ```

    ```diff
    - import { persistedQueryRoute } from "@comet/site-nextjs";
    + import { persistedQueryRoute } from "@comet/site-nextjs/server";
    ```

    **`@comet/site-react`**: `persistedQueryRoute` must now be imported from `@comet/site-react/server`:

    ```diff
    - import { persistedQueryRoute } from "@comet/site-react";
    + import { persistedQueryRoute } from "@comet/site-react/server";
    ```

### Minor Changes

- ab5e547: Add `JsonLd` component for typed schema.org structured data

    Renders any [`schema-dts`](https://www.npmjs.com/package/schema-dts) entity inside a `<script type="application/ld+json">` tag. The payload is escaped so a `</script>` sequence in user content cannot break out of the script tag.

    ```tsx
    import { JsonLd } from "@comet/site-react";
    import type { Organization } from "schema-dts";

    <JsonLd<Organization>
        data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Acme",
            url: "https://acme.example",
            logo: "https://acme.example/logo.png",
        }}
    />;
    ```

    Also re-exported from `@comet/site-nextjs`.

- 4c1aeb2: Add `noFollow` option to `ExternalLinkBlock`

    Editors can now mark an external link as `nofollow` via a new checkbox in the admin form. When enabled, the rendered `<a>` tag receives `rel="nofollow"`. Existing links are unaffected by an automatic block-data migration that sets `noFollow` to `false`.

- 54f57dd: Support loading data for child blocks embedded in rich text content in `recursivelyLoadBlockData`

    Child blocks embedded in a `createTipTapRichTextBlock` rich text block (stored as `cmsBlock`/`cmsInlineBlock` nodes) are now traversed by `recursivelyLoadBlockData`, so their registered block loaders run just like for any other nested block. This allows rich text child blocks to load additional data (e.g. via a GraphQL query) without relying on a `BlockTransformerService` on the API side.

    To support this, the `tipTapContent` field of a `createTipTapRichTextBlock` block is now declared with a dedicated `TipTapRichTextBlock` block meta kind (instead of `Json`) that carries the configured child blocks. The block loader uses this kind to detect rich text content instead of inspecting arbitrary `Json` fields.

    Also re-exported from `@comet/site-nextjs`.

- 740dba8: Add support for React 19

### Patch Changes

- cfa70a2: Fix preview-image to playback transition in video blocks
    - `DamVideoBlock`: clicking the preview image's play button now starts video playback. Previously, the click dismissed the preview but the browser's autoplay policy blocked playback of videos with sound because the gesture happened on the preview image rather than the `<video>` element. Playback is now triggered explicitly inside the ref callback to stay within the user gesture window.
    - `YouTubeVideoBlock` / `VimeoVideoBlock`: when the preview image is dismissed, `isPlaying` is now set to `true` so `PlayPauseButton` shows the correct icon, and the playback is flagged as manually handled so the viewport handler does not immediately pause the video.

- 4f018d5: Fix `VimeoVideoBlock` not autoplaying on initial page load when `autoplay` is enabled and no `previewImage` is set

    Without a `previewImage`, the iframe URL was missing `autoplay=1` and playback relied on a `postMessage("play")` fired from the `IntersectionObserver` callback. That message raced against the Vimeo player's initialization inside the iframe — when it arrived first the message was dropped and the video stayed paused, while the `PlayPauseButton` optimistically showed the "Pause" state, requiring two clicks to recover. `autoplay=1` is now appended whenever `autoplay` is enabled so Vimeo handles autoplay natively. The existing `muted=1` param satisfies the browser autoplay policy.

    The iframe is also marked with `loading="lazy"` so blocks far below the fold don't request the Vimeo player upfront.

- d870d05: Fix Cookiebot consent initialization

    Fix a race condition where the `CookiebotOnConsentReady` event fires before the `useCookieBotCookieApi` hook is mounted.

- e125c84: Use `OnetrustActiveGroups` instead of `ConsentIntegrationData` in `useOneTrustCookieApi`

    `ConsentIntegrationData` is used for OneTrust's internal logging and can be `null`, which caused `useOneTrustCookieApi` to crash. As recommended by OneTrust support, `window.OnetrustActiveGroups` is used instead, as it is always available when the consent banner is implemented.

- 865fcfd: Remove legacy CJS fields (`module`, `types`) from package.json as these packages are ESM-only

## 9.0.0-beta.6

### Minor Changes

- 4c1aeb2: Add `noFollow` option to `ExternalLinkBlock`

    Editors can now mark an external link as `nofollow` via a new checkbox in the admin form. When enabled, the rendered `<a>` tag receives `rel="nofollow"`. Existing links are unaffected by an automatic block-data migration that sets `noFollow` to `false`.

### Patch Changes

- d870d05: Fix Cookiebot consent initialization

    Fix a race condition where the `CookiebotOnConsentReady` event fires before the `useCookieBotCookieApi` hook is mounted.

## 9.0.0-beta.5

### Patch Changes

- cfa70a2: Fix preview-image to playback transition in video blocks
    - `DamVideoBlock`: clicking the preview image's play button now starts video playback. Previously, the click dismissed the preview but the browser's autoplay policy blocked playback of videos with sound because the gesture happened on the preview image rather than the `<video>` element. Playback is now triggered explicitly inside the ref callback to stay within the user gesture window.
    - `YouTubeVideoBlock` / `VimeoVideoBlock`: when the preview image is dismissed, `isPlaying` is now set to `true` so `PlayPauseButton` shows the correct icon, and the playback is flagged as manually handled so the viewport handler does not immediately pause the video.

- 4f018d5: Fix `VimeoVideoBlock` not autoplaying on initial page load when `autoplay` is enabled and no `previewImage` is set

    Without a `previewImage`, the iframe URL was missing `autoplay=1` and playback relied on a `postMessage("play")` fired from the `IntersectionObserver` callback. That message raced against the Vimeo player's initialization inside the iframe — when it arrived first the message was dropped and the video stayed paused, while the `PlayPauseButton` optimistically showed the "Pause" state, requiring two clicks to recover. `autoplay=1` is now appended whenever `autoplay` is enabled so Vimeo handles autoplay natively. The existing `muted=1` param satisfies the browser autoplay policy.

    The iframe is also marked with `loading="lazy"` so blocks far below the fold don't request the Vimeo player upfront.

## 9.0.0-beta.4

### Major Changes

- 8b3932d: Move server-only exports to `/server` subpath

    Server-only exports have been moved to a separate `/server` entry point to prevent server-only code from being pulled into client bundles. While tree-shaking previously removed unused server code, this is an optional optimization — Vite's dev server, for example, does not tree-shake, causing errors when importing these packages in non-server environments (e.g., Storybook).

    **`@comet/site-nextjs`**: `sitePreviewRoute`, `legacyPagesRouterSitePreviewApiHandler`, `previewParams`, `legacyPagesRouterPreviewParams`, and `persistedQueryRoute` must now be imported from `@comet/site-nextjs/server`:

    ```diff
    - import { sitePreviewRoute } from "@comet/site-nextjs";
    + import { sitePreviewRoute } from "@comet/site-nextjs/server";
    ```

    ```diff
    - import { previewParams } from "@comet/site-nextjs";
    + import { previewParams } from "@comet/site-nextjs/server";
    ```

    ```diff
    - import { persistedQueryRoute } from "@comet/site-nextjs";
    + import { persistedQueryRoute } from "@comet/site-nextjs/server";
    ```

    **`@comet/site-react`**: `persistedQueryRoute` must now be imported from `@comet/site-react/server`:

    ```diff
    - import { persistedQueryRoute } from "@comet/site-react";
    + import { persistedQueryRoute } from "@comet/site-react/server";
    ```

### Minor Changes

- ab5e547: Add `JsonLd` component for typed schema.org structured data

    Renders any [`schema-dts`](https://www.npmjs.com/package/schema-dts) entity inside a `<script type="application/ld+json">` tag. The payload is escaped so a `</script>` sequence in user content cannot break out of the script tag.

    ```tsx
    import { JsonLd } from "@comet/site-react";
    import type { Organization } from "schema-dts";

    <JsonLd<Organization>
        data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Acme",
            url: "https://acme.example",
            logo: "https://acme.example/logo.png",
        }}
    />;
    ```

    Also re-exported from `@comet/site-nextjs`.

## 9.0.0-beta.3

### Patch Changes

- e125c84: Use `OnetrustActiveGroups` instead of `ConsentIntegrationData` in `useOneTrustCookieApi`

    `ConsentIntegrationData` is used for OneTrust's internal logging and can be `null`, which caused `useOneTrustCookieApi` to crash. As recommended by OneTrust support, `window.OnetrustActiveGroups` is used instead, as it is always available when the consent banner is implemented.

## 9.0.0-beta.2

## 9.0.0-beta.1

### Patch Changes

- 865fcfd: Remove legacy CJS fields (`module`, `types`) from package.json as these packages are ESM-only

## 9.0.0-beta.0

### Minor Changes

- 740dba8: Add support for React 19

## 8.20.0

## 8.19.0

## 8.18.0

### Minor Changes

- 2a9e770: Add HTML anchor props pass-through to `DamFileDownloadLinkBlock`

    These link block component now accept and pass through standard HTML anchor element attributes (such as `id`, `className`, `style`, `target`, `rel`, `aria-*`, `data-*`, `onClick`, etc.) to the rendered `<a>` element.

    **Example**:

    ```tsx
    <DamFileDownloadLinkBlock data={linkData} className="custom-link">
        <span>Download file</span>
    </DamFileDownloadLinkBlock>
    ```

## 8.17.1

## 8.17.0

### Minor Changes

- 35c338e: Add HTML anchor props pass-through to `ExternalLinkBlock`, `PhoneLinkBlock`, and `EmailLinkBlock`

    These link block components now accept and pass through standard HTML anchor element attributes (such as `id`, `className`, `style`, `target`, `rel`, `aria-*`, `data-*`, `onClick`, etc.) to the rendered `<a>` element.

    **Example**:

    ```tsx
    <ExternalLinkBlock data={linkData} className="custom-link" aria-label="Opens external site" data-tracking="external-click">
        <span>External Link</span>
    </ExternalLinkBlock>
    ```

## 8.16.0

## 8.15.0

## 8.14.0

## 8.13.0

### Patch Changes

- 9f5c4e6: Fix height of DamVideoBlock when fill prop is set

## 8.12.0

## 8.11.1

### Patch Changes

- 02d2ba8: Fix autoplay behavior of `YouTubeVideoBlock`

## 8.11.0

## 8.10.0

### Patch Changes

- 37ecc3b: Fix play/pause behavior for the `PlayPauseButton` in `DamVideoBlock`, `VimeoVideoBlock` and `YoutubeVideoBlock`

## 8.9.0

## 8.8.0

### Minor Changes

- d538073: Add an overridable `PlayPauseButton` to all video blocks to enable pausing videos without controls and export its types `PlayPauseButtonProps`

    To add custom styling to the button, a custom component can be passed to the video blocks, for example:

    ```tsx
        const getSupportedBlocks = (sizes: string, aspectRatio: string, fill?: boolean): SupportedBlocks => {
        ...
        return {
            damVideo: (data) => (
                <DamVideoBlock
                    data={data}
                    previewImageSizes={sizes}
                    aspectRatio={aspectRatio}
                    fill={fill}
                    renderPlayPauseButton={(props) => <PlayPauseButton {...props} />}
                />
            ),
        };
    ```

    The custom button component needs to accept `PlayPauseButtonProps` to guarantee its functionality.

## 8.7.1

## 8.7.0

### Minor Changes

- 27f15e3: Block Loader: infer `LoadedData` from loader return type

    Use the new `BlockLoaderOptions` type to allow inferring the type from the loader function.

    **Before**

    ```ts
    export const loader: BlockLoader<NewsLinkBlockData> = async ({ blockData, graphQLFetch }): Promise<LoadedData | null> => {
        // ...
    };

    export interface LoadedData {
        title: string;
    }
    ```

    **After**

    ```ts
    export const loader = async ({ blockData, graphQLFetch }: BlockLoaderOptions<NewsLinkBlockData>) => {
        // ...
    };

    export type LoadedData = Awaited<ReturnType<typeof loader>>;
    ```

- 10fc9e7: Move `YoutubeVideoBlock`, `VimeoVideoBlock` and `DamVideoBlock` to `@comet/site-react`

    The blocks in `@comet/site-react` provide no default implementation for `renderPreviewImage`.
    Instead, use the new `VideoPreviewImage` component with the `renderImage` prop to create the preview image.

- 559c536: Move `DamFileDownloadLinkBlock`, `EmailLinkBlock`, `ExternalLinkBlock` and `PhoneLinkBlock` to `@comet/site-react`

    The blocks have no dependency on Next.js and can therefore be in the generic React package.

- a68d4c0: `fetchInMemoryCache` now caches persisted queries
- db4b750: Add functionality for persisted queries on client side
    - `createPersistedQueryGraphQLFetch`: GraphQLFetch implementation that calls the BFF Route Handler with an operation ID (hash)
    - `persistedQueryRoute`: BFF Route Handler that gets called by the above fetch and forwards the query to the API
    - `webpackPersistedQueriesLoader`: webpack loader that turns client-side queries into an operation ID (hash)

## 8.6.0

## 8.5.2

## 8.5.1

## 8.5.0

## 8.4.2

## 8.4.1

## 8.4.0

## 8.3.0

### Patch Changes

- c6ee74e: Remove unnecessary `rimraf` dependency
- 22ee3de: Add SEO `title` property to PixelImageBlock and SvgImageBlock

## 8.2.0

## 8.1.1

## 8.1.0

## 8.0.0

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

### Minor Changes

- 2a9f23d: Support block preview scope for BFF requests

    The current scope will be sent via a monkey patched fetch and interpreted in `previewParams()`.

### Patch Changes

- b8817b8: Add `AdminMessageType`, `IAdminContentScopeMessage`, `IAdminGraphQLApiUrlMessage`, `IAdminHoverComponentMessage`, `IAdminShowOnlyVisibleMessage`, `IFrameHoverComponentMessage`, `IFrameLocationMessage`, `IFrameMessage`, `IFrameMessageType`, `IFrameOpenLinkMessage`, `IFrameSelectComponentMessage`, and `IReadyIFrameMessage` to the public API
- b8817b8: Add `AdminMessageType`, `IAdminContentScopeMessage`, `IAdminGraphQLApiUrlMessage`, `IAdminHoverComponentMessage`, `IAdminShowOnlyVisibleMessage`, `IFrameHoverComponentMessage`, `IFrameLocationMessage`, `IFrameMessage`, `IFrameMessageType`, `IFrameOpenLinkMessage`, `IFrameSelectComponentMessage`, and `IReadyIFrameMessage` to the public API

## 8.0.0-beta.6

## 8.0.0-beta.5

## 7.25.3

### Patch Changes

- e300d66d2: Fix the aspect ratio of the preview skeleton of images when using `fill`

## 7.25.2

## 7.25.1

### Patch Changes

- db632346d: YouTube and Vimeo Video Block: fixed bug where the video does not start after clicking the play button in the preview image.

## 7.25.0

## 7.24.0

## 7.23.0

## 7.22.0

### Patch Changes

- e4327e250: Add missing `"use client"` directive to `useBlockPreviewFetch`

## 7.21.1

## 7.21.0

### Minor Changes

- ede41201a: Introduce new package `@comet/site-react`

    While `@comet/cms-site` and `@comet/site-nextjs` are Next.js specific, `@comet/site-react` is framework-agnostic and works in all React projects.
    `@comet/site-react` is pure ESM and uses SCSS modules instead of `styled-components`.

    To load the CSS, you need to import it like this in your project:

    ```ts
    import "@comet/site-react/css";
    ```

    Also make sure the css is not tree-shaken by your bundler.
