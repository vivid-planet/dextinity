---
"@dextinity/mail-react": patch
---

Correct the return types of `OneOfBlock` and `OptionalBlock` to include `null`

Both components render nothing when there's no block to render, but their published types claimed they always return an element.
