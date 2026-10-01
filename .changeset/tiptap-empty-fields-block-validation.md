---
"@dextinity/cms-api": patch
---

Fix validation error when saving a block without fields

A block without any fields (and therefore without any validation decorators), for instance a link type that only needs its type to be selected, was rejected as an "unknown value" by `class-validator`'s `forbidUnknownValues` (the default since v0.14). This made it impossible to save content containing such a block — in a `createTipTapRichTextBlock` link or child block, in an `OneOfBlock`/`ListBlock`, or through the global `ValidationPipe`.

`createBlock` now registers a single (inert) `class-validator` metadata entry on a block input that has none, so a field-less block is no longer treated as an unknown value on any validation path. `whitelist` and `forbidNonWhitelisted` continue to reject unexpected properties.
