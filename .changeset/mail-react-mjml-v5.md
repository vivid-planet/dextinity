---
"@dextinity/mail-react": major
---

Update MJML to v5 and make `renderMailHtml` asynchronous

MJML 5 renders asynchronously, so `renderMailHtml` from `@dextinity/mail-react/server` and `@dextinity/mail-react/client` now returns a promise. Await it:

```diff
- const { html, mjmlWarnings } = renderMailHtml(<MyMail />);
+ const { html, mjmlWarnings } = await renderMailHtml(<MyMail />);
```

If your application lists `mjml` in its own `package.json`, update it to v5 as well.

MJML 5 also changes the generated HTML: it minifies more aggressively, generates the `<body>` from `mj-body` (moving its `class` to `<body>` and its background color to the inner `<div>`), and applies the `inner-padding` of `mj-hero` in every client. Such changes can affect how a mail looks, especially in combination with client-specific workarounds. See the [MJML 5 release notes](https://github.com/mjmlio/mjml/releases/tag/v5.0.0) and test your mails in every mail client you support.
