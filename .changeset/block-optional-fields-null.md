---
"@dextinity/cms-api": patch
---

Type the optional fields of all blocks as `null` and `undefined`

The block inputs accept `null` for optional fields, but the blocks' data and input classes only typed them as `undefined`.
Checks like `this.damFileId === undefined` therefore let `null` through, for instance adding a dependency with a `null` ID.
These checks now handle `null` too, and the types include `null` so TypeScript forces code that reads these fields to handle it.

**Possible type errors**

Code that reads an optional field of a block's data or input, for instance `targetUrl` of an `ExternalLinkBlock`, and passes it on as `string | undefined` now gets a type error.
Handle `null` the same way as `undefined`, for instance:

```ts
const targetUrl = externalLinkBlockData.targetUrl ?? undefined;
```
