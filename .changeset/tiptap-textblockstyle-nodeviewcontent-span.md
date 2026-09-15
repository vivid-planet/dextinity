---
"@dextinity/cms-admin": patch
---

Fix invalid HTML nesting in `textBlockStyles` node views

`TextBlockStyleParagraph` and `TextBlockStyleHeading` rendered their editable content in a `NodeViewContent`, which defaults to a `<div>`. Wrapped in a `<p>`, a heading tag, or a custom `element` that renders one of those tags, this produced invalid markup (a `<div>` inside a `<p>`/heading), which React flags as a DOM nesting warning in development. `NodeViewContent` now renders as a `<span>`, which both tags allow as content.
