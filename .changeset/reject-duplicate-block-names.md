---
"@dextinity/cms-api": major
---

Fail when two different blocks have the same name

Blocks with the same name ended up as two interfaces of the same name in `blocks.generated.ts`, and the block clipboard mixed them up. This went unnoticed, for instance when a block factory was called twice without a name.

`getBlocksMeta()` now throws when two different blocks it reaches have the same name. The API generates the block meta on start when it can write `block-meta.json`, so it fails to start locally in this case. Pass a different name to one of the blocks:

```ts
export const MailRichTextBlock = createRichTextBlock({ link: MailLinkBlock }, "MailRichText");
```
