---
"@dextinity/cms-admin": minor
---

Add `DamFinderPage` built on `@dextinity/ui`

The assets as a finder: the folder tree, the folder's files as icons, a list, columns, or a gallery, and a path bar. Space opens a quick look of the selected file. The details panel shows a file's type, size, dimensions, and last change, and edits its name, title, and alt text, or renames a folder. Files are moved by dragging them onto a folder and deleted or archived with Delete, and moving and archiving can be undone from the toast. Files are uploaded by dropping them onto the finder or with "Upload". The folder tree can be resized by dragging its edge or with the arrow keys. The chosen view and the folder tree width are remembered per browser.

```tsx
<DamFinderPage editFileUrl={(fileId) => `${scopeUrl}/assets/${fileId}/edit`} />
```
