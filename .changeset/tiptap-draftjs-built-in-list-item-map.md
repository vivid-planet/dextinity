---
"@dextinity/cms-api": minor
---

TipTap Rich Text Block: allow the built-in Draft.js list types in `listItemMap`

`migrateFromDraftJs` rejected `unordered-list-item` and `ordered-list-item` in `listItemMap`, so their items could get a style only from the list's `defaultStyle`. Map them like a custom list type to give them a style:

```ts
listItemMap: {
    "unordered-list-item": { list: "unordered", textBlockStyle: "list300" },
    "ordered-list-item": { list: "ordered", textBlockStyle: "list300" },
},
```
