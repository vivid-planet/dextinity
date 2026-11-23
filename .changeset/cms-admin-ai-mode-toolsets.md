---
"@dextinity/cms-admin": minor
---

Add AI Mode toolsets, so that a page can offer its context and tools to the chat of the Dextinity AI Hub

The AI Mode is experimental: its exports are marked `@experimental` and may change in a minor release.

A page registers an AI Mode toolset with `useAiModeToolset`, or with the `AiModeToolset` component for a toolset that other toolsets are rendered in. A toolset has a description of what the user is looking at, a small context, and the tools the agent can call while the page is open. The chat of the AI Mode reads them. Without an `AiModeProvider`, a toolset does nothing.

An entity's grid and form get their tools without writing any:

- `useAiModeDataGridToolset` lets the agent read the rows of a grid with server-side filtering, sorting, and pagination, change its search, filters, sorting, and page, and open a row.
- `AiModeFormToolset`, rendered inside a `FinalForm`, lets the agent read the form's fields and fill them in as unsaved changes, which the user saves, including a single block and the blocks of a blocks block.

The grid and the form of the redirects offer their tools this way.

**Example**

```tsx
// In the component that renders the grid
useAiModeDataGridToolset({
    entityName: "news",
    entityLabel: "news articles",
    columns,
    dataGridProps,
    rows: data?.newsList.nodes ?? [],
    totalCount: data?.newsList.totalCount,
    isLoading: loading,
    openEditForm: (id) => stackSwitchApi.activatePage("edit", id),
    openAddForm: () => stackSwitchApi.activatePage("add", "add"),
});

// Inside the FinalForm of the form
<AiModeFormToolset
    entityName="news"
    entityLabel="news article"
    id={id}
    fields={[
        { name: "title", label: intl.formatMessage({ id: "news.title", defaultMessage: "Title" }), type: "text" },
        { name: "date", label: intl.formatMessage({ id: "news.date", defaultMessage: "Date" }), type: "date" },
    ]}
/>;
```

A page that edits a blocks block outside a form, such as the content of a page, offers the same block editing with `createAiModeEditBlocksTool`, and reports the blocks with `summarizeBlockStateForAiMode`.

The page tree registers its own toolset, and `createAiModePageTreeNavigationTools` lets the agent open the editor of a page tree node from any page.
