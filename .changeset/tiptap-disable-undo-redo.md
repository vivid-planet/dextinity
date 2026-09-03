---
"@dextinity/cms-admin": patch
---

Disable undo/redo in the TipTap Rich Text Block when the `history` feature is disabled

Previously, only the undo/redo toolbar buttons were hidden while TipTap's undo/redo extension stayed enabled, so the keyboard shortcuts still worked and the editor kept tracking history.
