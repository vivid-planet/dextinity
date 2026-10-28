---
"@dextinity/cms-api": minor
---

Add `formatValidationErrors()` to flatten class-validator errors

It turns the tree of class-validator errors into a list of `{ path, message }`, with paths like `content.blocks[3].props.height`.
Use it, for instance, in a query that only validates an input and returns the errors to an API client.

**Example**

```ts
const errors = await validate(plainToInstance(PageInput, input), { whitelist: true, forbidNonWhitelisted: true });

return formatValidationErrors(errors);
// [{ path: "content.blocks[3].props.height", message: "height must be an integer number" }]
```
