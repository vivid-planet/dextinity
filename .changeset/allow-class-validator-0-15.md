---
"@dextinity/cms-api": patch
"@dextinity/api-generator": patch
---

Allow `class-validator` v0.15 as peer dependency

The peer dependency range is widened to `^0.14.0 || ^0.15.0`.

`class-validator` v0.15 changes the signature of `@IsIBAN()`: it now accepts an options argument, which breaks existing calls that pass an argument, e.g. `@IsIBAN({ forbidUnknownValues: false })`. Check your usage of `@IsIBAN()` before upgrading to v0.15.
