---
"@dextinity/mail-react": minor
---

Add `resolveImageSrc` to `Config`

The function returns the `src` that `HtmlImage`, `MjmlImage`, `HtmlPixelImageBlock` and `MjmlPixelImageBlock` render for an image, including the image in classic Outlook's VML. Use it when mail clients can't load an image from its own URL, e.g. to reference an attachment of the sent mail instead:

```tsx
<MjmlMailRoot config={{ resolveImageSrc: ({ src }) => `cid:${contentIdFor(src)}` }}>
    <MailContent />
</MjmlMailRoot>
```
