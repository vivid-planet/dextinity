---
"@dextinity/cms-api": minor
---

Add `validationErrorDetails` to validation errors

The tree of class-validator errors in `validationErrors` doesn't tell an API client which block is affected or how to fix the input.
`validationErrorDetails` lists one error per invalid value with:

- `path`: the path of the value in the input, for instance `content.blocks[3].props.headline`
- `blockName`: the registered name of the innermost block that contains the value, to look up its block meta
- `blockKey` and `blockType`: the `key` and `type` of the innermost entry of a blocks, list or one-of block on the path
- `message`: the block, the field and the cause, with the allowed fields, values or block types where they apply, for instance:

```
Field "height" of block Space (key "a1b2"): must be an integer number, but is "large".
Field "foo" of block Accordion (key "c3d4"): unknown field. Allowed fields: headline, list, showAllItems.
Field "openGraphImage" of block Seo: is missing. Expected an OptionalPixelImage block with the fields block (a PixelImage block or null), visible (a boolean).
```

The `ExceptionFilter` adds the list to every validation error created by the `ValidationExceptionFactory`.
To create the list without the exception, for instance in a mutation that only validates, call `getValidationErrorDetails()` with the errors returned by class-validator.

Blocks are recognized in inputs created by the `blockInputFactory` of a registered block.
If a root block is missing completely, the list names the field without the block.
