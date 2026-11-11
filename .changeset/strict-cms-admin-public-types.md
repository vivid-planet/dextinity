---
"@dextinity/cms-admin": major
---

Fix public types that failed in projects with `strictFunctionTypes`

**`createEditPageNode`:** `valuesToInput` is typed as it's called, receiving `{ values }`, with `values` containing the page tree node's form values and the values of `additionalFormFields`.
Pass the type of the additional values as type argument or annotate the parameter:

```diff
- valuesToInput: (values) => ({ userGroup: values.userGroup }),
+ valuesToInput: ({ values }: { values: { userGroup: string } }) => ({ userGroup: values.userGroup }),
```

**`DocumentInterface`:** Document types with different input and output types can now be combined in `Record<string, DocumentInterface>`, `DocumentInterface<any, any>` isn't needed anymore.
`DocumentInterface` accepts the type of the page tree node's additional fields as third type argument, which is used for the props of `InfoTag` and `SitePreviewAction`.
`updateMutation` isn't typed with the document output anymore.

**`createCompositeBlock`:** `visibleOrderedBlocksForState` receives the composite block's state instead of `unknown`.
Remove type annotations of the `state` parameter, they are often wrong (e.g., the block's data type instead of its state):

```diff
- visibleOrderedBlocksForState: (state: LayoutBlockData) => ...,
+ visibleOrderedBlocksForState: (state) => ...,
```
