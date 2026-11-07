---
"@dextinity/cms-admin": patch
---

Keep the editor and the preview when switching between tabs with different previews

Switching between Blocks and Stage in the page editor reloaded the whole editor and lost the keyboard focus. Now the preview's `iframe` loads the other address and gets the state as soon as the new page is ready.

`IFrameBridgeContext` has two new members for this, `onIFrameNavigate` and `onIFrameLoad`. Custom providers of the context need to add them.
