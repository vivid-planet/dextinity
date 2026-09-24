---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

TipTap Rich Text Block: remove the `textBlockStyles` option

A text block style named an appearance ("small paragraph") next to the text block's semantics ("this is a paragraph"), which left editors with two dropdowns for one decision and the site with two attributes to resolve. `textBlocks` covers the same ground: several text blocks can share a tag, so a small paragraph is a text block of its own rather than a style on top of one.

**Migrating an existing configuration**

- One `textBlocks` entry per `textBlockStyles` entry, with the `tag` the style was rendered as. A style with `appliesTo: ["ordered-list", "unordered-list"]` has no equivalent, because a list item's text block is always the paragraph.
- `migrateFromDraftJs`' `textBlockMap` no longer takes a `textBlockStyle`. Point the DraftJS block type at the text block that replaces the style instead.
- On the site, read the node's `textBlock` attribute where the `textBlockStyle` attribute was read.

The editor no longer writes the `textBlockStyle` attribute, and the schema ignores it in stored content. Existing content keeps the attribute until it is saved again, so a site that still reads it keeps rendering as before until then.
