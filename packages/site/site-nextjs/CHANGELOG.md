# @comet/site-nextjs

## 7.26.1

### Patch Changes

-   @comet/site-react@7.26.1

## 7.26.0

### Patch Changes

-   @comet/site-react@7.26.0

## 7.25.15

### Patch Changes

-   @comet/site-react@7.25.15

## 7.25.14

### Patch Changes

-   @comet/site-react@7.25.14

## 7.25.13

### Patch Changes

-   @comet/site-react@7.25.13

## 7.25.12

### Patch Changes

-   0747af7a5: Set `referrerPolicy="strict-origin-when-cross-origin"` in the `YouTubeVideoBlock`

    Apparently, YouTube recently started requiring a `Referer` header for embedded videos. If no `Referer` is present, the video fails to load ("Error 153").

    -   @comet/site-react@7.25.12

## 7.25.11

### Patch Changes

-   cb057eeab: Add SEO `title` property to PixelImageBlock and SvgImageBlock
-   Updated dependencies [cb057eeab]
    -   @comet/site-react@7.25.11

## 7.25.10

### Patch Changes

-   9b3292dad: Prevent phishing in SitePreview (for pages router)
    -   @comet/site-react@7.25.10

## 7.25.9

### Patch Changes

-   79a90e7f6: Prevent phishing in SitePreview

    Affected applications: if the property `resolvePath` of the `SitePreview` component returns the plain path. The default implementation in the starter is not affected.

    -   @comet/site-react@7.25.9

## 7.25.8

### Patch Changes

-   @comet/site-react@7.25.8

## 7.25.7

### Patch Changes

-   @comet/site-react@7.25.7

## 7.25.6

### Patch Changes

-   @comet/site-react@7.25.6

## 7.25.5

### Patch Changes

-   @comet/site-react@7.25.5

## 7.25.4

### Patch Changes

-   @comet/site-react@7.25.4

## 7.25.3

### Patch Changes

-   b1701abf4: Include `@comet/site-react` in the bundle of `@comet/site-nextjs`

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

-   Updated dependencies [e300d66d2]
    -   @comet/site-react@7.25.3

## 7.25.2

### Patch Changes

-   @comet/site-react@7.25.2

## 7.25.1

### Patch Changes

-   db632346d: YouTube and Vimeo Video Block: fixed bug where the video does not start after clicking the play button in the preview image.
-   Updated dependencies [db632346d]
    -   @comet/site-react@7.25.1

## 7.25.0

### Minor Changes

-   b421ed273: Support captions in the `DamVideoBlock`

    The captions can be set uploaded as .vtt files and linked to videos in the DAM.

### Patch Changes

-   @comet/site-react@7.25.0

## 7.24.0

### Patch Changes

-   @comet/site-react@7.24.0

## 7.23.0

### Patch Changes

-   @comet/site-react@7.23.0

## 7.22.0

### Patch Changes

-   Updated dependencies [e4327e250]
    -   @comet/site-react@7.22.0

## 7.21.1

### Patch Changes

-   c84874edf: Revert "Fix `PixelImageBlock` fixed height, auto width issue" added in v7.20.0

    In v7.20.0, height was set to `100%` for `PixelImageBlock`.
    This caused issues when the image was not wrapped, as it would inherit the height of the next parent element instead of maintaining its aspect ratio.
    Thus, we are reverting this change to restore the previous behavior.

    -   @comet/site-react@7.21.1

## 7.21.0

### Minor Changes

-   904ff5f1d: Introduce new package `@comet/site-nextjs` as copy of `@comet/cms-site`

    Changes:

    -   Remove `styled-components` as peer dependency
    -   use SCSS modules instead
    -   `@comet/site-nextjs` is pure ESM

    To load the CSS, you need to import it like this:

    ```ts
    import "@comet/site-nextjs/css";
    ```

    In Next.js you can do that in `/app/layout.tsx`.

### Patch Changes

-   Updated dependencies [ede41201a]
    -   @comet/site-react@7.21.0
