---
"@dextinity/cms-admin": minor
---

Add AI Mode scopes, so that a page can offer its context and tools to the chat of the Dextinity AI Hub

A page registers an AI Mode scope with `useAiModeScope`, or with the `AiModeScope` component for a scope that other scopes are rendered in. A scope has a description of what the user is looking at, a small context, and the tools the agent can call while the page is open. The chat that reads them is set up by the project: `AiModeScopesProvider` holds the mounted scopes, and `useAiModeScopesStore` reads them. Without a provider, a scope does nothing.

An entity's grid and form get their tools without writing any:

- `useAiModeDataGridScope` lets the agent read the rows of a grid with server-side filtering, sorting, and pagination, change its search, filters, sorting, and page, and open a row.
- `AiModeFormScope`, rendered inside a `FinalForm`, lets the agent read the form's fields and fill them in as unsaved changes, which the user saves, including a single block and the blocks of a blocks block.

The grid and the form of the redirects offer their tools this way.

**Example**

```tsx
// In the component that renders the grid
useAiModeDataGridScope({
    entityName: "news",
    entityLabel: "news articles",
    columns,
    dataGridProps,
    rows: data?.newsList.nodes ?? [],
    totalCount: data?.newsList.totalCount,
    isLoading: loading,
    openForm: (id) => (id ? stackSwitchApi.activatePage("edit", id) : stackSwitchApi.activatePage("add", "add")),
});

// Inside the FinalForm of the form
<AiModeFormScope
    entityName="news"
    entityLabel="news article"
    id={id}
    fields={[
        { name: "title", label: intl.formatMessage({ id: "news.title", defaultMessage: "Title" }), type: "text" },
        { name: "date", label: intl.formatMessage({ id: "news.date", defaultMessage: "Date" }), type: "date" },
    ]}
/>;
```

The planner of block edits (`planBlockEdits`), the summary of a block's state (`summarizeBlockState`), and the parts of the tool descriptions for block edits are exported too, for a page that offers its own block editing tool.
