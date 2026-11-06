---
"@dextinity/cms-admin": minor
---

Add `DamFinderPage` built on `@dextinity/ui`

The assets as a finder: the folder tree, the folder's files as icons, a list, columns, or a gallery, and a path bar. Space opens a quick look of the selected file. The details panel shows a file's type, size, dimensions, and last change, and edits its name, title, and alt text, or renames a folder. Files are moved by dragging them onto a folder, deleted or archived with Delete, and uploaded by dropping them onto the finder or with "Upload". The chosen view is remembered per browser.

```tsx
<DamFinderPage editFileUrl={(fileId) => `${scopeUrl}/assets/${fileId}/edit`} />
```
