---
"@dextinity/cms-api": minor
---

Describe the content a `TipTapRichTextBlock` accepts in the block meta

The block meta (`block-meta.json`) only named the child blocks a TipTap rich text field may contain, but nothing about the content itself. Consumers that generate or validate content outside the editor, such as AI agents, had to reconstruct the allowed nodes, marks and limits from the block's configuration.

The `TipTapRichTextBlock` field now carries a `schema` with the ProseMirror schema's nodes and marks (content expressions, groups, attributes with their defaults) and the rules validated on top of it: allowed heading levels, text block styles and inline styles with their `appliesTo`, placeholder names, whether a child block is embedded as `cmsBlock` or `cmsInlineBlock`, `maxTextBlocks` and `listLevelMax`.

**Example**

```json
{
    "name": "tipTapContent",
    "kind": "TipTapRichTextBlock",
    "nullable": false,
    "childBlocks": { "productTeaser": "ProductTeaser" },
    "schema": {
        "topNode": "doc",
        "nodes": {
            "doc": { "content": "block+" },
            "paragraph": { "content": "inline*", "group": "block", "attrs": { "textBlockStyle": { "default": null } } },
            "heading": { "content": "inline*", "group": "block", "attrs": { "level": { "default": 2 }, "textBlockStyle": { "default": null } } },
            "cmsBlock": { "group": "block", "atom": true, "attrs": { "blockType": { "default": null }, "data": { "default": null } } }
        },
        "marks": {
            "bold": {},
            "link": { "attrs": { "data": { "default": null } } }
        },
        "headingLevels": [2, 3],
        "textBlockStyles": [{ "name": "paragraph200", "appliesTo": ["paragraph"] }],
        "inlineStyles": [],
        "placeholders": [],
        "childBlocks": { "productTeaser": { "display": "block" } },
        "maxTextBlocks": 5
    }
}
```
