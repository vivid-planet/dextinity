---
"@dextinity/cms-admin": minor
---

Add `useAiModePageTreeDocumentToolset`, which gives the editor of a page tree document the AI Mode tools to read the document and edit its blocks

The editor calls it with the root blocks passed to `createUsePage` and what `usePage` returns. The agent gets `get_page_state`, which summarizes every root block, including unsaved changes, and `edit_blocks`, which changes the top-level blocks of one blocks block.

**Example**

```tsx
const { pageState, setPageState, hasChanges } = usePage({ pageId: id });

useAiModePageTreeDocumentToolset({
    pageTreeNodeId: id,
    pageState,
    setPageState,
    hasChanges,
    rootBlocks: { content: PageContentBlock, seo: SeoBlock, stage: StageBlock },
    summarizeRootBlocks: { seo: summarizeSeoBlockStateForAiMode },
    editableBlocks: {
        rootBlockKey: "content",
        supportedBlocks: pageContentBlocks,
        additionalItemFields: pageContentAdditionalItemFields,
        schemaBlockName: "PageContent",
    },
    defaultTab: "content",
});
```
