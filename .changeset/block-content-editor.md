---
"@dextinity/cms-admin": minor
---

Add `BlockContentEditor`

The frame of the page editor, for block content outside the page tree, e.g. emails: the header, the live preview on the left, and the panel with the tabs on the right.
Each tab is a route below the editor's URL. With `save`, it asks to save or discard unsaved changes before leaving and saves with ⌘S / Ctrl+S.
`PageContentEditor` is built on it.
