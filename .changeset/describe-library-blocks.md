---
"@dextinity/cms-api": minor
"@dextinity/brevo-api": minor
---

Describe the blocks that Dextinity provides

Every block of the library carries a description of what it is for, which reaches an application through `block-meta.json` and the generated block interfaces.

Blocks created through a factory get the description of that factory. Pass a description of your own to replace it:

```ts
const TeaserTextBlock = createRichTextBlock(
    { link: LinkBlock },
    { name: "TeaserText", description: "The text of a teaser, limited to one paragraph." },
);
```
