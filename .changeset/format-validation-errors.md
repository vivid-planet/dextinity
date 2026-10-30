---
"@dextinity/cms-api": minor
---

Add readable validation errors

`formatValidationErrors()` turns the tree of class-validator errors into a list of `{ path, message }`, with paths like `content.blocks[3].props.height`.
The `ExceptionFilter` returns this list as `formattedValidationErrors` next to `validationErrors`, so that an API client, for instance an AI agent, can fix the input of a failed mutation.
The deprecated `ExceptionInterceptor` doesn't return this list, so replace it with the `ExceptionFilter` to get it.

Use `formatValidationErrors()` directly, for instance, in a query that only validates an input:

```ts
const errors = await validate(plainToInstance(PageInput, input), { whitelist: true, forbidNonWhitelisted: true });

return formatValidationErrors(errors);
// [{ path: "content.blocks[3].props.height", message: "height must be an integer number" }]
```
