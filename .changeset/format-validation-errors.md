---
"@dextinity/cms-api": minor
---

Add `formatValidationErrors()` and `describeBlockInput()` for readable validation errors

It turns the tree of class-validator errors into a list of `{ path, message }`, with paths like `content.blocks[3].props.height`.
Use it, for instance, in a query that only validates an input and returns the errors to an API client.

**Example**

```ts
const errors = await validate(plainToInstance(PageInput, input), { whitelist: true, forbidNonWhitelisted: true });

return formatValidationErrors(errors);
// [{ path: "content.blocks[3].props.height", message: "height must be an integer number" }]
```

`describeBlockInput()` describes a block with its fields, for instance `a Space block with the fields height (a number), size (one of: small, large)`.
Use it for the message of your own validators, for instance an `@IsDefined()` on a root block field, so that it matches the message of a missing child block:

```ts
@IsDefined({ message: ({ property }) => `${property} is missing. Expected ${describeBlockInput(PageContentBlock)}.` })
```
