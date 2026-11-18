---
title: Rendering
---

In Storybook, the decorator handles MJML-to-HTML conversion automatically. When rendering the final HTML to send, use the `renderMailHtml` function:

```tsx title="src/emails/MyEmail.tsx"
import {
    MjmlMailRoot,
    MjmlSection,
    MjmlColumn,
    MjmlText,
    createTheme,
} from "@dextinity/mail-react";
import { renderMailHtml } from "@dextinity/mail-react/server";

const theme = createTheme({/* your project theme */});

const { html, mjmlWarnings } = renderMailHtml(
    <MjmlMailRoot theme={theme}>
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText>Hello, world!</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    </MjmlMailRoot>,
);

if (process.env.NODE_ENV === "development" && mjmlWarnings.length) {
    console.warn(`${mjmlWarnings.length} MJML Warnings`, mjmlWarnings);
}
```

`renderMailHtml` accepts a React element tree and returns:

- **`html`** — the final HTML string ready for sending
- **`mjmlWarnings`** — an array of MJML validation warnings (collected, not thrown)

There is no decorator outside Storybook, so you must wrap your content in [`MjmlMailRoot`](./2-components-and-theme.md#mjmlmailroot) yourself. Optional MJML options can be passed as a second argument and are forwarded to the underlying MJML compiler. The server `renderMailHtml` turns off `mj-include` by default, because an include can read files on the server into the mail. To use `mj-include`, pass `{ ignoreIncludes: false }`.

### MJML Warnings

`mjmlWarnings` are non-critical validation messages from the MJML compiler — the output HTML is always produced regardless. Log them in development (as shown above) to catch structural issues early, but avoid logging in production where they would add noise to error trackers like Sentry.

## Rewriting image sources

`config.rewriteImageSrc` returns the `src` that `HtmlImage` and `MjmlImage` render for an image, including the image in classic Outlook's VML. `HtmlPixelImageBlock` and `MjmlPixelImageBlock` render through these components, so the function applies to them as well. It receives the image's `src`, `width` and `height`.

Use it when mail clients can't load an image from its own URL, e.g. because the API is behind an auth proxy. The function can hand out a `cid:` reference instead and remember the image, so it can be attached to the sent mail once the mail is rendered:

```tsx
import { MjmlMailRoot } from "@dextinity/mail-react";
import { renderMailHtml } from "@dextinity/mail-react/server";
import { randomUUID } from "node:crypto";

const contentIdsBySrc = new Map<string, string>();

function registerInlineImage(src: string): string {
    const contentId = contentIdsBySrc.get(src) ?? randomUUID();
    contentIdsBySrc.set(src, contentId);
    return contentId;
}

const { html } = renderMailHtml(
    <MjmlMailRoot config={{ rewriteImageSrc: ({ src }) => `cid:${registerInlineImage(src)}` }}>
        <MailContent />
    </MjmlMailRoot>,
);

// Fetch each image of contentIdsBySrc and pass it as an attachment with its `cid`
```

The rendering is synchronous, so the function can't fetch an image itself.

## Integration with the Mail Templates Module

If you are using the [Mail Templates Module](../12-mail-templates-module/index.md), call `renderMailHtml` inside your `.mail.tsx` file's `generateMail` method. See the [Mail Templates Module docs](../12-mail-templates-module/index.md#using-react) for a complete example.

## Browser Environments

For browser-based rendering (e.g., admin preview panels), import from the `/client` sub-path instead:

```ts
import { renderMailHtml } from "@dextinity/mail-react/client";
```

The API is identical. The only difference is the underlying MJML compiler: `/server` uses `mjml` (requires Node.js), while `/client` uses `mjml-browser` (works without `fs`).

## Block preview in the admin

To make mail blocks selectable in the admin's block preview, wrap each block in `withPreview` and apply the `className` it passes to the block's root element:

```tsx
export const MailTextBlock = withPreview<PropsWithData<MailTextBlockData>>(
    ({ data, className }) => (
        <MjmlSection className={className}>
            <MjmlColumn>
                <MjmlText>{data.text}</MjmlText>
            </MjmlColumn>
        </MjmlSection>
    ),
    { label: "Text" },
);
```

The rich-text components have no root element of their own. For a rich text inside a column, pass the `className` to the rich-text component's `textClassName`: it puts the class on each of its text elements.

A block without data of its own still needs its data passed, because in the block preview, the admin adds the block's route to it: `divider: (data) => <MailDividerBlock data={data} />`.

The block preview page must pass the result of `useIFrameBridge` to `useRefToRegisterMailBlocksForPreview`, and put the ref it returns on the element that contains the mail HTML:

```tsx
const mailContainerRef = useRefToRegisterMailBlocksForPreview<HTMLSpanElement>(useIFrameBridge());

return <span ref={mailContainerRef} dangerouslySetInnerHTML={{ __html: mailHtml }} />;
```
