# @comet/mail-react

## 10.1.0

### Minor Changes

- b0577d5: Add `list` to the RichText block's `blockTypes`, so a custom block type renders as a list

    Use it for a list in more than one text variant. A draft block has only one block type, so each variant needs a block type of its own.

    **Example**

    ```tsx
    export const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock({
        blockTypes: {
            "unordered-list-item": { variant: "copy" },
            "unordered-list-item-large": { variant: "copyLarge", list: "unordered" },
            "ordered-list-item-large": { variant: "copyLarge", list: "ordered" },
        },
    });
    ```

    For backward compatibility, `unordered-list-item` and `ordered-list-item` still render as lists without `list`.

## 10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/mail-react` to `@dextinity/mail-react`

    Update the dependency in `package.json` and all imports:

    ```diff
    - import { MjmlPixelImageBlock } from "@comet/mail-react";
    + import { MjmlPixelImageBlock } from "@dextinity/mail-react";
    ```

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/mail-react` to `@dextinity/mail-react`

    Update the dependency in `package.json` and all imports:

    ```diff
    - import { MjmlPixelImageBlock } from "@comet/mail-react";
    + import { MjmlPixelImageBlock } from "@dextinity/mail-react";
    ```

## 9.5.0

## 9.4.0

### Minor Changes

- 6a50452: Add `theme.list.unorderedMarker` and `theme.list.orderedMarker` for the markers of the lists the RichText block renders

    Each marker is either a fixed node or a function of the item's zero-based `index` in its own list and that list's `depth`:

    ```tsx
    const theme = createTheme({
        list: {
            unorderedMarker: ({ depth }) => ["▪", "–", "·"][depth % 3],
            // 97 is the code of "a", so nested items are lettered a., b., c.
            orderedMarker: ({ index, depth }) => (depth === 0 ? `${index + 1}.` : `${String.fromCharCode(97 + index)}.`),
        },
    });
    ```

- 706e44e: Fix the stray `mj-text` tag and spacing in the RichText block's nested lists

    A nested level rendered a literal `mj-text` tag into the compiled mail, and the text variant's block spacing fell below that level's last item instead of below the whole list.

    A nested table no longer carries the variant modifier — scope such a rule to the outermost list's variant, which reaches every level. Two new modifiers name a level directly: `richTextBlock__list--depth<Level>` and `richTextBlock__list--nested`.

- b5ab577: Space rich-text list items evenly at every nesting level

    `list.itemSpacing` now also applies above a nested level's first item, on the row's `richTextBlock__listItem--itemSpacingAbove` class.

### Patch Changes

- e60e17b: Fix crash in the RichText block when it starts with a nested list item

    An editor produces this by pressing Tab on the first item of a list, or by clearing the text of the item above a nested one.

- d1f2040: Fix the RichText block's ordered list markers (e.g. `10.`) breaking over two lines in Outlook on the web
- af14a71: Fix the full-width button overflowing its container in some webmail clients

    A `MjmlButton` or `HtmlButton` with `fullWidth` set rendered wider than the content around it, reaching past the edge of the mail body.

## 9.3.0

### Minor Changes

- 80458d2: Add `theme.list` spacing tokens for the lists rendered by the RichText block

    `indent` sets the space before the marker, `markerGap` the space between the marker and the item's text, and `itemSpacing` the space between items. All three accept responsive values.

    ```ts
    const theme = createTheme({
        list: {
            indent: { default: 24, mobile: 16 },
            markerGap: 12,
            itemSpacing: 8,
        },
    });
    ```

### Patch Changes

- c010180: Fix `MjmlDivider` breaking the surrounding layout

    A section or column that came after the one holding an `MjmlDivider` rendered outside its wrapper or group instead of inside it. In a section using `disableResponsiveBehavior` (which keeps its columns side-by-side on mobile instead of stacking), the columns' shared wrapper broke, so the following column stacked anyway. In an `MjmlWrapper`, the background stopped after the section holding the divider, so every section below it lost the background.

    `MjmlDivider` now wraps its divider `<table>` in an extra row and cell. The class names stay on the `<table>`, so descendant selectors still match — but a selector using a direct-child combinator that expected the table to sit immediately inside the column will need updating, since there's now a `<tr><td>` in between.

- 1252ae5: Fix inline links losing their color in Outlook on Windows

    `HtmlInlineLink` rendered blue in Outlook on Windows instead of matching the text around it, unless the theme set a base text color. The base text theme now defines one, so links match without any configuration.

    As a result, a text color set through the `MjmlMailRoot` `attributes` slot no longer applies — set it on `theme.text` or on a text variant instead.

- 6c2fd10: Fix inconsistent spacing of rich-text lists across email clients by rendering each list as a table instead of `<ul>` / `<ol>`
    - `richTextBlock__listItem` is now a `<tr>` instead of an `<li>`, so margin and padding set on it no longer apply. Every row but the last carries `richTextBlock__listItem--itemSpacing`, with the spacing on its cells.
    - List cells restate the text styles inline, so a rule targeting list text needs `!important`. The cells carry `richTextBlock__listItemMarker` and `richTextBlock__listItemText`.
    - The table carries a modifier naming its text variant, such as `richTextBlock__list--variantBody`, and one naming its list type, `richTextBlock__list--ordered` or `richTextBlock__list--unordered`.

## 9.2.2

## 9.2.1

## 9.2.0

## 9.1.1

## 9.1.0

## 9.0.1

## 9.0.0

### Major Changes

- 568ee9a: `MjmlImage` is now responsive by default

    The inner `<img>` height scales to `auto` below the default breakpoint instead of staying at its declared pixel value, so the image keeps its aspect ratio as its width shrinks on narrow viewports.

- f503e9e: `MjmlDivider` now supports `variant`, `height`, `backgroundColor`, and `backgroundImage` props, configured through `theme.divider`
    - `theme.divider` defines the default `height` and `backgroundColor`
    - `theme.divider.variants` overrides those values for named variants, optionally with per-breakpoint responsive values
    - `theme.divider.backgroundImage` (typically a gradient) overlays the bar while `backgroundColor` stays as the solid fallback for clients that don't render gradients
    - Per-instance `height`, `backgroundColor`, and `backgroundImage` props override the resolved theme/variant values

    **Example theme**

    ```ts
    import { createTheme } from "@comet/mail-react";

    const theme = createTheme({
        divider: {
            defaultVariant: "thin",
            variants: {
                thin: { height: "1px", backgroundColor: "#999999" },
                thick: { height: { default: "12px", mobile: "8px" }, backgroundColor: "#222222" },
                gradient: {
                    backgroundColor: "#5B4FC7",
                    backgroundImage: "linear-gradient(to right, #5B4FC7, #FF6B6B, #FFD166)",
                },
            },
        },
    });

    declare module "@comet/mail-react" {
        interface DividerVariants {
            thin: true;
            thick: true;
            gradient: true;
        }
    }
    ```

    Usage:

    ```tsx
    import { MjmlDivider, MjmlMailRoot } from "@comet/mail-react";

    <MjmlMailRoot theme={theme}>
        <MjmlSection>
            <MjmlColumn>
                <MjmlDivider />
                <MjmlDivider variant="thick" />
                <MjmlDivider variant="gradient" />
                <MjmlDivider height="2px" backgroundColor="#FF0000" />
            </MjmlColumn>
        </MjmlSection>
    </MjmlMailRoot>;
    ```

    **Breaking changes**
    - The `MjmlDivider` prop surface no longer accepts `borderWidth`, `borderColor`, `borderStyle`, `padding` and its variants, `width`, `containerBackgroundColor`, `align`, or `cssClass`. Migrate `borderWidth` to `height` and `borderColor` to `backgroundColor`, either per-call or on `theme.divider`.
    - `MjmlDivider` no longer applies any default padding around the divider. Add spacing through the surrounding section or column (for example with `MjmlSpacer`).
    - `<MjmlAttributes><MjmlDivider … /></MjmlAttributes>` no longer sets defaults for `MjmlDivider`. Configure defaults through `theme.divider` instead.

### Minor Changes

- f503e9e: Add `HtmlDivider` component for rendering a themed divider inside MJML ending tags or outside the MJML context

    `HtmlDivider` reads `height`, `backgroundColor`, and `backgroundImage` from `theme.divider`, and supports named variants with per-breakpoint responsive overrides — the same shape as `theme.text`. Per-instance `height`, `backgroundColor`, and `backgroundImage` props override the resolved theme/variant values. A `backgroundImage` (typically a gradient) overlays the bar while `backgroundColor` stays as the solid fallback for clients that don't render gradients.

    ```tsx
    import { HtmlDivider } from "@comet/mail-react";

    <MjmlRaw>
        <HtmlDivider />
        <HtmlDivider variant="thick" />
        <HtmlDivider height="2px" backgroundColor="#FF0000" />
        <HtmlDivider backgroundImage="linear-gradient(to right, red, blue)" />
    </MjmlRaw>;
    ```

    **Example theme**

    ```ts
    import { createTheme } from "@comet/mail-react";

    const theme = createTheme({
        divider: {
            defaultVariant: "thin",
            variants: {
                thin: { height: "1px", backgroundColor: "#999999" },
                thick: { height: { default: "12px", mobile: "8px" }, backgroundColor: "#222222" },
                gradient: {
                    backgroundColor: "#5B4FC7",
                    backgroundImage: "linear-gradient(to right, #5B4FC7, #FF6B6B, #FFD166)",
                },
            },
        },
    });

    declare module "@comet/mail-react" {
        interface DividerVariants {
            thin: true;
            thick: true;
            gradient: true;
        }
    }
    ```

- 568ee9a: Add `HtmlImage` component

    Renders an `<img>` tag that adapts to its container width below the default breakpoint. Use within raw HTML context — HTML-only emails or MJML ending tags like `MjmlRaw`.

    ```tsx
    import { HtmlImage } from "@comet/mail-react";

    <HtmlImage src="https://example.com/banner.png" width="600" height="300" alt="Banner" />;
    ```

- 1852cfc: Add `HtmlInlineLink` component

    Renders an `<a>` tag that inherits text styles from the surrounding `HtmlText` or `MjmlText` component, working around Outlook Desktop's built-in "Hyperlink" character style that overrides natural CSS inheritance with blue color and Times New Roman.

    ```tsx
    <MjmlText>
        Visit our <HtmlInlineLink href="https://example.com">website</HtmlInlineLink> for details.
    </MjmlText>
    ```

- 09e9d03: Add `HtmlText` component for rendering themed text inside MJML ending tags or outside of the MJML context

    ```tsx
    import { HtmlText } from "@comet/mail-react";

    const MyText = () => (
        <MjmlRaw>
            <table>
                <tr>
                    <HtmlText variant="heading" bottomSpacing>
                        Heading inside raw HTML
                    </HtmlText>
                </tr>
            </table>
        </MjmlRaw>
    );
    ```

    Supports an optional `element` prop to render as any HTML element instead of the default `<td>`.

    ```tsx
    <HtmlText element="div">Rendered as a div</HtmlText>
    <HtmlText element="a" href="/link">Rendered as an anchor</HtmlText>
    ```

- 0cc1b06: Add config context with `Config`, `ConfigProvider`, and `useConfig`

    `Config` is an augmentable interface for runtime configuration — intended for environment-specific data. Add custom keys via TypeScript interface declaration merging:

    ```ts
    declare module "@comet/mail-react" {
        interface Config {
            myKey?: { foo: string };
        }
    }
    ```

    Define the config using the `config` prop on `MjmlMailRoot` or by mounting `ConfigProvider` directly. Use the `useConfig` hook to read the value.

- ba777cf: Add `HtmlPixelImageBlock` and `MjmlPixelImageBlock` for rendering Comet CMS `PixelImageBlockData` in emails

    Configure `MjmlMailRoot.config.pixelImageBlock` once with the API's allowed image sizes and base URL; the blocks resolve the render width and build the image URL.

    Pass `aspectRatio` (e.g. `"16x9"`) to override the DAM crop ratio.

    ```tsx
    <MjmlMailRoot
        config={{
            pixelImageBlock: {
                validSizes: [...cometConfig.images.imageSizes, ...cometConfig.images.deviceSizes],
                baseUrl: process.env.API_URL,
            },
        }}
    >
        <MjmlPixelImageBlock data={pixelImageData} width={536} />
    </MjmlMailRoot>
    ```

- a7fb42c: Add `createRichTextBlock` for rendering Comet CMS RichText block data in emails

    The factory returns an `MjmlRichTextBlock` for the MJML context and an `HtmlRichTextBlock` for raw-HTML contexts (e.g. inside `MjmlRaw`), both driven by the same configuration. The `blockTypes` option maps the application's draft block types to theme text variants or plain style values; without it, every block renders with the base theme text styles. The `linkTypes` option adds href resolvers for the application's link block types on top of the built-in `external` support. The `inline` option overrides the built-in inline styles (`BOLD`, `ITALIC`, …) or renders custom inline styles the application defines in its RTE (e.g. `HIGHLIGHT`).

    Call the factory once — at the top level of a file, not inside a component — and export the returned components:

    ```tsx
    export const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock({
        blockTypes: {
            "header-one": { variant: "heading1" },
            "paragraph-standard": { variant: "body" },
        },
    });
    ```

    Usage sites pass only the block data:

    ```tsx
    <MjmlRichTextBlock data={richTextData} />
    ```

    Call the factory again for differently-configured blocks, renaming the destructured components — e.g. a headline-only block:

    ```tsx
    export const { MjmlRichTextBlock: MjmlHeadlineRichTextBlock, HtmlRichTextBlock: HtmlHeadlineRichTextBlock } = createRichTextBlock({
        blockTypes: {
            "header-one": { variant: "heading1" },
            "header-two": { variant: "heading2" },
        },
    });
    ```

    External links render as `HtmlInlineLink`. Lists render flat as `<ul>` / `<ol>`.

- 6104af6: Add `MjmlMailRoot` component that provides the standard email skeleton (`<Mjml>`, `<MjmlHead>`, `<MjmlBody>`) with zero-padding defaults
- a7bb900: Add `head` and `attributes` props to `MjmlMailRoot`
    - `head` — `ReactNode` appended inside `<MjmlHead>` after the registered styles block.
    - `attributes` — `ReactNode` appended inside `<MjmlAttributes>` after the default `<MjmlAll>`.

    ```tsx
    <MjmlMailRoot attributes={<MjmlClass name="link" color="blue" />} head={<MjmlFont name="Foo" href="https://example.com/foo.css" />}>
        {/* email body */}
    </MjmlMailRoot>
    ```

- ea8bbe6: Add `disableResponsiveBehavior` and `slotProps` props to `MjmlSection`
- 1fd6ed9: `MjmlText` now supports `variant` and `bottomSpacing` props, configured through `theme.text`
    - `theme.text` defines static base styles, e.g., the global default font family
    - `theme.text.variants` overrides the base styles, optionally, with responsive style objects where needed
    - The `bottomSpacing` prop on `MjmlText` enables spacing below the text, as defined by the `theme.text.bottomSpacing` or `theme.text.variants.bottomSpacing` theme values
    - `MjmlMailRoot` applies the `fontFamily` from `theme.text` as the mail-wide default

    **Simple example theme**

    ```ts
    import { createTheme } from "@comet/mail-react";

    const theme = createTheme({
        text: {
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            lineHeight: "24px",
            bottomSpacing: "12px",
        },
    });
    ```

    Usage:

    ```tsx
    import { MjmlMailRoot, MjmlText } from "@comet/mail-react";

    <MjmlMailRoot theme={theme}>
        <MjmlSection>
            <MjmlColumn>
                <MjmlText bottomSpacing>Hello</MjmlText>
                <MjmlText>This is a small paragraph.</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    </MjmlMailRoot>;
    ```

    **Example theme with custom variants**

    ```ts
    import { createTheme } from "@comet/mail-react";

    const theme = createTheme({
        text: {
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            lineHeight: "24px",
            defaultVariant: "body",
            variants: {
                heading: {
                    fontSize: { default: "28px", mobile: "22px" },
                    fontWeight: 700,
                },
                body: {
                    fontSize: "16px",
                },
            },
        },
    });

    declare module "@comet/mail-react" {
        interface TextVariants {
            heading: true;
            body: true;
        }
    }
    ```

    Usage:

    ```tsx
    import { MjmlMailRoot, MjmlText } from "@comet/mail-react";

    <MjmlMailRoot theme={theme}>
        <MjmlSection>
            <MjmlColumn>
                <MjmlText variant="heading" bottomSpacing>
                    Title
                </MjmlText>
                <MjmlText bottomSpacing>Body copy uses defaultVariant, which is "body" in this theme.</MjmlText>
                <MjmlText>This is another paragraph, using the "body" variant.</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    </MjmlMailRoot>;
    ```

- ed3b395: Add `registerStyles` for component-level responsive CSS

    Register CSS styles at module scope via `registerStyles`. Registered styles are automatically rendered as `<mj-style>` elements in `<MjmlHead>` by `MjmlMailRoot`. Styles can be static CSS strings or functions that receive the active theme.

- 5e626ca: Add `renderMailHtml` function via `/server` and `/client` sub-path exports

    The new `renderMailHtml` function handles the full React → MJML → HTML pipeline in a single call, returning `{ html, mjmlWarnings }`.
    Use `@comet/mail-react/server` in Node.js environments and `@comet/mail-react/client` in browser environments.

    **Example**

    ```ts
    // In a Node.js context (e.g. email sending service):
    import { renderMailHtml } from "@comet/mail-react/server";

    const { html, mjmlWarnings } = renderMailHtml(<MyEmail />);
    ```

    ```ts
    // In a browser context (e.g. Storybook, preview):
    import { renderMailHtml } from "@comet/mail-react/client";

    const { html, mjmlWarnings } = renderMailHtml(<MyEmail />);
    ```

- ed3b395: Add `ResponsiveValue<T>` type with `getDefaultFromResponsiveValue` and `getResponsiveOverrides` helpers

    Generic type for breakpoint-aware theme tokens. A `ResponsiveValue` is either a plain value or an object keyed by breakpoint names with a required `default`. The helpers resolve the default value for inline styles and extract per-breakpoint overrides for media queries.

    Use this when augmenting the theme with values that should vary per breakpoint, e.g. a custom `titleFontSize: ResponsiveValue`.

- ed3b395: Add `indent` prop to `MjmlSection` for content indentation

    `MjmlSection` now accepts an optional `indent` boolean prop that applies left/right padding based on `theme.sizes.contentIndentation`. The default indentation is applied as inline padding, with responsive overrides via registered media queries.

- 2e9b518: Add Storybook addon preset at `@comet/mail-react/storybook`

    Consumers add a single line to `.storybook/main.ts` to get a complete mail development setup:

    ```ts
    const config: StorybookConfig = {
        addons: ["@comet/mail-react/storybook"],
    };
    ```

    The preset auto-registers:
    - A **mail renderer decorator** that wraps stories in `<MjmlMailRoot>` and renders them to HTML
    - A **"Copy Mail HTML"** toolbar button to copy the rendered email HTML to the clipboard
    - A **"Use public image URLs"** toggle to replace image sources with public placeholder URLs (useful for testing on external services like Email on Acid)
    - An **"MJML Warnings"** panel showing validation warnings with a badge count

- a0fef0b: Add theme background colors

    Add a `colors` key to the theme with `background.body` and `background.content` defaults. `MjmlMailRoot` now applies `theme.colors.background.body` as the body background color, and `MjmlSection` applies `theme.colors.background.content` as the default section background when a theme is present. An explicit `backgroundColor` prop on `MjmlSection` always takes precedence.

    **Example**

    ```tsx
    const theme = createTheme({
        colors: {
            background: {
                body: "#EAEAEA",
                content: "#F8F8F8",
            },
        },
    });

    <MjmlMailRoot theme={theme}>
        <MjmlSection>{/* Section gets #F8F8F8 background from theme */}</MjmlSection>
        <MjmlSection backgroundColor="#FF0000">{/* Explicit prop overrides theme default */}</MjmlSection>
    </MjmlMailRoot>;
    ```

- 59e9904: Add theme system with `createTheme`, `ThemeProvider`, and `useTheme`

    `createTheme` produces a `Theme` with layout design tokens (`sizes.bodyWidth`, `breakpoints.default`, `breakpoints.mobile`). Pass an overrides object to customize sizes and breakpoints — breakpoint values are constructed with `createBreakpoint`. All theme interfaces support TypeScript module augmentation for project-specific extensions.

    `MjmlMailRoot` now accepts an optional `theme` prop. When provided, it sets the email body width and MJML responsive breakpoint from the theme.

- 124d889: Add theme support to `MjmlButton` and add a new `HtmlButton` component

    `MjmlButton` now supports theme-based styling through `theme.button`, an optional `variant` prop, and a `fullWidth` prop that makes the button span its container. `HtmlButton` provides the same theming for MJML ending tags and other raw-HTML contexts.
    - `theme.button` sets the base button styling (color, background, border, border radius, font, and inner padding); `theme.button.variants` overrides those per named variant, optionally with per-breakpoint responsive values
    - `theme.button.backgroundImage` (typically a gradient) overlays `backgroundColor`, which stays as the solid fallback for clients that don't render gradients (notably Outlook)
    - `HtmlButton` has no alignment prop; horizontal placement is handled by the containing cell or layout
    - Existing `MjmlButton` usages are unchanged when no `theme.button` is configured

    **Example theme**

    ```ts
    import { createTheme } from "@comet/mail-react";

    const theme = createTheme({
        button: {
            borderRadius: "6px",
            padding: "12px 28px",
            defaultVariant: "primary",
            variants: {
                primary: { backgroundColor: "#5B4FC7", color: "#FFFFFF" },
                gradient: {
                    backgroundColor: "#5B4FC7",
                    backgroundImage: "linear-gradient(to right, #5B4FC7, #FF6B6B)",
                    color: "#FFFFFF",
                },
            },
        },
    });

    declare module "@comet/mail-react" {
        interface ButtonVariants {
            primary: true;
            gradient: true;
        }
    }
    ```

    Usage:

    ```tsx
    import { MjmlButton, MjmlMailRoot } from "@comet/mail-react";

    <MjmlMailRoot theme={theme}>
        <MjmlSection>
            <MjmlColumn>
                <MjmlButton href="https://example.com">Default</MjmlButton>
                <MjmlButton href="https://example.com" variant="gradient" fullWidth>
                    Gradient, full width
                </MjmlButton>
            </MjmlColumn>
        </MjmlSection>
    </MjmlMailRoot>;
    ```

- 92a475f: `MjmlWrapper` now applies the themes content background color by default when used within a `ThemeProvider` or `MjmlMailRoot`

### Patch Changes

- ffe85a7: Add support for React 17
- 92a475f: Fix `MjmlSection` overriding `MjmlWrapper`'s background

    When rendered inside a custom `MjmlWrapper`, `MjmlSection` no longer applies its theme-default `backgroundColor`, so the wrapper's background is now visible through its sections. An explicit `backgroundColor` prop on `MjmlSection` still takes precedence. Sections rendered outside of a wrapper continue to receive the theme default as before.

- b459ec7: Reduce published package size by keeping non-runtime build artifacts out of the bundle

## 9.0.0-beta.6

### Minor Changes

- 124d889: Add theme support to `MjmlButton` and add a new `HtmlButton` component

    `MjmlButton` now supports theme-based styling through `theme.button`, an optional `variant` prop, and a `fullWidth` prop that makes the button span its container. `HtmlButton` provides the same theming for MJML ending tags and other raw-HTML contexts.
    - `theme.button` sets the base button styling (color, background, border, border radius, font, and inner padding); `theme.button.variants` overrides those per named variant, optionally with per-breakpoint responsive values
    - `theme.button.backgroundImage` (typically a gradient) overlays `backgroundColor`, which stays as the solid fallback for clients that don't render gradients (notably Outlook)
    - `HtmlButton` has no alignment prop; horizontal placement is handled by the containing cell or layout
    - Existing `MjmlButton` usages are unchanged when no `theme.button` is configured

    **Example theme**

    ```ts
    import { createTheme } from "@comet/mail-react";

    const theme = createTheme({
        button: {
            borderRadius: "6px",
            padding: "12px 28px",
            defaultVariant: "primary",
            variants: {
                primary: { backgroundColor: "#5B4FC7", color: "#FFFFFF" },
                gradient: {
                    backgroundColor: "#5B4FC7",
                    backgroundImage: "linear-gradient(to right, #5B4FC7, #FF6B6B)",
                    color: "#FFFFFF",
                },
            },
        },
    });

    declare module "@comet/mail-react" {
        interface ButtonVariants {
            primary: true;
            gradient: true;
        }
    }
    ```

    Usage:

    ```tsx
    import { MjmlButton, MjmlMailRoot } from "@comet/mail-react";

    <MjmlMailRoot theme={theme}>
        <MjmlSection>
            <MjmlColumn>
                <MjmlButton href="https://example.com">Default</MjmlButton>
                <MjmlButton href="https://example.com" variant="gradient" fullWidth>
                    Gradient, full width
                </MjmlButton>
            </MjmlColumn>
        </MjmlSection>
    </MjmlMailRoot>;
    ```

### Patch Changes

- b459ec7: Reduce published package size by keeping non-runtime build artifacts out of the bundle

## 9.0.0-beta.5

### Major Changes

- 568ee9a: `MjmlImage` is now responsive by default

    The inner `<img>` height scales to `auto` below the default breakpoint instead of staying at its declared pixel value, so the image keeps its aspect ratio as its width shrinks on narrow viewports.

- f503e9e: `MjmlDivider` now supports `variant`, `height`, `backgroundColor`, and `backgroundImage` props, configured through `theme.divider`
    - `theme.divider` defines the default `height` and `backgroundColor`
    - `theme.divider.variants` overrides those values for named variants, optionally with per-breakpoint responsive values
    - `theme.divider.backgroundImage` (typically a gradient) overlays the bar while `backgroundColor` stays as the solid fallback for clients that don't render gradients
    - Per-instance `height`, `backgroundColor`, and `backgroundImage` props override the resolved theme/variant values

    **Example theme**

    ```ts
    import { createTheme } from "@comet/mail-react";

    const theme = createTheme({
        divider: {
            defaultVariant: "thin",
            variants: {
                thin: { height: "1px", backgroundColor: "#999999" },
                thick: { height: { default: "12px", mobile: "8px" }, backgroundColor: "#222222" },
                gradient: {
                    backgroundColor: "#5B4FC7",
                    backgroundImage: "linear-gradient(to right, #5B4FC7, #FF6B6B, #FFD166)",
                },
            },
        },
    });

    declare module "@comet/mail-react" {
        interface DividerVariants {
            thin: true;
            thick: true;
            gradient: true;
        }
    }
    ```

    Usage:

    ```tsx
    import { MjmlDivider, MjmlMailRoot } from "@comet/mail-react";

    <MjmlMailRoot theme={theme}>
        <MjmlSection>
            <MjmlColumn>
                <MjmlDivider />
                <MjmlDivider variant="thick" />
                <MjmlDivider variant="gradient" />
                <MjmlDivider height="2px" backgroundColor="#FF0000" />
            </MjmlColumn>
        </MjmlSection>
    </MjmlMailRoot>;
    ```

    **Breaking changes**
    - The `MjmlDivider` prop surface no longer accepts `borderWidth`, `borderColor`, `borderStyle`, `padding` and its variants, `width`, `containerBackgroundColor`, `align`, or `cssClass`. Migrate `borderWidth` to `height` and `borderColor` to `backgroundColor`, either per-call or on `theme.divider`.
    - `MjmlDivider` no longer applies any default padding around the divider. Add spacing through the surrounding section or column (for example with `MjmlSpacer`).
    - `<MjmlAttributes><MjmlDivider … /></MjmlAttributes>` no longer sets defaults for `MjmlDivider`. Configure defaults through `theme.divider` instead.

### Minor Changes

- f503e9e: Add `HtmlDivider` component for rendering a themed divider inside MJML ending tags or outside the MJML context

    `HtmlDivider` reads `height`, `backgroundColor`, and `backgroundImage` from `theme.divider`, and supports named variants with per-breakpoint responsive overrides — the same shape as `theme.text`. Per-instance `height`, `backgroundColor`, and `backgroundImage` props override the resolved theme/variant values. A `backgroundImage` (typically a gradient) overlays the bar while `backgroundColor` stays as the solid fallback for clients that don't render gradients.

    ```tsx
    import { HtmlDivider } from "@comet/mail-react";

    <MjmlRaw>
        <HtmlDivider />
        <HtmlDivider variant="thick" />
        <HtmlDivider height="2px" backgroundColor="#FF0000" />
        <HtmlDivider backgroundImage="linear-gradient(to right, red, blue)" />
    </MjmlRaw>;
    ```

    **Example theme**

    ```ts
    import { createTheme } from "@comet/mail-react";

    const theme = createTheme({
        divider: {
            defaultVariant: "thin",
            variants: {
                thin: { height: "1px", backgroundColor: "#999999" },
                thick: { height: { default: "12px", mobile: "8px" }, backgroundColor: "#222222" },
                gradient: {
                    backgroundColor: "#5B4FC7",
                    backgroundImage: "linear-gradient(to right, #5B4FC7, #FF6B6B, #FFD166)",
                },
            },
        },
    });

    declare module "@comet/mail-react" {
        interface DividerVariants {
            thin: true;
            thick: true;
            gradient: true;
        }
    }
    ```

- 568ee9a: Add `HtmlImage` component

    Renders an `<img>` tag that adapts to its container width below the default breakpoint. Use within raw HTML context — HTML-only emails or MJML ending tags like `MjmlRaw`.

    ```tsx
    import { HtmlImage } from "@comet/mail-react";

    <HtmlImage src="https://example.com/banner.png" width="600" height="300" alt="Banner" />;
    ```

## 9.0.0-beta.4

### Minor Changes

- 0cc1b06: Add config context with `Config`, `ConfigProvider`, and `useConfig`

    `Config` is an augmentable interface for runtime configuration — intended for environment-specific data. Add custom keys via TypeScript interface declaration merging:

    ```ts
    declare module "@comet/mail-react" {
        interface Config {
            myKey?: { foo: string };
        }
    }
    ```

    Define the config using the `config` prop on `MjmlMailRoot` or by mounting `ConfigProvider` directly. Use the `useConfig` hook to read the value.

- ba777cf: Add `HtmlPixelImageBlock` and `MjmlPixelImageBlock` for rendering Comet CMS `PixelImageBlockData` in emails

    Configure `MjmlMailRoot.config.pixelImageBlock` once with the API's allowed image sizes and base URL; the blocks resolve the render width and build the image URL.

    Pass `aspectRatio` (e.g. `"16x9"`) to override the DAM crop ratio.

    ```tsx
    <MjmlMailRoot
        config={{
            pixelImageBlock: {
                validSizes: [...cometConfig.images.imageSizes, ...cometConfig.images.deviceSizes],
                baseUrl: process.env.API_URL,
            },
        }}
    >
        <MjmlPixelImageBlock data={pixelImageData} width={536} />
    </MjmlMailRoot>
    ```

- a7bb900: Add `head` and `attributes` props to `MjmlMailRoot`
    - `head` — `ReactNode` appended inside `<MjmlHead>` after the registered styles block.
    - `attributes` — `ReactNode` appended inside `<MjmlAttributes>` after the default `<MjmlAll>`.

    ```tsx
    <MjmlMailRoot attributes={<MjmlClass name="link" color="blue" />} head={<MjmlFont name="Foo" href="https://example.com/foo.css" />}>
        {/* email body */}
    </MjmlMailRoot>
    ```

## 9.0.0-beta.3

### Minor Changes

- 92a475f: `MjmlWrapper` now applies the themes content background color by default when used within a `ThemeProvider` or `MjmlMailRoot`

### Patch Changes

- 92a475f: Fix `MjmlSection` overriding `MjmlWrapper`'s background

    When rendered inside a custom `MjmlWrapper`, `MjmlSection` no longer applies its theme-default `backgroundColor`, so the wrapper's background is now visible through its sections. An explicit `backgroundColor` prop on `MjmlSection` still takes precedence. Sections rendered outside of a wrapper continue to receive the theme default as before.

## 9.0.0-beta.2

### Minor Changes

- 1852cfc: Add `HtmlInlineLink` component

    Renders an `<a>` tag that inherits text styles from the surrounding `HtmlText` or `MjmlText` component, working around Outlook Desktop's built-in "Hyperlink" character style that overrides natural CSS inheritance with blue color and Times New Roman.

    ```tsx
    <MjmlText>
        Visit our <HtmlInlineLink href="https://example.com">website</HtmlInlineLink> for details.
    </MjmlText>
    ```

- 09e9d03: Add `HtmlText` component for rendering themed text inside MJML ending tags or outside of the MJML context

    ```tsx
    import { HtmlText } from "@comet/mail-react";

    const MyText = () => (
        <MjmlRaw>
            <table>
                <tr>
                    <HtmlText variant="heading" bottomSpacing>
                        Heading inside raw HTML
                    </HtmlText>
                </tr>
            </table>
        </MjmlRaw>
    );
    ```

    Supports an optional `element` prop to render as any HTML element instead of the default `<td>`.

    ```tsx
    <HtmlText element="div">Rendered as a div</HtmlText>
    <HtmlText element="a" href="/link">Rendered as an anchor</HtmlText>
    ```

- 1fd6ed9: `MjmlText` now supports `variant` and `bottomSpacing` props, configured through `theme.text`
    - `theme.text` defines static base styles, e.g., the global default font family
    - `theme.text.variants` overrides the base styles, optionally, with responsive style objects where needed
    - The `bottomSpacing` prop on `MjmlText` enables spacing below the text, as defined by the `theme.text.bottomSpacing` or `theme.text.variants.bottomSpacing` theme values
    - `MjmlMailRoot` applies the `fontFamily` from `theme.text` as the mail-wide default

    **Simple example theme**

    ```ts
    import { createTheme } from "@comet/mail-react";

    const theme = createTheme({
        text: {
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            lineHeight: "24px",
            bottomSpacing: "12px",
        },
    });
    ```

    Usage:

    ```tsx
    import { MjmlMailRoot, MjmlText } from "@comet/mail-react";

    <MjmlMailRoot theme={theme}>
        <MjmlSection>
            <MjmlColumn>
                <MjmlText bottomSpacing>Hello</MjmlText>
                <MjmlText>This is a small paragraph.</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    </MjmlMailRoot>;
    ```

    **Example theme with custom variants**

    ```ts
    import { createTheme } from "@comet/mail-react";

    const theme = createTheme({
        text: {
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            lineHeight: "24px",
            defaultVariant: "body",
            variants: {
                heading: {
                    fontSize: { default: "28px", mobile: "22px" },
                    fontWeight: 700,
                },
                body: {
                    fontSize: "16px",
                },
            },
        },
    });

    declare module "@comet/mail-react" {
        interface TextVariants {
            heading: true;
            body: true;
        }
    }
    ```

    Usage:

    ```tsx
    import { MjmlMailRoot, MjmlText } from "@comet/mail-react";

    <MjmlMailRoot theme={theme}>
        <MjmlSection>
            <MjmlColumn>
                <MjmlText variant="heading" bottomSpacing>
                    Title
                </MjmlText>
                <MjmlText bottomSpacing>Body copy uses defaultVariant, which is "body" in this theme.</MjmlText>
                <MjmlText>This is another paragraph, using the "body" variant.</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    </MjmlMailRoot>;
    ```

- a0fef0b: Add theme background colors

    Add a `colors` key to the theme with `background.body` and `background.content` defaults. `MjmlMailRoot` now applies `theme.colors.background.body` as the body background color, and `MjmlSection` applies `theme.colors.background.content` as the default section background when a theme is present. An explicit `backgroundColor` prop on `MjmlSection` always takes precedence.

    **Example**

    ```tsx
    const theme = createTheme({
        colors: {
            background: {
                body: "#EAEAEA",
                content: "#F8F8F8",
            },
        },
    });

    <MjmlMailRoot theme={theme}>
        <MjmlSection>{/* Section gets #F8F8F8 background from theme */}</MjmlSection>
        <MjmlSection backgroundColor="#FF0000">{/* Explicit prop overrides theme default */}</MjmlSection>
    </MjmlMailRoot>;
    ```

### Patch Changes

- ffe85a7: Add support for React 17

## 9.0.0-beta.1

### Minor Changes

- 6104af6: Add `MjmlMailRoot` component that provides the standard email skeleton (`<Mjml>`, `<MjmlHead>`, `<MjmlBody>`) with zero-padding defaults
- ea8bbe6: Add `disableResponsiveBehavior` and `slotProps` props to `MjmlSection`
- ed3b395: Add `registerStyles` for component-level responsive CSS

    Register CSS styles at module scope via `registerStyles`. Registered styles are automatically rendered as `<mj-style>` elements in `<MjmlHead>` by `MjmlMailRoot`. Styles can be static CSS strings or functions that receive the active theme.

- 5e626ca: Add `renderMailHtml` function via `/server` and `/client` sub-path exports

    The new `renderMailHtml` function handles the full React → MJML → HTML pipeline in a single call, returning `{ html, mjmlWarnings }`.
    Use `@comet/mail-react/server` in Node.js environments and `@comet/mail-react/client` in browser environments.

    **Example**

    ```ts
    // In a Node.js context (e.g. email sending service):
    import { renderMailHtml } from "@comet/mail-react/server";

    const { html, mjmlWarnings } = renderMailHtml(<MyEmail />);
    ```

    ```ts
    // In a browser context (e.g. Storybook, preview):
    import { renderMailHtml } from "@comet/mail-react/client";

    const { html, mjmlWarnings } = renderMailHtml(<MyEmail />);
    ```

- ed3b395: Add `ResponsiveValue<T>` type with `getDefaultFromResponsiveValue` and `getResponsiveOverrides` helpers

    Generic type for breakpoint-aware theme tokens. A `ResponsiveValue` is either a plain value or an object keyed by breakpoint names with a required `default`. The helpers resolve the default value for inline styles and extract per-breakpoint overrides for media queries.

    Use this when augmenting the theme with values that should vary per breakpoint, e.g. a custom `titleFontSize: ResponsiveValue`.

- ed3b395: Add `indent` prop to `MjmlSection` for content indentation

    `MjmlSection` now accepts an optional `indent` boolean prop that applies left/right padding based on `theme.sizes.contentIndentation`. The default indentation is applied as inline padding, with responsive overrides via registered media queries.

- 2e9b518: Add Storybook addon preset at `@comet/mail-react/storybook`

    Consumers add a single line to `.storybook/main.ts` to get a complete mail development setup:

    ```ts
    const config: StorybookConfig = {
        addons: ["@comet/mail-react/storybook"],
    };
    ```

    The preset auto-registers:
    - A **mail renderer decorator** that wraps stories in `<MjmlMailRoot>` and renders them to HTML
    - A **"Copy Mail HTML"** toolbar button to copy the rendered email HTML to the clipboard
    - A **"Use public image URLs"** toggle to replace image sources with public placeholder URLs (useful for testing on external services like Email on Acid)
    - An **"MJML Warnings"** panel showing validation warnings with a badge count

- 59e9904: Add theme system with `createTheme`, `ThemeProvider`, and `useTheme`

    `createTheme` produces a `Theme` with layout design tokens (`sizes.bodyWidth`, `breakpoints.default`, `breakpoints.mobile`). Pass an overrides object to customize sizes and breakpoints — breakpoint values are constructed with `createBreakpoint`. All theme interfaces support TypeScript module augmentation for project-specific extensions.

    `MjmlMailRoot` now accepts an optional `theme` prop. When provided, it sets the email body width and MJML responsive breakpoint from the theme.

## 9.0.0-beta.0

## 8.20.0

## 8.19.0

## 8.18.0

## 8.17.1

## 8.17.0

## 8.16.0

## 8.15.0

## 8.14.0

### Minor Changes

- 57a7c95: Re-export all components from `@faire/mjml-react` and remove it as a `peerDependency`

## 8.13.0

## 8.12.0

### Minor Changes

- 51a213a: Add mjml-compatible versions of the following block factories
    - `BlocksBlock`
    - `ListBlock`
    - `OneOfBlock`
    - `OptionalBlock`

- b4e0609: Make this package ESM and add peer dependencies to `react` and `@faire/mjml-react`

    Previously, this package was published as a CommonJS package and had no peer dependencies.
    Now, it is published as an ESM package and has peer dependencies to `react@18` and `@faire/mjml-react@3`.

    Though this is theoretically a breaking change, we are bumping only the minor version, as this package is completely new and has no known users yet.

## 8.11.1

## 8.11.0

### Minor Changes

- b9e0968: The new `@comet/mail-react` package provides utilities for building HTML emails with React
- b9e0968: Add the `css` helper function

    Similar to the `css` function provided by styled-components or @mui/material.
    It simply returns the string passed into it but provides CSS syntax highlighting and auto-formatting when using certain IDE plugins, e.g. the "styled-components" plugin in VSCode.
