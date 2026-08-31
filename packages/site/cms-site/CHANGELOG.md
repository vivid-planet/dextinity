# @comet/cms-site

## 7.26.1

## 7.26.0

## 7.25.15

## 7.25.14

## 7.25.13

### Patch Changes

-   2af58aabc: Set `referrerPolicy="strict-origin-when-cross-origin"` in the `YouTubeVideoBlock`

    Apparently, YouTube recently started requiring a `Referer` header for embedded videos. If no `Referer` is present, the video fails to load ("Error 153").

## 7.25.12

## 7.25.11

### Patch Changes

-   cb057eeab: Add SEO `title` property to PixelImageBlock and SvgImageBlock

## 7.25.10

### Patch Changes

-   9b3292dad: Prevent phishing in SitePreview (for pages router)

## 7.25.9

### Patch Changes

-   79a90e7f6: Prevent phishing in SitePreview

    Affected applications: if the property `resolvePath` of the `SitePreview` component returns the plain path. The default implementation in the starter is not affected.

## 7.25.8

## 7.25.7

## 7.25.6

## 7.25.5

## 7.25.4

## 7.25.3

## 7.25.2

## 7.25.1

### Patch Changes

-   db632346d: YouTube and Vimeo Video Block: fixed bug where the video does not start after clicking the play button in the preview image.
-   d26f346c0: Loosen styled-components peer dependency

    Allow using styled-components v5 in applications.

## 7.25.0

### Minor Changes

-   b421ed273: Support captions in the `DamVideoBlock`

    The captions can be set uploaded as .vtt files and linked to videos in the DAM.

## 7.24.0

## 7.23.0

## 7.22.0

### Patch Changes

-   e4327e250: Add missing `"use client"` directive to `useBlockPreviewFetch`

## 7.21.1

### Patch Changes

-   c84874edf: Revert "Fix `PixelImageBlock` fixed height, auto width issue" added in v7.20.0

    In v7.20.0, height was set to `100%` for `PixelImageBlock`.
    This caused issues when the image was not wrapped, as it would inherit the height of the next parent element instead of maintaining its aspect ratio.
    Thus, we are reverting this change to restore the previous behavior.

## 7.21.0

### Patch Changes

-   904ff5f1d: Deprecated: This package is now deprecated in favor of `@comet/site-nextjs`

## 7.20.0

### Patch Changes

-   a06cac3a7: Fix `PixelImageBlock` issue when setting fixed height and width auto

## 7.19.0

## 7.18.0

## 7.17.0

## 7.16.0

### Minor Changes

-   71642aa07: Export `VideoPreviewImage` component

### Patch Changes

-   636326207: Fix preview overlay alignment for blocks that are scrolled into view when selected from the admin block list, e.g., in slider blocks
-   4ddeeb09e: Prevent unintended horizontal scrolling in the admin's block preview

    This previously occurred when blocks were rendered outside of the viewport width, such as elements of a slider.

## 7.15.0

### Patch Changes

-   75fb1d0d4: Fix block preview not rendering before user interaction

## 7.14.0

### Minor Changes

-   6163b83a4: Play/pause auto-play videos depending on their visibility

    Start videos in `DamVideoBlock`, `YoutubeVideoBlock` and `VimeoVideoBlock` when the block is in or enters the viewport.
    Pause them when the block is leaving the viewport.

-   d07a6da51: Add comment explaining why we omit the `alt`-prop in `PixelImageBlock`

### Patch Changes

-   6ff1d70f6: Fix `hasRichTextBlockContent` for blocks with no content blocks
-   8e648a757: Set alt attribute to empty string as default in `SvgImageBlock`

## 7.13.0

### Minor Changes

-   f60b6360c: Extend the `usePreview`-helpers `isSelected` and `isHovered` with optional partial match support

    -   When `exactMatch` is set to `true` (default), the function checks for exact URL matches.
    -   When `exactMatch` is set to `false`, the function checks if the selected route starts with the given URL.

## 7.12.0

### Patch Changes

-   e92e6df03: Prevent the block-preview from becoming unresponsive when rendering an `input`

## 7.11.0

## 7.10.0

## 7.9.0

## 7.8.0

### Minor Changes

-   2352959f8: Export `convertPreviewDataToHeaders` to make `createGraphQLFetch` more configurable
-   059636aba: Pass the `graphQLApiUrl` for `useBlockPreviewFetch` through the `IFrameBridge`

    It's not necessary to set it in the site anymore. To migrate, remove the argument from `useBlockPreviewFetch()`:

    ```diff
    const PreviewPage = () => {
        const iFrameBridge = useIFrameBridge();

    -   const { fetch, graphQLFetch } = useBlockPreviewFetch(graphQLApiUrl);
    +   const { fetch, graphQLFetch } = useBlockPreviewFetch();

        const [blockData, setBlockData] = useState<PageContentBlockData>();
        useEffect(() => {
            async function load() {
    +           if (!graphQLFetch) {
    +               return;
    +           }
                if (!iFrameBridge.block) {
                    setBlockData(undefined);
                    return;
                }
                const newData = await recursivelyLoadBlockData({
                    blockType: "PageContent",
                    blockData: iFrameBridge.block,
                    graphQLFetch,
                    fetch,
                    pageTreeNodeId: undefined, //we don't have a pageTreeNodeId in preview
                });
                setBlockData(newData);
            }
            load();
        }, [iFrameBridge.block, fetch, graphQLFetch]);

        return <div>{blockData && <PageContentBlock data={blockData} />}</div>;
    };
    ```

### Patch Changes

-   e032353df: The `graphQLFetch` helper for block preview uses `credentials: "include"`

    This is necessary for the block preview when using block loaders because they load the data from the API on the client side.

## 7.7.0

### Minor Changes

-   723a0b865: Disable showing related videos from other channels in `YouTubeVideoBlock`

    By setting the parameter `rel` to `0` only related videos from the same channel as the embedded video are shown.

## 7.6.0

### Minor Changes

-   671e2b234: Create site preview JWT in the API

    With this change the site preview can be deployed unprotected. Authentication is made via a JWT created in the API and validated in the site. A separate domain for the site preview is still necessary.

    **Note:** This requires the `sitePreviewSecret` option to be configured in the `PageTreeModule`.
    Run `npx @comet/upgrade@latest v7/add-site-preview-secret.ts` in the root of your project to perform the necessary code changes.
    Changes to the deployment setup might still be necessary.

-   c92fd5e18: PixelImageBlock: Allow different aspect ratio formats

    The `aspectRatio` prop now supports values in the following formats:

    -   x as separator: `aspectRatio="3x1"`
    -   : as separator: `aspectRatio="16:9"`
    -   / as separator: `aspectRatio="4/3"`
    -   Numbers: `aspectRatio={1.5}`
    -   Strings: `aspectRatio="3"`

-   e0dea4c99: Allow setting a custom `height` or `aspectRatio` on `PreviewSkeleton` when using `type="media"`

    When no value is provided, the fallback height of `300px` is used.

    ```tsx
    <PreviewSkeleton type="media" height={200} />
    <PreviewSkeleton type="media" aspectRatio="16x9" />
    ```

-   c3bebef97: Use non-preview DAM URLs for the site preview
-   7ac8bb0f0: gql: Handle non-string variables in GraphQL documents

    Non-string variables were incorrectly converted to strings, e.g., `'[object Object]'`. This error usually occurred when trying to import a GraphQL fragment from a React Client Component. The `gql` helper now throws an error for non-string variables.

-   ec57e2dd7: Add support to set a custom preview image icon to `DamVideoBlock`, `VimeoVideoBlock`, and `YouTubeVideoBlock`

    Use the `previewImageIcon` prop to pass the icon to the default `VideoPreviewImage` component:

    ```diff
    <DamVideoBlock
      data={props}
      fill={fill}
    + previewImageIcon={<CustomPlayIcon />}
    />
    ```

### Patch Changes

-   41b6cd64b: Fix preview overlay not updating on style-only changes

    Previously, the preview overlay would only update when the HTML structure changed or the window was resized.
    Now it also responds to attribute changes, including `class` modifications, ensuring the overlay updates correctly when elements are repositioned through CSS.

-   7ac8bb0f0: GraphQLFetch: Correctly report GraphQL schema validation errors
-   e0dea4c99: Render preview skeletons of image and video blocks with the block's `aspectRatio` or `height`, if defined, instead of using a fixed height of `300px`

    This applies to `SvgImageBlock`, `PixelImageBlock`, `DamVideoBlock`, `YouTubeVideoBlock`, and `VimeoVideoBlock`.

-   b0de0bd27: Prevent rendering of empty blocks in `PreviewSkeleton`

    Previously, in non-preview environments, `PreviewSkeleton` would still render its children, even if `hasChanges` was set to `false`, causing unwanted empty HTML tags in the site.
    For instance, an empty rich text block would still render a `<p>` tag.
    Now, the children will only be rendered if `hasContent` is set to `true`.
    Doing so removes the need for duplicate empty checks.

## 7.5.0

## 7.4.2

### Patch Changes

-   d95b0cb8d: Fix Next peer dependency

    The peer dependency was incorrectly set to `14`.
    We require `14.2.0` or later due to relying on [optimizePackageImports](https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports).

## 7.4.1

## 7.4.0

### Minor Changes

-   bfb8f04e6: Add `VimeoVideoBlock` to support Vimeo videos
-   b132010e2: Add helper functions and components to prevent loading third-party cookies until explicit user consent

    See the docs for information on usage and configuration: https://docs.comet-dxp.com/docs/working-with-cookies/

-   53d896b56: Add optional `icon` prop to `VideoPreviewImage` to enable setting a custom play icon

## 7.3.2

## 7.3.1

## 7.3.0

### Patch Changes

-   f2e10ec21: Fix a bug where a block's hover-overlay element in the admin preview might persist after the underlying element is moved or resized

## 7.2.1

## 7.2.0

### Minor Changes

-   381aa71c7: Add `ErrorHandlerProvider`

    Each block in `BlocksBlock`, `OneOfBlock` and `ListBlock` is wrapped with an error boundary to prevent the whole page from crashing when a single block throws an error.
    In production, the broken block is hidden. The application should take care of reporting the error to an error tracking service (e.g., Sentry). In local development, the error is re-thrown.

    Add an `ErrorHandler` to the root layout:

    ```tsx
    // In src/app/layout.tsx
    <html>
        <body className={inter.className}>
            {/* Other Providers */}
            <ErrorHandler>{children}</ErrorHandler>
        </body>
    </html>
    ```

    The `ErrorHandler` receives the errors in the application and can report them to the error tracking service.

    **Example ErrorHandler**

    ```tsx
    "use client";

    import { ErrorHandlerProvider } from "@comet/cms-site";
    import { PropsWithChildren } from "react";

    export function ErrorHandler({ children }: PropsWithChildren) {
        function onError(error: Error, errorInfo: ErrorInfo) {
            console.error("Error caught by error handler", error, errorInfo.componentStack);
            if (process.env.NODE_ENV === "development") {
                throw error;
            } else {
                // Report the error to the error tracking service
            }
        }

        return <ErrorHandlerProvider onError={onError}>{children}</ErrorHandlerProvider>;
    }
    ```

## 7.1.0

### Minor Changes

-   7ad7a50a6: PixelImageBlock: Set `object-fit` to `cover` per default

    When setting `object-fit` to `cover`, the image will fill the container and maintain its aspect ratio.
    This is the most common use case for images in our applications.
    The default behavior for `object-fit` (which is `fill`) resulted in distorted images.

    This behavior can be overridden by setting the `style` prop on the `PixelImageBlock` component, which is forwarded to the `next/image` component:

    ```diff
    <PixelImageBlock
      ...
      fill
    + style={{ objectFit: "contain" }}
    />
    ```

## 7.0.0

### Major Changes

-   4f32ad014: Bump styled-components peer dependency to v6

    Follow the official [migration guide](https://styled-components.com/docs/faqs#what-do-i-need-to-do-to-migrate-to-v6) to upgrade.

-   9351b1452: Upgrade to Next 14 and React 18

    Add "use client" directive to components that currently require it (as they use styled-components or a context)

-   15eb9e173: Revise `PixelImageBlock` to correctly use the "new" `next/image` component

    See the [docs](https://nextjs.org/docs/pages/api-reference/components/image-legacy#comparison) for a comparison between the new and the legacy component.

    **Migrate**

    Remove the `layout` prop from the block as it can lead to errors with the default implementation (`layout="responsive"` is not compatible with the new `fill` prop).

    -   `layout={"responsive" | "inherit"}` can safely be removed

        ```diff
        <PixelImageBlock
            data={block.props}
            aspectRatio={aspectRatio}
        -   layout={"responsive"}   // line is marked as deprecated, but "responsive" must be removed
            {...imageProps}
        />
        ```

    -   `layout={"fill"}` can be replaced with `fill={true}`

        ```diff
        <PixelImageBlock
            data={block.props}
            aspectRatio={aspectRatio}
        -   layout={"fill"}
        +   fill
            {...imageProps}
        />
        ```

    Notes:

    The `PixelImageBlock` is usually wrapped in a `DamImageBlock` in the application. The `layout` prop should be removed from it as well.

    You can use the newly added `fill` prop of the `next/image` component by embedding the `PixelImageBlock` in a parent element that assigns the `position` style. See the [docs](https://nextjs.org/docs/pages/api-reference/components/image#fill) for more information.

-   86358bf87: Fix an issue where the block preview could break a block's styling and HTML structure

    This was caused by a `div` added around every block to enable the selection and highlighting of the block in the block preview.
    The `div` is still present but now uses `display: contents`, so its effect should be minimal.

    Common issues that should now be resolved include:

    -   The image inside, e.g., a `PixelImageBlock`, would not be visible because the image's size depends on the parent `div`'s size.
    -   Blocks used as children of elements with `display: flex` or `display: grid` could not position themselves correctly.

-   6986cdc82: Require `aspectRatio` prop for `PixelImageBlock` and `Image`

    The `16x9` default aspect ratio has repeatedly led to incorrectly displayed images on the site.
    Therefore, it has been removed.
    Instead, consider which aspect ratio to use for each image.

    **Example**

    ```diff
    <PixelImageBlock
      data={teaser}
      layout="fill"
    + aspectRatio="16x9"
    />
    ```

-   ae0142029: Support single host for block preview

    The content scope is passed through the iframe-bridge in the admin and accessible in the site in the IFrameBridgeProvider.
    Breaking: `previewUrl`-property of `SiteConfig` has changed to `blockPreviewBaseUrl`

-   a58918893: Remove `aspectRatio` from `YouTubeBlock`

    The block's aspect ratio options (4x3, 16x9) proved too inflexible to be of actual use in an application. Therefore, the aspect ratio field was removed. It should be defined in the application instead.

    **Migrate**

    The block requires an aspect ratio in the site. It should be set using the `aspectRatio` prop (default: `16x9`):

    ```diff
     <YouTubeVideoBlock
       data={video}
    +  aspectRatio="9x16"
     />
    ```

-   7f1e78448: Remove `next/link` legacy behavior as default behavior

    Previously, Next required the `Link` component to have a child `<a>` tag. To style this tag correctly in the application, none of the library link blocks (`DamFileDownloadLinkBlock`, `ExternalLinkBlock`, `EmailLinkBlock`, `InternalLinkBlock`, and `PhoneLinkBlock`) rendered the tag, but cloned the children with the correct props instead.

    However, since Next v13 the `Link` component no longer requires a child `<a>` tag. Consequently, we don't need to render the tag for the `InternalLinkBlock` (which uses `Link` internally) anymore. In order to style all link blocks correctly, we now render an `<a>` tag for all other link blocks.

    **Upgrade**

    To upgrade, either remove all `<a>` tags from your link block usages, or add the `legacyBehavior` prop to all library link blocks.

-   ba4e509ef: Remove server-only code from client bundle

    Make sure to upgrade to Next 14.2.0 or later.
    Enable `optimizePackageImports` for `@comet/cms-site` in `next.config.js`:

    ```diff
    const nextConfig = {
        /* ... */
    +   experimental: {
    +       optimizePackageImports: ["@comet/cms-site"],
    +   },
    };

    module.exports = withBundleAnalyzer(nextConfig);
    ```

### Minor Changes

-   36cdd70f1: Deprecate `InternalLinkBlock` component, instead there should be a copy of this component in the application for flexibility (e.g., support for internationalized routing)
-   6d56606a8: Store site preview scope in cookie and add `previewParams()` helper to access it

    -   Requires the new `SITE_PREVIEW_SECRET` environment variable that must contain a random secret (not required for local development)
    -   Requires a Route Handler located at `app/api/site-preview/route.ts`:
    -   The previewParams() return a promise

        ```ts
        import { sitePreviewRoute } from "@comet/cms-site";
        import { createGraphQLFetch } from "@src/util/graphQLClient";
        import { type NextRequest } from "next/server";

        export const dynamic = "force-dynamic";

        export async function GET(request: NextRequest) {
            return sitePreviewRoute(request, createGraphQLFetch());
        }
        ```

-   4f46b3e3e: Add optional `fill` prop to `YouTubeVideoBlock` and `DamVideoBlock` to support same behavior as in `PixelImageBlock`
-   a80ab10f3: Add GraphQL fetch client

    -   `createGraphQLFetch`: simple graphql client around fetch, usage: createGraphQLFetch(fetch, url)(gql, variables)
    -   `type GraphQLFetch = <T, V>(query: string, variables?: V, init?: RequestInit) => Promise<T>`
    -   `gql` for tagging queries
    -   `createFetchWithDefaults` fetch decorator that adds default values (eg. headers or next.revalidate)
    -   `createFetchWithPreviewHeaders` fetch decorator that adds comet preview headers (based on SitePreviewData)

    Example helper in application:

    ```
    export const graphQLApiUrl = `${typeof window === "undefined" ? process.env.API_URL_INTERNAL : process.env.NEXT_PUBLIC_API_URL}/graphql`;
    export function createGraphQLFetch(previewData?: SitePreviewData) {
        return createGraphQLFetchLibrary(
            createFetchWithDefaults(createFetchWithPreviewHeaders(fetch, previewData), { next: { revalidate: 15 * 60 } }),
            graphQLApiUrl,
        );

    }
    ```

    Usage example:

    ```
    const graphqlFetch = createGraphQLFetch(previewData);
    const data = await graphqlFetch<GQLExampleQuery, GQLExampleQueryVariables>(
        exampleQuery,
        {
            exampleVariable: "foo"
        }
    );
    ```

-   cf9496fdb: Add `legacyPagesRouterSitePreviewApiHandler` helper

    Used to enable the site preview (Preview Mode) for projects which use the Pages Router. This helper is added to ease migrating. New projects should use the App Router instead.

-   fc27014bc: Add new technique for blocks to load additional data at page level when using SSR

    This works both server-side (SSR, SSG) and client-side (block preview).

    New Apis:

    -   `recursivelyLoadBlockData`: used to call loaders for a block data tree
    -   `BlockLoader`: type of a loader function that is responsible for one block
    -   `useBlockPreviewFetch`: helper hook for block preview that creates client-side caching graphQLFetch/fetch
    -   `BlockLoaderDependencies`: interface with dependencies that get passed through recursivelyLoadBlockData into loader functions. Can be extended using module augmentation in application to inject eg. pageTreeNodeId.

-   b7560e3a7: Add preview image to `YouTubeVideoBlock` and `DamVideoBlock`

    The `YouTubeVideoBlock` and the `DamVideoBlock` now support a preview image out of the box. For customisation the default `VideoPreviewImage` component can be overridden with the optional `renderPreviewImage` method.

    It is recommended to replace the custom implemented video blocks in the projects with the updated `YouTubeVideoBlock` and `DamVideoBlock` from the library.

-   769bd72f0: Use the Next.js Preview Mode for the site preview

    The preview is entered by navigating to an API Route in the site, which has to be executed in a secured environment.
    In the API Route the current scope is checked (and possibly stored), then the client is redirected to the preview.

## 7.0.0-beta.6

## 7.0.0-beta.5

### Major Changes

-   7f1e78448: Remove `next/link` legacy behavior as default behavior

    Previously, Next required the `Link` component to have a child `<a>` tag. To style this tag correctly in the application, none of the library link blocks (`DamFileDownloadLinkBlock`, `ExternalLinkBlock`, `EmailLinkBlock`, `InternalLinkBlock`, and `PhoneLinkBlock`) rendered the tag, but cloned the children with the correct props instead.

    However, since Next v13 the `Link` component no longer requires a child `<a>` tag. Consequently, we don't need to render the tag for the `InternalLinkBlock` (which uses `Link` internally) anymore. In order to style all link blocks correctly, we now render an `<a>` tag for all other link blocks.

    **Upgrade**

    To upgrade, either remove all `<a>` tags from your link block usages, or add the `legacyBehavior` prop to all library link blocks.

## 7.0.0-beta.4

### Major Changes

-   15eb9e173: Revise `PixelImageBlock` to correctly use the "new" `next/image` component

    See the [docs](https://nextjs.org/docs/pages/api-reference/components/image-legacy#comparison) for a comparison between the new and the legacy component.

    **Migrate**

    Remove the `layout` prop from the block as it can lead to errors with the default implementation (`layout="responsive"` is not compatible with the new `fill` prop).

    -   `layout={"responsive" | "inherit"}` can safely be removed

        ```diff
        <PixelImageBlock
            data={block.props}
            aspectRatio={aspectRatio}
        -   layout={"responsive"}   // line is marked as deprecated, but "responsive" must be removed
            {...imageProps}
        />
        ```

    -   `layout={"fill"}` can be replaced with `fill={true}`

        ```diff
        <PixelImageBlock
            data={block.props}
            aspectRatio={aspectRatio}
        -   layout={"fill"}
        +   fill
            {...imageProps}
        />
        ```

    Notes:

    The `PixelImageBlock` is usually wrapped in a `DamImageBlock` in the application. The `layout` prop should be removed from it as well.

    You can use the newly added `fill` prop of the `next/image` component by embedding the `PixelImageBlock` in a parent element that assigns the `position` style. See the [docs](https://nextjs.org/docs/pages/api-reference/components/image#fill) for more information.

-   a58918893: Remove `aspectRatio` from `YouTubeBlock`

    The block's aspect ratio options (4x3, 16x9) proved too inflexible to be of actual use in an application. Therefore, the aspect ratio field was removed. It should be defined in the application instead.

    **Migrate**

    The block requires an aspect ratio in the site. It should be set using the `aspectRatio` prop (default: `16x9`):

    ```diff
     <YouTubeVideoBlock
       data={video}
    +  aspectRatio="9x16"
     />
    ```

### Minor Changes

-   cf9496fdb: Add `legacyPagesRouterSitePreviewApiHandler` helper

    Used to enable the site preview (Preview Mode) for projects which use the Pages Router. This helper is added to ease migrating. New projects should use the App Router instead.

-   b7560e3a7: Add preview image to `YouTubeVideoBlock` and `DamVideoBlock`

    The `YouTubeVideoBlock` and the `DamVideoBlock` now support a preview image out of the box. For customisation the default `VideoPreviewImage` component can be overridden with the optional `renderPreviewImage` method.

    It is recommended to replace the custom implemented video blocks in the projects with the updated `YouTubeVideoBlock` and `DamVideoBlock` from the library.

## 7.0.0-beta.3

## 7.0.0-beta.2

## 7.0.0-beta.1

## 7.0.0-beta.0

### Major Changes

-   4f32ad014: Bump styled-components peer dependency to v6

    Follow the official [migration guide](https://styled-components.com/docs/faqs#what-do-i-need-to-do-to-migrate-to-v6) to upgrade.

-   9351b1452: Upgrade to Next 14 and React 18

    Add "use client" directive to components that currently require it (as they use styled-components or a context)

-   86358bf87: Fix an issue where the block preview could break a block's styling and HTML structure

    This was caused by a `div` added around every block to enable the selection and highlighting of the block in the block preview.
    The `div` is still present but now uses `display: contents`, so its effect should be minimal.

    Common issues that should now be resolved include:

    -   The image inside, e.g., a `PixelImageBlock`, would not be visible because the image's size depends on the parent `div`'s size.
    -   Blocks used as children of elements with `display: flex` or `display: grid` could not position themselves correctly.

-   6986cdc82: Require `aspectRatio` prop for `PixelImageBlock` and `Image`

    The `16x9` default aspect ratio has repeatedly led to incorrectly displayed images on the site.
    Therefore, it has been removed.
    Instead, consider which aspect ratio to use for each image.

    **Example**

    ```diff
    <PixelImageBlock
      data={teaser}
      layout="fill"
    + aspectRatio="16x9"
    />
    ```

-   ae0142029: Support single host for block preview

    The content scope is passed through the iframe-bridge in the admin and accessible in the site in the IFrameBridgeProvider.
    Breaking: `previewUrl`-property of `SiteConfig` has changed to `blockPreviewBaseUrl`

### Minor Changes

-   36cdd70f1: Deprecate `InternalLinkBlock` component, instead there should be a copy of this component in the application for flexibility (e.g., support for internationalized routing)
-   6d56606a8: Store site preview scope in cookie and add `previewParams()` helper to access it

    -   Requires the new `SITE_PREVIEW_SECRET` environment variable that must contain a random secret (not required for local development)
    -   Requires a Route Handler located at `app/api/site-preview/route.ts`:
    -   The previewParams() return a promise

        ```ts
        import { sitePreviewRoute } from "@comet/cms-site";
        import { createGraphQLFetch } from "@src/util/graphQLClient";
        import { type NextRequest } from "next/server";

        export const dynamic = "force-dynamic";

        export async function GET(request: NextRequest) {
            return sitePreviewRoute(request, createGraphQLFetch());
        }
        ```

-   a80ab10f3: Add GraphQL fetch client

    -   `createGraphQLFetch`: simple graphql client around fetch, usage: createGraphQLFetch(fetch, url)(gql, variables)
    -   `type GraphQLFetch = <T, V>(query: string, variables?: V, init?: RequestInit) => Promise<T>`
    -   `gql` for tagging queries
    -   `createFetchWithDefaults` fetch decorator that adds default values (eg. headers or next.revalidate)
    -   `createFetchWithPreviewHeaders` fetch decorator that adds comet preview headers (based on SitePreviewData)

    Example helper in application:

    ```
    export const graphQLApiUrl = `${typeof window === "undefined" ? process.env.API_URL_INTERNAL : process.env.NEXT_PUBLIC_API_URL}/graphql`;
    export function createGraphQLFetch(previewData?: SitePreviewData) {
        return createGraphQLFetchLibrary(
            createFetchWithDefaults(createFetchWithPreviewHeaders(fetch, previewData), { next: { revalidate: 15 * 60 } }),
            graphQLApiUrl,
        );

    }
    ```

    Usage example:

    ```
    const graphqlFetch = createGraphQLFetch(previewData);
    const data = await graphqlFetch<GQLExampleQuery, GQLExampleQueryVariables>(
        exampleQuery,
        {
            exampleVariable: "foo"
        }
    );
    ```

-   fc27014bc: Add new technique for blocks to load additional data at page level when using SSR

    This works both server-side (SSR, SSG) and client-side (block preview).

    New Apis:

    -   `recursivelyLoadBlockData`: used to call loaders for a block data tree
    -   `BlockLoader`: type of a loader function that is responsible for one block
    -   `useBlockPreviewFetch`: helper hook for block preview that creates client-side caching graphQLFetch/fetch
    -   `BlockLoaderDependencies`: interface with dependencies that get passed through recursivelyLoadBlockData into loader functions. Can be extended using module augmentation in application to inject eg. pageTreeNodeId.

-   769bd72f0: Uses the Next.JS Preview mode for the site preview

    The preview is entered by navigating to an API-Route in the site, which has to be executed in a secured environment.
    In the API-Routes the current scope is checked (and possibly stored), then the client is redirected to the Preview.

    // TODO Move the following introduction to the migration guide before releasing

    Requires following changes to site:

    -   Import `useRouter` from `next/router` (not exported from `@comet/cms-site` anymore)
    -   Import `Link` from `next/link` (not exported from `@comet/cms-site` anymore)
    -   Remove preview pages (pages in `src/pages/preview/` directory which call `createGetUniversalProps` with preview parameters)
    -   Remove `createGetUniversalProps`
        -   Just implement `getStaticProps`/`getServerSideProps` (Preview Mode will SSR automatically)
        -   Get `previewData` from `context` and use it to configure the GraphQL Client
    -   Add `SitePreviewProvider` to `App` (typically in `src/pages/_app.tsx`)
    -   Provide a protected environment for the site
        -   Make sure that a Authorization-Header is present in this environment
        -   Add a Next.JS API-Route for the site preview (eg. `/api/site-preview`)
        -   Call `getValidatedSitePreviewParams()` in the API-Route (calls the API which checks the Authorization-Header with the submitted scope)
        -   Use the `path`-part of the return value to redirect to the preview

    Requires following changes to admin

    -   The `SitesConfig` must provide a `sitePreviewApiUrl`

## 6.17.1

## 6.17.0

## 6.16.0

## 6.15.1

## 6.15.0

## 6.14.1

### Patch Changes

-   84a25adeb: Remove `<a>` tag from `DamFileDownloadLinkBlock`

    The block incorrectly added the tag which prevents styling it in the application. The tag has been removed to achieve the same behavior as in the other link blocks, e.g. `ExternalLinkBlock`.

## 6.14.0

### Minor Changes

-   73dfb61c9: Add `PhoneLinkBlock` and `EmailLinkBlock`

## 6.13.0

### Minor Changes

-   493cad7e1: Add `DamVideoBlock`

## 6.12.0

### Minor Changes

-   3ee8c7a33: Add a `DamFileDownloadLinkBlock` that can be used to download a file or open it in a new tab

    Also, add new `/dam/files/download/:hash/:fileId/:filename` endpoint for downloading assets.

## 6.11.0

## 6.10.0

### Minor Changes

-   5c1ab80d6: SeoBlock: Change Open Graph image to recommended size and aspect ratio (`1200x630`)

## 6.9.0

## 6.8.0

## 6.7.0

## 6.6.2

## 6.6.1

## 6.6.0

## 6.5.0

### Minor Changes

-   2f64daa9b: Add `title` field to link block

    Perform the following steps to use it in an application:

    1. API: Use the new `createLinkBlock` factory to create the LinkBlock:

        ```ts
        import { createLinkBlock } from "@comet/cms-api";

        // ...

        const LinkBlock = createLinkBlock({
            supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock, news: NewsLinkBlock },
        });
        ```

    2. Site: Pass the `title` prop to LinkBlock's child blocks:

    ```diff
    const supportedBlocks: SupportedBlocks = {
    -   internal: ({ children, ...props }) => <InternalLinkBlock data={props}>{children}</InternalLinkBlock>,
    +   internal: ({ children, title, ...props }) => <InternalLinkBlock data={props} title={title}>{children}</InternalLinkBlock>,
        // ...
    };
    ```

## 6.4.0

## 6.3.0

## 6.2.1

## 6.2.0

### Minor Changes

-   34bb33fe: Add `SeoBlock`

    Can be used as a drop-in replacement for `SeoBlock` defined in application code. Add a `resolveOpenGraphImageUrlTemplate` to resolve the correct image URL template when using a custom Open Graph image block.

    **Example Default Use Case:**

    ```tsx
    <SeoBlock data={exampleData} title={"Some Example Title"} />
    ```

    **Example Custom Use Case:**

    ```tsx
    <SeoBlock<SomeCustomImageBlockType>
        data={exampleData}
        title={"Some Example Title"}
        resolveOpenGraphImageUrlTemplate={(block) => block.some.path.to.urlTemplate}
    />
    ```

## 6.1.0

## 6.0.0

## 5.6.0

## 5.5.0

## 5.4.0

### Minor Changes

-   f9063860: Add `hasRichTextBlockContent` helper

    The helper can be used to conditionally render a `RichTextBlock`.

    **Example:**

    ```tsx
    import { hasRichTextBlockContent } from "@comet/cms-site";

    function TeaserBlock({ data: { image, text } }: PropsWithData<TeaserBlockData>) {
        return (
            <>
                <DamImageBlock data={image} />
                {hasRichTextBlockContent(text) && <RichTextBlock data={text} />}
            </>
        );
    }
    ```

## 5.3.0

## 5.2.0

### Minor Changes

-   6244d6cd: Add the `YouTubeVideoBlock` to the `@comet/cms-site` package.

## 5.1.0

## 5.0.0

## 4.7.0

## 4.6.0

## 4.5.0

## 4.4.3

## 4.4.2

## 4.4.1

## 4.4.0

## 4.3.0

## 4.2.0

## 4.1.0

### Patch Changes

-   51466b1a: Fix router.push() and router.replace() in site preview
