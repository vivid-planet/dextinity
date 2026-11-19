---
title: AI Mode (experimental)
---

The AI Mode puts the chat of the Dextinity AI Hub next to the pages of the admin. The agent in the chat knows what the user is looking at, and it calls tools to read and change it: it fills in a form, edits the blocks of a page, or filters a grid. It changes only what the user sees, as unsaved changes the user saves, so the API checks the permissions as it does without the AI Mode.

`@dextinity/cms-admin` contains what a page needs to offer the agent its context and tools. The chat itself, the AI Hub proxy in the API, and the MCP server are set up by the project; the Demo shows how, see [its README](https://github.com/vivid-planet/dextinity/blob/main/demo/admin/src/aiMode/README.md). Without the chat, a page's AI Mode toolset does nothing, so a project without the AI Mode needs no changes.

## AI Mode toolsets

A page offers its context and tools by registering an AI Mode toolset while it is mounted. A toolset has an ID, a description of what the user is looking at, a small context, and its tools:

```tsx
useAiModeToolset({
    id: "footer",
    description: "The editor of the footer of the current content scope.",
    context: { hasChanges },
    tools: [
        {
            name: "get_footer_state",
            description: "Get the content of the footer as the user edits it, including unsaved changes.",
            inputSchema: { type: "object", properties: {} },
            readOnlyHint: true,
            handler: () => summarizeBlockState(FooterContentBlock, state),
        },
    ],
});
```

- The context is sent to the agent whenever it changes, so keep it small. Return larger state from a tool, which the agent calls when it needs it.
- The tools are available to the agent only while the toolset is mounted. A tool's name must be unique among the mounted toolsets: the AI Mode leaves out a tool whose name an outer toolset already has.
- The chat asks the user to approve every call of a tool that isn't read-only (`readOnlyHint: true`). The tool description should tell the agent so, so that it calls the tool instead of asking for permission in the chat first. Mark a tool that only navigates or changes what a page shows as read-only too: it changes no data, and an approval for every step slows the agent down.
- The toolset is registered again on every render, so that the handlers are always those of the latest render. Only a change of the description, the context, or the tools' definitions reaches the agent, so the toolset needn't be memoized.

Use the `AiModeToolset` component instead of the hook for a toolset that other toolsets are rendered in, e.g. a page that opens its editor in a stack. The agent then gets the inner toolsets after it.

## Grids

`useAiModeDataGridToolset` gives a grid with server-side filtering, sorting, and pagination tools to read its rows, change its search, filters, sorting, and page, and open a row. Call it in the component that renders the grid, with the props of `useDataGridRemote` and the result of the grid's query:

```tsx
const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("NewsGrid") };
const { data, loading } = useQuery(newsQuery, { variables });
const stackSwitchApi = useStackSwitchApi();

useAiModeDataGridToolset({
    entityName: "news",
    entityLabel: "news articles",
    columns,
    dataGridProps,
    rows: data?.newsList.nodes ?? [],
    totalCount: data?.newsList.totalCount,
    isLoading: loading,
    openForm: (id) => (id ? stackSwitchApi.activatePage("edit", id) : stackSwitchApi.activatePage("add", "add")),
});
```

The tools are named after the entity, e.g. `get_news_grid_rows`. The agent reads the values of the columns that are text, numbers, or booleans; a column that renders a block preview is left out.

Don't use it for a grid that loads its rows without the grid's filter, sorting, and page, e.g. one that loads all rows sorted by position: changing the view would change nothing the user sees.

## Forms

`AiModeFormToolset`, rendered inside a `FinalForm`, gives the form tools to read its fields and fill them in. It takes the fields the agent may read and change, with their labels:

```tsx
<FinalForm<FormValues> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode} initialValues={initialValues}>
    {() => (
        <>
            <AiModeFormToolset
                entityName="news"
                entityLabel="news article"
                id={id}
                fields={[
                    { name: "title", label: intl.formatMessage({ id: "news.title", defaultMessage: "Title" }), type: "text" },
                    { name: "date", label: intl.formatMessage({ id: "news.date", defaultMessage: "Date" }), type: "date" },
                    {
                        name: "content",
                        label: intl.formatMessage({ id: "news.content", defaultMessage: "Content" }),
                        type: "blocks",
                        block: NewsContentBlock,
                        supportedBlocks: newsContentBlocks,
                        schemaBlockName: "NewsContent",
                    },
                ]}
            />
            {/* The fields of the form */}
        </>
    )}
</FinalForm>
```

| Type          | Value                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `text`        | A string                                                                                                                   |
| `date`        | A date in the format `YYYY-MM-DD`                                                                                          |
| `boolean`     | `true` or `false`                                                                                                          |
| `select`      | One of the `options`                                                                                                       |
| `multiSelect` | A list of the `options`                                                                                                    |
| `reference`   | An option of `loadOptions`, e.g. of an `AsyncSelectField`, or a list of them with `multiple`                               |
| `block`       | A single block, e.g. an image or a link. The agent can change it only when the field has the block's name in block-meta    |
| `blocks`      | A blocks block, whose blocks the agent inserts, updates, removes, moves, hides, and shows like the content of a page       |

- The agent sets a `reference` by the ID of an option, which it lists first. `loadOptions` gets the form values, for options that depend on another field.
- A `block` or `blocks` field needs the block's name in block-meta (`schemaBlockName`), where the agent looks up the block's fields. It often differs from the name of the block in the admin, e.g. `NewsContent` for `NewsContentBlock`.
- A field's `description` tells the agent what its type and label don't, e.g. that a price is a number although the form holds it as text.
- A field the form doesn't list is invisible to the agent. Leave out what the agent can't fill in usefully, such as file uploads.

The redirects of `@dextinity/cms-admin` offer their grid and form this way.

## Blocks

`createEditBlocksTool` creates a tool that inserts, updates, removes, moves, hides, and shows the top-level blocks of a blocks block outside a form, e.g. the content of a page. Add it to the tools of the toolset, next to a tool that reports the keys of the blocks, e.g. with `summarizeBlockState`:

```tsx
createEditBlocksTool({
    name: "edit_footer_blocks",
    description: "Change the content of the footer of the current content scope: insert, update, remove, move, hide, and show its blocks.",
    contentName: "the footer's content",
    stateToolName: "get_footer_state",
    supportedBlocks: footerContentBlocks,
    schemaBlockName: "FooterContent",
    blockContext,
    getBlocks: () => latestStateRef.current.blocks,
    updateBlocks: (update) => setState((previous) => ({ ...previous, blocks: update(previous.blocks) })),
});
```

- A batch of operations applies as a whole or not at all. It is rejected when `getBlocks` returns other blocks after the batch was planned, because the user changed them meanwhile, so read the latest blocks there rather than those of a render.
- `updateBlocks` applies the batch in one update, so that the content is marked as changed once.
- `insertableBlocks` narrows the blocks an insertion may add, e.g. to those `isBlockSupported` allows in the content scope, and `additionalItemFields` are the blocks block's, whose defaults an inserted block starts with.
- `schemaNameExamples` names block types whose name in block-meta differs from their type, e.g. `'image' is the 'DamImage' block`, and `restrictions` what the tool can't change.
