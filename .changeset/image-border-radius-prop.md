---
"@dextinity/mail-react": minor
---

Add a `borderRadius` prop to `MjmlImage`, `HtmlImage`, `MjmlPixelImageBlock` and `HtmlPixelImageBlock`

**Example**

```tsx
<MjmlImage src="https://example.com/image.jpg" alt="Example" width={520} borderRadius={16} />
```

A `style` prop passed by the caller wins over `borderRadius`.
