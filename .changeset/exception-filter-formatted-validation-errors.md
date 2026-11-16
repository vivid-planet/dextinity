---
"@dextinity/cms-api": major
---

Return `validationErrors` from the `ExceptionFilter` as a list of paths and messages

For a `DextinityValidationException`, `validationErrors` is now the list of `formatValidationErrors()` instead of the tree of class-validator errors, so that an API client, for instance an AI agent, can fix the input of a failed mutation:

```json
"validationErrors": [{ "path": "content.blocks[3].props.height", "message": "height must be an integer number" }]
```

The deprecated `ExceptionInterceptor` still returns the tree of class-validator errors.
