---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

Add `defaultTextBlockStyles` option to `createTipTapRichTextBlock`

The text block style dropdown always offered an unstyled `Default` entry next to the configured `textBlockStyles`, even for a tag where every instance should always carry one of them. `defaultTextBlockStyles` assigns a default style per tag: no `Default` entry is offered for it, a newly created or converted heading/paragraph of that tag gets the style automatically, and the API rejects stored content of that tag missing a style. `migrateFromDraftJs` falls back to the configured default when a mapped Draft.js block doesn't specify a `textBlockStyle`.

**Example**

```ts
createTipTapRichTextBlock({
    textBlockStyles: [
        { name: "copy100", appliesTo: ["paragraph"] },
        { name: "copy200", appliesTo: ["paragraph"] },
        { name: "headline300", appliesTo: ["heading-2"] },
    ],
    defaultTextBlockStyles: {
        paragraph: "copy100",
        "heading-2": "headline300",
    },
});
```

A tag without an entry (e.g. `heading-3` above) keeps today's behavior — the dropdown still offers "Default" for it.
