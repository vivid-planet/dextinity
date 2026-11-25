---
"@dextinity/cms-admin": minor
---

Add `createUseAiModePageTreeDocumentToolset`, which gives the editor of a page tree document the AI Mode tools to read the document and edit its blocks

Like `createUsePage`, it takes the root blocks once, and the hook it creates takes what `usePage` returns. The agent gets `get_page_state`, which summarizes every root block, including unsaved changes, and `edit_blocks`, which changes the top-level blocks of one blocks block.

**Example**

```tsx
const useAiModePageToolset = createUseAiModePageTreeDocumentToolset({
    rootBlocks,
    summarizeRootBlocks: { seo: summarizeSeoBlockStateForAiMode },
    editableBlocks: {
        rootBlockKey: "content",
        supportedBlocks: pageContentBlocks,
        additionalItemFields: pageContentAdditionalItemFields,
        schemaBlockName: "PageContent",
    },
    defaultTab: "content",
});

// In the editor
const { pageState, setPageState, hasChanges } = usePage({ pageId: id });
useAiModePageToolset({ pageTreeNodeId: id, pageState, setPageState, hasChanges });
```
