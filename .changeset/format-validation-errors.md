---
"@dextinity/cms-api": minor
---

Add `formatValidationErrors()` for readable validation errors

It turns the tree of class-validator errors into a list of `{ path, message }`, with paths like `content.blocks[3].props.height`, so that an API client, for instance an AI agent, can fix its input.
Use it, for instance, in a query that only validates an input:

```ts
const errors = await validate(plainToInstance(PageInput, input), { whitelist: true, forbidNonWhitelisted: true });

return formatValidationErrors(errors);
// [{ path: "content.blocks[3].props.height", message: "height must be an integer number" }]
```
