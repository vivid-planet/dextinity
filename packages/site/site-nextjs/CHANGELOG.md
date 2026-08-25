# @comet/site-nextjs

## 10.1.0

### Patch Changes

- @dextinity/site-react@10.1.0

## 10.0.1

### Patch Changes

- @dextinity/site-react@10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/site-nextjs` to `@dextinity/site-nextjs`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename the `cometType` property of iframe messages to `dextinityType`. A matching `@dextinity/cms-admin` version is required
    - Rename the site preview cookie from `__comet_site_preview` to `__dextinity_site_preview`. A matching `@dextinity/cms-api` version is required

### Patch Changes

- Updated dependencies [f843a5e]
    - @dextinity/site-react@10.0.0

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/site-nextjs` to `@dextinity/site-nextjs`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename the `cometType` property of iframe messages to `dextinityType`. A matching `@dextinity/cms-admin` version is required
    - Rename the site preview cookie from `__comet_site_preview` to `__dextinity_site_preview`. A matching `@dextinity/cms-api` version is required

### Patch Changes

- Updated dependencies [f843a5e]
    - @dextinity/site-react@10.0.0-beta.0

## 9.5.0

### Patch Changes

- @comet/site-react@9.5.0

## 9.4.0

### Patch Changes

- @comet/site-react@9.4.0

## 9.3.0

### Minor Changes

- 924b66c: Add `underline` support to `createTipTapRichTextBlock`

    The `underline` inline style is now part of the `supports` list and can be toggled via a new toolbar button. The underline mark is validated by the API, rendered as `<u>` by `renderTipTapRichText`, and the DraftJS migration maps the `UNDERLINE` inline style to it when supported. Per default it is disabled, pass a `supports` list with `underline` to enable it.

### Patch Changes

- Updated dependencies [924b66c]
    - @comet/site-react@9.3.0

## 9.2.2

### Patch Changes

- @comet/site-react@9.2.2

## 9.2.1

### Patch Changes

- 94a1d58: Fix client-side crash in `useCookieBotCookieApi` when Cookiebot is not yet initialized

    The hook read `window.Cookiebot.consent` in its initial call, but `window.Cookiebot` exists as soon as the Cookiebot script has run, while `consent` is only populated once Cookiebot fires `CookiebotOnConsentReady`. Calling `Object.keys(consent)` before that threw `TypeError: Cannot convert undefined or null to object`, crashing the client. The initial call is now a no-op until consent is available.

- Updated dependencies [94a1d58]
    - @comet/site-react@9.2.1

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

### Patch Changes

- Updated dependencies [ee0bf93]
    - @comet/site-react@9.2.0

## 9.1.1

### Patch Changes

- @comet/site-react@9.1.1

## 9.1.0

### Patch Changes

- @comet/site-react@9.1.0

## 9.0.1

### Patch Changes

- @comet/site-react@9.0.1

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

- 54f57dd: Support loading data for child blocks embedded in rich text content in `recursivelyLoadBlockData`

    Child blocks embedded in a `createTipTapRichTextBlock` rich text block (stored as `cmsBlock`/`cmsInlineBlock` nodes) are now traversed by `recursivelyLoadBlockData`, so their registered block loaders run just like for any other nested block. This allows rich text child blocks to load additional data (e.g. via a GraphQL query) without relying on a `BlockTransformerService` on the API side.

    To support this, the `tipTapContent` field of a `createTipTapRichTextBlock` block is now declared with a dedicated `TipTapRichTextBlock` block meta kind (instead of `Json`) that carries the configured child blocks. The block loader uses this kind to detect rich text content instead of inspecting arbitrary `Json` fields.

    Also re-exported from `@comet/site-nextjs`.

- 740dba8: Add support for Next.js 15 and 16

    `@comet/site-nextjs` now supports Next.js 14, 15, and 16. We recommend using Next.js 16.

- 740dba8: Add support for React 19

    `@comet/site-nextjs` now supports React 18 and React 19.

### Patch Changes

- b7daf28: Fix `PixelImageBlock` and `Image` failing to render in Next.js Pages Router with `Error: Element type is invalid ... but got: object`

    `@comet/site-nextjs` is published as ESM (`"type": "module"`) and the components used a default import of `next/image` (CJS). Under Next.js Pages Router the server bundler keeps node_modules ESM packages as Node-style externals, which applies Node-style ESM↔CJS interop: `import NextImage from "next/image"` yields the entire module-namespace object (`{ default, getImageProps, __esModule: true }`) instead of the component. The default import is now unwrapped at module evaluation time so the components work under both bundler-style and Node-style interop.

- 865fcfd: Remove legacy CJS fields (`module`, `types`) from package.json as these packages are ESM-only
- Updated dependencies [ab5e547]
- Updated dependencies [4c1aeb2]
- Updated dependencies [54f57dd]
- Updated dependencies [cfa70a2]
- Updated dependencies [4f018d5]
- Updated dependencies [d870d05]
- Updated dependencies [740dba8]
- Updated dependencies [8b3932d]
- Updated dependencies [e125c84]
- Updated dependencies [865fcfd]
    - @comet/site-react@9.0.0

## 9.0.0-beta.6

### Patch Changes

- Updated dependencies [4c1aeb2]
- Updated dependencies [d870d05]
    - @comet/site-react@9.0.0-beta.6

## 9.0.0-beta.5

### Patch Changes

- Updated dependencies [cfa70a2]
- Updated dependencies [4f018d5]
    - @comet/site-react@9.0.0-beta.5

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

### Patch Changes

- b7daf28: Fix `PixelImageBlock` and `Image` failing to render in Next.js Pages Router with `Error: Element type is invalid ... but got: object`

    `@comet/site-nextjs` is published as ESM (`"type": "module"`) and the components used a default import of `next/image` (CJS). Under Next.js Pages Router the server bundler keeps node_modules ESM packages as Node-style externals, which applies Node-style ESM↔CJS interop: `import NextImage from "next/image"` yields the entire module-namespace object (`{ default, getImageProps, __esModule: true }`) instead of the component. The default import is now unwrapped at module evaluation time so the components work under both bundler-style and Node-style interop.

- Updated dependencies [ab5e547]
- Updated dependencies [8b3932d]
    - @comet/site-react@9.0.0-beta.4

## 9.0.0-beta.3

### Patch Changes

- Updated dependencies [e125c84]
    - @comet/site-react@9.0.0-beta.3

## 9.0.0-beta.2

### Patch Changes

- @comet/site-react@9.0.0-beta.2

## 9.0.0-beta.1

### Patch Changes

- 865fcfd: Remove legacy CJS fields (`module`, `types`) from package.json as these packages are ESM-only
- Updated dependencies [865fcfd]
    - @comet/site-react@9.0.0-beta.1

## 9.0.0-beta.0

### Major Changes

- 740dba8: Bump Next.js peer dependency to v16

    Follow the official migration guides ([v15](https://nextjs.org/docs/app/guides/upgrading/version-15), [v16](https://nextjs.org/docs/app/guides/upgrading/version-16)) to upgrade.

- 740dba8: Bump React peer dependency to v19

    Follow the official [migration guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) to upgrade.

### Patch Changes

- Updated dependencies [740dba8]
    - @comet/site-react@9.0.0-beta.0

## 8.20.0

### Patch Changes

- @comet/site-react@8.20.0

## 8.19.0

### Patch Changes

- @comet/site-react@8.19.0

## 8.18.0

### Patch Changes

- Updated dependencies [2a9e770]
    - @comet/site-react@8.18.0

## 8.17.1

### Patch Changes

- 91e9a8f: Raise Next.js peer dependency minimum to 14.2.35 to fix CVE-2026-23864 (request deserialization DoS)
    - @comet/site-react@8.17.1

## 8.17.0

### Patch Changes

- Updated dependencies [35c338e]
    - @comet/site-react@8.17.0

## 8.16.0

### Patch Changes

- @comet/site-react@8.16.0

## 8.15.0

### Patch Changes

- @comet/site-react@8.15.0

## 8.14.0

### Patch Changes

- @comet/site-react@8.14.0

## 8.13.0

### Patch Changes

- Updated dependencies [9f5c4e6]
    - @comet/site-react@8.13.0

## 8.12.0

### Patch Changes

- @comet/site-react@8.12.0

## 8.11.1

### Patch Changes

- Updated dependencies [02d2ba8]
    - @comet/site-react@8.11.1

## 8.11.0

### Patch Changes

- @comet/site-react@8.11.0

## 8.10.0

### Patch Changes

- Updated dependencies [37ecc3b]
    - @comet/site-react@8.10.0

## 8.9.0

### Patch Changes

- @comet/site-react@8.9.0

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

### Patch Changes

- Updated dependencies [d538073]
    - @comet/site-react@8.8.0

## 8.7.1

### Patch Changes

- @comet/site-react@8.7.1

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

- db4b750: Add functionality for persisted queries on client side
    - `createPersistedQueryGraphQLFetch`: GraphQLFetch implementation that calls the BFF Route Handler with an operation ID (hash)
    - `persistedQueryRoute`: BFF Route Handler that gets called by the above fetch and forwards the query to the API
    - `webpackPersistedQueriesLoader`: webpack loader that turns client-side queries into an operation ID (hash)

### Patch Changes

- Updated dependencies [27f15e3]
- Updated dependencies [10fc9e7]
- Updated dependencies [559c536]
- Updated dependencies [a68d4c0]
- Updated dependencies [db4b750]
    - @comet/site-react@8.7.0

## 8.6.0

### Patch Changes

- @comet/site-react@8.6.0

## 8.5.2

### Patch Changes

- a5500b1: Set `referrerPolicy="strict-origin-when-cross-origin"` in the `YouTubeVideoBlock`

    Apparently, YouTube recently started requiring a `Referer` header for embedded videos. If no `Referer` is present, the video fails to load ("Error 153").
    - @comet/site-react@8.5.2

## 8.5.1

### Patch Changes

- @comet/site-react@8.5.1

## 8.5.0

### Patch Changes

- @comet/site-react@8.5.0

## 8.4.2

### Patch Changes

- @comet/site-react@8.4.2

## 8.4.1

### Patch Changes

- @comet/site-react@8.4.1

## 8.4.0

### Patch Changes

- @comet/site-react@8.4.0

## 8.3.0

### Patch Changes

- c6ee74e: Remove unnecessary `rimraf` dependency
- 22ee3de: Add SEO `title` property to PixelImageBlock and SvgImageBlock
- Updated dependencies [c6ee74e]
- Updated dependencies [22ee3de]
    - @comet/site-react@8.3.0

## 8.2.0

### Minor Changes

- 8ba4f62: Prevent phishing in SitePreview

    Affected applications: if the property `resolvePath` of the `SitePreview` component returns the plain path. The default implementation in the starter is not affected.

- f1890f0: Improve accessibility of `playIcon` by setting an aria-label that can be overridden by using the `playButtonAriaLabel` prop in `DamVideoBlock`, `YoutubeBlock` and `VimeoBlock`

### Patch Changes

- @comet/site-react@8.2.0

## 8.1.1

### Patch Changes

- @comet/site-react@8.1.1

## 8.1.0

### Patch Changes

- @comet/site-react@8.1.0

## 8.0.0

### Major Changes

- 67ae9df: Fix opacity on `VideoPreviewImage` to only affect the background color
- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

- eb65ef1: Remove unused GraphQL client/fetch from site preview handlers

    The client/fetch was passed as the last argument for `sitePreviewRoute` and `legacyPagesRouterSitePreviewApiHandler`.
    Remove the argument from the respective function calls or use the provided upgrade script (https://github.com/vivid-planet/comet-upgrade/pull/33)

- 23f393b: Protect images in the site preview

    The image URLs in the site preview are now generated as preview URLs.
    Authorization is handled via the new `createSitePreviewAuthService`, which validates the site preview cookie.

- e19e997: Remove the `@comet/cms-site` package in favor of `@comet/site-nextjs`

### Minor Changes

- e3e1bdc: Add createFetchWithDefaultNextRevalidate that applies next.revalidate only if cache is not set
- 2a9f23d: Support block preview scope for BFF requests

    The current scope will be sent via a monkey patched fetch and interpreted in `previewParams()`.

### Patch Changes

- b8817b8: Add `AdminMessageType`, `IAdminContentScopeMessage`, `IAdminGraphQLApiUrlMessage`, `IAdminHoverComponentMessage`, `IAdminShowOnlyVisibleMessage`, `IFrameHoverComponentMessage`, `IFrameLocationMessage`, `IFrameMessage`, `IFrameMessageType`, `IFrameOpenLinkMessage`, `IFrameSelectComponentMessage`, and `IReadyIFrameMessage` to the public API
- bc00273: Set focus on `playIcon` in VideoPreviewImage for better visibility
- b5d084a: Include `@comet/site-react` in the bundle of `@comet/site-nextjs`

    Previously, `@comet/site-react` was treated as an external dependency.

    In `@comet/site-nextjs`' index.ts, many exports from `@comet/site-react` are reexported.
    This caused problems in NextJS when using methods from `@comet/site-react` in the middleware.
    Edge runtime errors containing completely unrelated modules occurred, e.g.

    > The error was caused by importing 'usehooks-ts/dist/index.js' in '../../packages/site/site-react/lib/cookies/useLocalStorageCookieApi.js'.
    >
    > Import trace for requested module:
    > ../../packages/site/site-react/lib/cookies/useLocalStorageCookieApi.js
    > ../../packages/site/site-react/lib/index.js
    > ../../packages/site/site-nextjs/lib/index.js
    > ./src/middleware/predefinedPages.ts
    > ./src/middleware.ts
    > occurred in a file that only imported

    ```ts
    import { createFetchWithDefaults, createGraphQLFetch } from "@comet/site-nextjs";
    ```

    This is due to a Webpack behavior that pulls all exports in the reexport statement into the middleware bundle.

    Bundling `@comet/site-react` with `@comet/site-nextjs` prevents this behavior and the associated error.

- b8817b8: Add `AdminMessageType`, `IAdminContentScopeMessage`, `IAdminGraphQLApiUrlMessage`, `IAdminHoverComponentMessage`, `IAdminShowOnlyVisibleMessage`, `IFrameHoverComponentMessage`, `IFrameLocationMessage`, `IFrameMessage`, `IFrameMessageType`, `IFrameOpenLinkMessage`, `IFrameSelectComponentMessage`, and `IReadyIFrameMessage` to the public API
- Updated dependencies [f904b71]
- Updated dependencies [b8817b8]
- Updated dependencies [b8817b8]
- Updated dependencies [2a9f23d]
    - @comet/site-react@8.0.0

## 8.0.0-beta.6

### Major Changes

- e19e997: Remove the `@comet/cms-site` package in favor of `@comet/site-nextjs`

### Patch Changes

- @comet/site-react@8.0.0-beta.6

## 8.0.0-beta.5

### Patch Changes

- @comet/site-react@8.0.0-beta.5

## 7.25.3

### Patch Changes

- b1701abf4: Include `@comet/site-react` in the bundle of `@comet/site-nextjs`

    Previously, `@comet/site-react` was treated as an external dependency.

    In `@comet/site-nextjs`' index.ts, many exports from `@comet/site-react` are reexported.
    This caused problems in NextJS when using methods from `@comet/site-react` in the middleware.
    Edge runtime errors containing completely unrelated modules occurred, e.g.

    > The error was caused by importing 'usehooks-ts/dist/index.js' in '../../packages/site/site-react/lib/cookies/useLocalStorageCookieApi.js'.
    >
    > Import trace for requested module:
    > ../../packages/site/site-react/lib/cookies/useLocalStorageCookieApi.js
    > ../../packages/site/site-react/lib/index.js
    > ../../packages/site/site-nextjs/lib/index.js
    > ./src/middleware/predefinedPages.ts
    > ./src/middleware.ts
    > occurred in a file that only imported

    ```ts
    import { createFetchWithDefaults, createGraphQLFetch } from "@comet/site-nextjs";
    ```

    This is due to a Webpack behavior that pulls all exports in the reexport statement into the middleware bundle.

    Bundling `@comet/site-react` with `@comet/site-nextjs` prevents this behavior and the associated error.

- Updated dependencies [e300d66d2]
    - @comet/site-react@7.25.3

## 7.25.2

### Patch Changes

- @comet/site-react@7.25.2

## 7.25.1

### Patch Changes

- db632346d: YouTube and Vimeo Video Block: fixed bug where the video does not start after clicking the play button in the preview image.
- Updated dependencies [db632346d]
    - @comet/site-react@7.25.1

## 7.25.0

### Minor Changes

- b421ed273: Support captions in the `DamVideoBlock`

    The captions can be set uploaded as .vtt files and linked to videos in the DAM.

### Patch Changes

- @comet/site-react@7.25.0

## 7.24.0

### Patch Changes

- @comet/site-react@7.24.0

## 7.23.0

### Patch Changes

- @comet/site-react@7.23.0

## 7.22.0

### Patch Changes

- Updated dependencies [e4327e250]
    - @comet/site-react@7.22.0

## 7.21.1

### Patch Changes

- c84874edf: Revert "Fix `PixelImageBlock` fixed height, auto width issue" added in v7.20.0

    In v7.20.0, height was set to `100%` for `PixelImageBlock`.
    This caused issues when the image was not wrapped, as it would inherit the height of the next parent element instead of maintaining its aspect ratio.
    Thus, we are reverting this change to restore the previous behavior.
    - @comet/site-react@7.21.1

## 7.21.0

### Minor Changes

- 904ff5f1d: Introduce new package `@comet/site-nextjs` as copy of `@comet/cms-site`

    Changes:
    - Remove `styled-components` as peer dependency
    - use SCSS modules instead
    - `@comet/site-nextjs` is pure ESM

    To load the CSS, you need to import it like this:

    ```ts
    import "@comet/site-nextjs/css";
    ```

    In Next.js you can do that in `/app/layout.tsx`.

### Patch Changes

- Updated dependencies [ede41201a]
    - @comet/site-react@7.21.0
