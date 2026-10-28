---
title: Rendering
---

In Storybook, the decorator handles MJML-to-HTML conversion automatically. When rendering the final HTML to send, use the `renderMailHtml` function:

```tsx title="src/emails/MyEmail.tsx"
import { MjmlMailRoot, MjmlSection, MjmlColumn, MjmlText, createTheme } from "@dextinity/mail-react";
import { renderMailHtml } from "@dextinity/mail-react/server";

const theme = createTheme({
    /* your project theme */
});

const { html, mjmlWarnings } = await renderMailHtml(
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

`renderMailHtml` accepts a React element tree and returns a promise that resolves to:

- **`html`** — the final HTML string ready for sending
- **`mjmlWarnings`** — an array of MJML validation warnings (collected, not thrown)

There is no decorator outside Storybook, so you must wrap your content in [`MjmlMailRoot`](./2-components-and-theme.md#mjmlmailroot) yourself. Optional MJML options can be passed as a second argument and are forwarded to the underlying MJML compiler. The server `renderMailHtml` turns off `mj-include` by default, because an include can read files on the server into the mail. To use `mj-include`, pass `{ ignoreIncludes: false }`. MJML only includes files by a relative path inside the directory given as `filePath` or `includePath`, for example `{ ignoreIncludes: false, filePath: "/path/to/mail/templates" }`.

### MJML Warnings

`mjmlWarnings` are non-critical validation messages from the MJML compiler — the output HTML is always produced regardless. Log them in development (as shown above) to catch structural issues early, but avoid logging in production where they would add noise to error trackers like Sentry.

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

A block without data of its own still needs its data passed, because in the block preview, the admin adds the block's route to it: `divider: (data) => <MailDividerBlock data={data} />`.

The block preview page must pass the result of `useIFrameBridge` to `useRefToRegisterMailBlocksForPreview`, and put the ref it returns on the element that contains the mail HTML:

```tsx
const mailContainerRef = useRefToRegisterMailBlocksForPreview<HTMLSpanElement>(useIFrameBridge());

return <span ref={mailContainerRef} dangerouslySetInnerHTML={{ __html: mailHtml }} />;
```
