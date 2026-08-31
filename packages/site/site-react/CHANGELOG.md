# @comet/site-react

## 7.26.1

## 7.26.0

## 7.25.15

## 7.25.14

## 7.25.13

## 7.25.12

## 7.25.11

### Patch Changes

-   cb057eeab: Add SEO `title` property to PixelImageBlock and SvgImageBlock

## 7.25.10

## 7.25.9

## 7.25.8

## 7.25.7

## 7.25.6

## 7.25.5

## 7.25.4

## 7.25.3

### Patch Changes

-   e300d66d2: Fix the aspect ratio of the preview skeleton of images when using `fill`

## 7.25.2

## 7.25.1

### Patch Changes

-   db632346d: YouTube and Vimeo Video Block: fixed bug where the video does not start after clicking the play button in the preview image.

## 7.25.0

## 7.24.0

## 7.23.0

## 7.22.0

### Patch Changes

-   e4327e250: Add missing `"use client"` directive to `useBlockPreviewFetch`

## 7.21.1

## 7.21.0

### Minor Changes

-   ede41201a: Introduce new package `@comet/site-react`

    While `@comet/cms-site` and `@comet/site-nextjs` are Next.js specific, `@comet/site-react` is framework-agnostic and works in all React projects.
    `@comet/site-react` is pure ESM and uses SCSS modules instead of `styled-components`.

    To load the CSS, you need to import it like this in your project:

    ```ts
    import "@comet/site-react/css";
    ```

    Also make sure the css is not tree-shaken by your bundler.
