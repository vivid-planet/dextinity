---
"@dextinity/cms-admin": patch
---

Fix order of `link` and special character (`nonBreakingSpace`, `softHyphen`) buttons in the TipTap rich text block toolbar

They were swapped; `link` now appears before the special character buttons.
