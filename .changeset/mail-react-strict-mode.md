---
"@dextinity/mail-react": patch
---

Type the return value of `OneOfBlock` and `OptionalBlock` as nullable

Both components already returned `null` (when no block is selected, respectively when the optional block is hidden), but the emitted types claimed they always return an element. They now include `null`.
