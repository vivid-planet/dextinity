---
title: Building HTML Emails
---

`@dextinity/mail-react` lets you build responsive, themed HTML emails using React components. Under the hood it uses [MJML](https://documentation.mjml.io/) to generate cross-client-compatible HTML. On top of the raw MJML components the library provides a theme system, higher-level wrapper components, a style utility layer, and Storybook integration for live previewing emails during development.

The guide for `@dextinity/mail-react` — installation, theme, components, blocks, layout patterns, and the pitfalls of email clients — is in its [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/mail-react_docs-intro--docs), next to the live component previews.

AI agents get the same guide as the `dextinity-mail-react` skill, which `@dextinity/agent-features` generates from the Storybook for each release. Install it with [`install-agent-features`](../../4-guides/5-installing-agent-features.md).

AI agents can also read the guide through the MCP server of the Storybook. Connect it to your agent, for example to Claude Code:

```bash
claude mcp add --transport http dextinity-mail-react https://main--69df33e9280a36be495d6521.chromatic.com/mcp
```

:::info
If you're looking for the server-side mail template system that handles template registration, dependency injection, and sending — see [Mail Templates Module](../12-mail-templates-module/index.md). `@dextinity/mail-react` focuses on building the email markup itself and integrates with the Mail Templates Module via `renderMailHtml`.
:::
