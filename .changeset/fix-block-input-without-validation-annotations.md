---
"@dextinity/cms-api": patch
---

Fix validation error for block inputs without validation annotations

Saving a document failed with `an unknown value was passed to the validate function` as soon as it contained a block whose input class has no class-validator annotations at all, for instance a block without fields. class-validator rejects such classes since v0.14, where `forbidUnknownValues` is enabled by default. Affected were, among others, link blocks in rich text blocks (DraftJS and TipTap) as their links are validated with a direct `validate()` call.

`BlockInput` now provides validation metadata, so block inputs validate as expected no matter which validation path is used.
