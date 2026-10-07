---
"@dextinity/cms-admin": patch
---

Fix pasting more text blocks than `maxTextBlocks` allows into the TipTap Rich Text Block

Instead of cutting the content off at the limit, the editor threw an error. The extra text blocks stayed in the editor, and changes were missing from the saved content until it was back within the limit.
