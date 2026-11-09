---
"@dextinity/cms-admin": minor
---

Add the `contentKind` prop to `BlockAdminComponentRoot`

Set it to `"page"` or `"email"` when the blocks make up a page or an email. On the top level, the Add Block Drawer then says "Will be inserted at the end of the page." instead of naming the root by its `title`.

```tsx
<BlockAdminComponentRoot title="Page" contentKind="page">
    {rootBlocksApi.content.adminUI}
</BlockAdminComponentRoot>
```
