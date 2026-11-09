---
name: dextinity-mail-react
description: Guide for building HTML emails with @dextinity/mail-react and MJML. Use whenever working on email templates, mail markup, MJML components, email theming, email styling, responsive emails, column layouts, multi-column email sections, rendering Dextinity CMS block data (such as pixel-image blocks) in emails, or anything involving @dextinity/mail-react or HTML email development — even for seemingly simple tasks like putting content side-by-side in columns, since email client compatibility is a minefield that requires specific patterns and research before implementing.
---

# Building HTML Emails with @dextinity/mail-react

The usage guide for `@dextinity/mail-react` is in its Storybook. Read the relevant pages before you write or change mail markup: email clients support much less than browsers, and markup that looks correct in a browser often breaks in Outlook, Gmail or Yahoo Mail.

## Read the guide through the MCP server

When the `dextinity-mail-react` MCP server is connected:

1. Call `docs-list`.
2. Call `docs-show` for "Email Client Pitfalls", and for each page that covers the task, for example "Layout Patterns" for columns or "Dark Mode" for colors.
3. Call `docs-show` on a component for its props and example stories.

## Without the MCP server

Tell the user to connect the MCP server, for example in Claude Code:

```sh
claude mcp add --transport http dextinity-mail-react https://main--69df33e9280a36be495d6521.chromatic.com/mcp
```

Until it is connected, read the pages from https://main--69df33e9280a36be495d6521.chromatic.com/manifests/docs.json, and the props in the TSDoc of `@dextinity/mail-react` in `node_modules`.

## Decisions for the user

The guide gives starting points, not rules. When it is unclear which stacking strategy a multi-column layout needs, infer it from the content (dense text, short labels, or fixed-width icons and numbers) or ask the user.
