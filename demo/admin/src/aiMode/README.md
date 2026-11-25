# AI Mode

The AI Mode puts the chat of the Dextinity AI Hub next to the admin. A switch in the header (`AiModeHeaderItem`) opens the chat as a flyout (`AiModeFlyout`), which loads the AI Hub's web component and registers two sets of tools with it:

- the **MCP server** of the API (`demo/api/src/mcp`, at `/api/mcp`), which reads from the API: the page tree, pages as they were last saved, DAM files, and the block schemas,
- the **host tools** of the admin, which act on what is open in the admin. The pages that are open offer them through AI Mode toolsets (see below): the admin as a whole offers `open_admin_page` and `open_page_tree_node`, the page editor `get_page_state` and `edit_blocks` (`useAiModeAdminPageNavigation` and `createAiModePageTreeNavigationTools` of `@dextinity/cms-admin`, `pageTools.ts`), and the grid and the form of an entity, such as the news, read and change them (`dataGridTools.ts`, `formTools.ts`).

What a page needs to offer the agent its context and tools is part of `@dextinity/cms-admin` (`packages/admin/cms-admin/src/aiMode`), so that the pages of the package, such as the redirects, can offer them too: the AI Mode toolsets, the tools of grids and forms, and block editing. The chat, the AI Hub proxy, the MCP server, and the tools of Demo's own pages are part of Demo. A page of a project without the AI Mode registers its toolset with no chat listening, which does nothing.

The AI Mode is ported from vivid-websites. This README explains the decisions the code doesn't show. It is written for developers who maintain the AI Mode in Demo or port it to a project.

## When the AI Mode is on

The AI Mode needs three settings: the script of the web component (`AI_HUB_WEB_COMPONENT_SCRIPT_SRC`) and a widget (`AI_HUB_WIDGET_ID`) in the admin, and the secret key of that widget (`AI_HUB_API_KEY`) in the API. `.env` sets the script and the URL of the AI Hub API (`staging-ai-hub-api.dextinity.com`) to the staging AI Hub, so the AI Mode is off until the widget ID and the key are set in `.env.local`.

- Without the key, the API registers neither the AI Hub proxy nor the MCP server.
- Without the script or the widget ID, the admin shows no switch (`isAiHubConfigured`). A missing setting turns the AI Mode off rather than leaving an empty flyout.

The user also needs the `aiHub` permission, for the switch as much as for the proxy. It is a permission of its own rather than the page tree's because the AI Hub will serve more than the editing of pages. In Demo, every user has it, as every permission other than `userPermissions`.

The AI Mode is available wherever an AI Mode toolset is mounted. In Demo, that is every page, because the admin as a whole has a toolset. Without one, the switch is disabled and its tooltip says the AI Mode isn't available on this page. The flyout closes there and opens again on returning to a page with a toolset, because whether it is open is stored separately from whether it is available.

## The chat goes through the API

The chat doesn't talk to the AI Hub API itself. It sends its requests to the API (`api-url`, `/api/ai-hub`), which forwards them with the secret key and with the ID of the user the request was authenticated as. This is the server-to-server embedding of the AI Hub:

- The key never reaches the browser. A key of type Widget in the browser would let anyone who reads it chat on the widget's account, as any user.
- The conversations belong to the verified user. The chat sends a `user-id` too, but it is only a hint: the proxy replaces it with the authenticated user's ID wherever the AI Hub reads one.

The proxy forwards only the requests the chat makes. They are listed in a route table in `ai-hub-proxy.ts`, taken from the bundle of the prod web component, which differs from the staging one only in its base URLs. For each request, the table lists the query parameters the chat sends and says where the AI Hub reads the user ID: in the query, in the body, or nowhere. No other query parameter is forwarded, so a variant such as `userId[0]` can't reach the AI Hub as a second user ID. The proxy sets the verified ID rather than replacing one the chat sent, because the AI Hub doesn't require a user ID everywhere it reads one: it checks the message feedback against the owner of the conversation only when it gets a `userId`.

Only the file upload and the speech transcription send a body that isn't JSON, and the proxy pipes it through unread. Neither carries a user ID, and an uploaded file isn't tied to a user: any user of the AI Mode who has a file's ID can download it through the proxy.

The proxy uses `node:http(s)` rather than `fetch`, because undici aborts the process when a streamed answer is read more slowly than it arrives and the server closes the connection. It limits the time without data rather than the time of the whole answer, so a long streamed answer isn't cut off. When the user closes the chat, it stops the request to the AI Hub, so the AI Hub doesn't keep working on an answer nobody reads. A chat that goes away just as the AI Hub starts answering is handled too: its response may not have emitted `close` yet, and piping the answer into it would crash the process, so the proxy drops the answer instead.

### A new release of the web component

The admin loads the web component without a fixed version, so a new release can make a request the route table doesn't list. The proxy answers it with 404 and logs a warning with the method and the path (`The AI Hub chat requested … which no route forwards`). To add the request, look up two things, as for the other routes: the request and its query parameters in the bundle of the web component, and where the AI Hub reads `userId` for it in the OpenAPI document of the AI Hub API.

## The MCP server

The MCP server is part of the API (`@rekog/mcp-nest`) rather than a service of its own, so it reads with the API's services and checks the API's permissions. Its route, `/api/mcp`, is a regular controller of the app, so the global `DextinityAuthGuard` authenticates every request, and the chat's requests carry the admin session like any other. The route requires the `pageTree` permission without a scope, because a JSON-RPC request carries none.

The tools themselves, however, run in the strategy's own RPC pipeline, where none of the app's guards, interceptors, or decorators like `@AffectedEntity` run. Each tool therefore checks the permission and the scope it reads itself, as the corresponding resolver's decorators would. A node or file of a scope the user may not read is reported as not existing, as the resolvers do. A system user authenticated by basic auth is refused, because the tools serve the admin, which a person uses.

A refusal is an expected outcome of a tool call, so a tool returns it as an error result with the reason (`errorResult`, `notSignedInResult`) rather than throwing: the agent can act on "You may not read the page tree of this scope", but not on the "Internal server error" the MCP layer makes of an exception.

`get_page` returns the page as its editor sees it: with hidden blocks, unpublished and archived link targets, and DAM URLs that work before the page is published. The block transformers read that visibility from the headers of the GraphQL request, which a call in the RPC pipeline doesn't have, so `get_page` resolves them per call with the headers of the admin's requests. The registered request also has to carry its context ID (`REQUEST_CONTEXT_ID`), as the GraphQL module's does: `BlocksTransformerService` resolves the transformers' services under the context ID it finds on the request, and without it they would get a context without these headers.

The server is stateless, so any replica of the API can answer a call.

### Write tools

_Coming with #7293._ The MCP server will also change the page tree and pages: `check_slug_availability`, `create_page_tree_node`, `update_page_tree_node`, `update_page_tree_node_visibility`, `delete_page_tree_node`, and `save_page`. They check the `pageTree` permission of the scope they change, as the page tree resolver's guards do. `save_page` takes the `updatedAt` of the page as `get_page` returned it and is refused when the page was saved since, so that the agent doesn't overwrite changes made after it read the page. Unlike `edit_blocks`, these tools write to the database directly, without the user saving anything.

## Loading the chat

`ScriptLoader` renders the chat only once the script of the web component has loaded, not as soon as the script is in the document. Under `StrictMode`, the effect runs twice, and the second run finds the script the first one added while it is still loading. A custom element rendered before its script defined it gets its `bridge` only after React ran its ref callback, which then registers nothing.

When the script fails to load, e.g. because the AI Hub is down or the CSP blocks its host, the flyout shows an error instead of staying empty. Closing and reopening the flyout tries again: the failed script is removed, and the retry loads it with a `retry` query parameter, because the browser remembers a module that failed to load for the rest of the page's life.

The ref callback (`registerBridge`) registers the MCP server and the host tools. It must not change on navigation, because React detaches and reattaches a ref whose callback changes, which would register the MCP server again. It therefore reads what changes on navigation through a ref.

The flyout is unmounted once it is closed, so the chat starts over with the next opening.

The admin's Content Security Policy (`demo/admin/server/index.ts`) allows the host of the web component for scripts, fonts, images, media, and connections, and only when the script and the widget ID are set. The chat's requests to the AI Hub go to the API, which is `'self'`. The Vite dev server sends no CSP, so a missing directive shows only in the built admin.

## Page context

The agent needs to see the page that is being edited, including unsaved changes, which exist only in the state of the edit page. Pushing the content with every change (`bridge.setContext`) would cost too many tokens: the block state of a page is tens of kilobytes of JSON and changes with every keystroke. Pulling it only on demand leaves the agent unaware of what is open and whether it changed. So the context is split:

- **Pushed on change, debounced**: the content scope, the pathname, the AI Mode toolsets with their context, which for the page editor is the page's metadata (page tree node ID, document type and ID, path, active tab, selected block route, `hasChanges`), and the selected text (see below). This keeps the agent oriented for a few hundred bytes per update.
- **Pulled on demand** with `get_page_state`: a summary of the page's content, stage, and SEO, computed at call time, so it is never stale.

`summarizeBlockStateForAiMode` (`blockStateSummary.ts`) reduces the block state to what the agent can act on, because the full output of a page overflows its context:

- the nested block structure with keys, types, and hidden flags. The keys also appear in the selected block route, and they are what `edit_blocks` takes.
- the DAM files, links (page tree node, URL, email address, or phone number), and YouTube and Vimeo videos, attached to the block that references them. Their IDs can be passed on to the MCP server's tools.
- the text contents, from `extractTextContents`.
- for the SEO block, its settings: it has no `extractTextContents`, so without this, the SEO tab would be invisible to the agent, although a request like "improve my meta description" is about it.

Hidden blocks contribute no text, but the structure still lists them, marked as hidden, with their files, links, and videos. The inactive variants of a one-of block contribute no files, links, or text. Links inside rich text are included, because the TipTap link marks carry the state of the link block. Styling, layout, media metadata, and rich text formatting are left out. A block without `extractTextContents` contributes structure but no text.

The saved page is available separately through the MCP server's `get_page`; `get_page_state` exists for the state being edited.

### Selected text

The text the user has selected is pushed too, as `selection` (`{ text, isTruncated }`, or `null`), so that a request like "improve this text" works. It is context rather than a tool: with a tool, the agent would have to guess that "this text" means it should call one. A selection is also small and changes only when the user selects something, so pushing it is cheap. Text longer than 2000 characters is cut off and marked as truncated, so that selecting the whole page doesn't fill the agent's context.

`useTextSelectionStore` (`textSelection.ts`) reads the selection from the DOM on `selectionchange`: from the document for the rich text editor and the rest of the page, and from the focused element for a text field, whose selection isn't part of the document's. The TipTap editor of Dextinity doesn't expose its editor or selection, so the DOM is the only way to get it without a change to Dextinity.

A selection change caused by the chat is ignored: clicking into the chat to ask about the selection moves the document's selection away from it, and the selection must stay until the agent has read it. Any other change replaces it, so clicking elsewhere in the admin clears it. Two changes happen while the chat has focus, so the store wouldn't see them, and they clear the selection explicitly: `edit_blocks` clears it once it has changed the content, because the selected text may no longer be there, and the flyout clears it on navigation, e.g. when `open_page_tree_node` opens another page.

The agent gets the text only, not where it is in the block. To change it, it rewrites the block's text with `edit_blocks`, which keeps the rest of the block's text only as far as the agent reproduces it.

## Host tools

The host tools are tools of the admin rather than of the MCP server, because they act on what only the admin knows: which page is open, and its unsaved state.

- `open_admin_page` opens a page of the main navigation, e.g. the assets or the redirects. The pages and their labels are in the description of its `path`, built from the master menu data with the permission checks of the menu (`useAiModeAdminPageNavigation` of `@dextinity/cms-admin`), so the agent needs no call to list them, unlike in vivid-websites, and can't open a page the menu hides from the user. A route with a parameter in its path, such as the page tree's `/pages/pagetree/:category`, is left out unless its menu entry links to it with `to`. The admin toolset also pushes the menu page that is open, as `openPage`, so the agent knows where the user is, also on a page below it such as an edit page.
- `open_page_tree_node` opens a page tree node's document in the editor. It takes the node's category as well as its ID, because the category is part of the URL. The admin's toolset offers it on every page, to users who may edit the page tree, so that the agent opens a page's editor from anywhere in one step rather than opening the page tree first. Unsaved changes of the page that is open aren't lost silently: the admin asks the user, as on any navigation. Because the user may stay on the page, `open_page_tree_node` reports only that it asked to open the page, and tells the agent to check with `get_page_state` (`pageTreeNodeId`) which page is open before referring to it.
- `get_page_state` returns the page's metadata and the summary described above.
- `edit_blocks` changes the content blocks, see below.

### AI Mode toolsets

A page offers its context and tools by registering an AI Mode toolset (`AiModeToolsets.tsx`): an ID, a description of what the user is looking at, a small context to push, and its tools. The admin (`AdminAiModeToolset`, around the routes of the master menu) and the page tree (`PagesPage` of `@dextinity/cms-admin`) register their toolsets with the `AiModeToolset` component, because other toolsets are rendered inside them. The page editor registers its own with `useAiModeToolset`. A toolset rendered inside another is listed after it, so the agent reads the toolsets from the outside in. React runs the effects of children first, so the order of the registrations alone would put the page editor before the page tree.

A tool belongs to the toolset of the page it needs. A tool that needs nothing of a page but an ID, because it only navigates, such as `open_page_tree_node`, is offered by the admin's toolset on every page, to the users who may open its target, so that the agent reaches it in one step from anywhere. A tool that works on what a page shows, such as one that shows the archived nodes of the page tree, stays in that page's toolset, and the agent opens the page with `open_admin_page` first. So does a tool that opens something only the page lists, such as `open_<entity>_form` of an entity's grid: the agent finds the IDs of the news only with `get_news_grid_rows`, because the MCP server has no tool for them, so it is on the grid anyway when it opens one. In the admin's toolset, the tool would be in every chat while it can't be used, and every entity would add one. It belongs there once the agent can find the entities without the grid. Every tool of the admin's toolset is in the chat on every page, so it only gets tools that open something. The tools of a feature are in one file, with a factory for each toolset that offers them: `pageTreeTools.ts` of `@dextinity/cms-admin` has `createAiModePageTreeNavigationTools` for the admin's toolset, and gets a factory for the page tree's own toolset with its first tool that works on the page tree.

The chat gets the tools of the toolsets that are mounted, so the agent sees only the tools of the page that is open. Each `registerHostTools` call of the bridge replaces the tools the chat had, so the flyout passes the tools of all mounted toolsets whenever a toolset mounts, unmounts, or changes a tool's definition. It registers them right away rather than debounced, so that the agent doesn't call a tool of a page that is gone. A page registers its toolset again on every render, so that the store always has the handlers of the latest render, but only a change the agent sees notifies the flyout: the handlers are looked up when a tool is called. The toolsets are kept in a store the flyout subscribes to, not in React context state, so that block edits don't re-render the flyout.

A call that arrives for a tool whose page is gone gets an answer that says so, rather than an error. The chat itself refuses a tool it no longer has with `Unknown client tool`, e.g. when the user leaves the page while the chat waits for the approval of an edit.

The chat gives a tool whose name another tool already has a suffix (`_2`), which no tool description mentions. The store therefore leaves out a tool whose name an outer toolset already has, and logs an error. It can't check the names of the MCP server's tools, so a host tool must not take one of those either.

What the flyout owns rather than the page is passed to every handler as its second argument: `edit_blocks` clears the selected text with it.

### Grids and forms of entities

An entity's grid and form get their tools from `useAiModeDataGridToolset` and `AiModeFormToolset`, so an entity needs no tools of its own: the grid calls the hook with the props of `useDataGridRemote` and the rows of its query, and the form renders the component inside its `FinalForm` with a list of its fields. The news, the products, and the redirects of `@dextinity/cms-admin` use both. The grids of the product categories and the product highlights don't: they don't filter, sort, or page on the server, so `set_<entity>_grid_view` would change the URL but not the rows. A form declares only the fields the agent can fill in, and the agent sees nothing of the others: the product form leaves out its file uploads, its DAM files, its price range, and its date and time field. The tools are named after the entity (`get_news_grid_rows`, `set_news_form_values`), rather than being one set of tools that takes the entity as an argument: different entities then never have the same tool name, and each description can name the entity and its fields.

The tools read and change what the user sees rather than calling the API themselves, which keeps the permissions where they are: the grid's query and the form's mutations go through the API's guards, as they do when the user works without the AI Mode.

- `get_<entity>_grid_rows` returns the rows of the page the grid shows, with the values of its columns that are text, numbers, or booleans. A column that shows a block preview, such as the image of a news article, is left out, because the agent can't read it. While the grid's query is loading, e.g. right after the view changed, the tool says so rather than returning the rows of the previous view.
- `set_<entity>_grid_view` changes the search, the filters, the sorting, or the page. Its description lists the filterable columns with the operators of their type, from MUI's lists, and the options of a select. The tool refuses any other operator, and a value that doesn't fit the column, such as a date that doesn't exist: `muiGridFilterToGql` passes both on to the API as they are, and the API's error would replace the grid with an error page. A new search or filter goes back to the first page, as it does in the grid, because `useDataGridRemote` keeps the page. The changes are applied one after another, each once the grid rendered the one before: each change handler of `useDataGridRemote` writes the URL from the search params of its render, so a second change in the same render would undo the first.
- `open_<entity>_form` opens the form of a row, or the form for a new one. The grid passes `openEditForm` and `openAddForm` to the hook, and leaves out what it doesn't have: without either, the tool isn't offered, and without `openAddForm`, it requires an ID.
- `get_<entity>_form_state` returns the values of the form's fields, which fields the user changed, and which are invalid. A block field is summarized like the content of a page.
- `set_<entity>_form_values` sets fields as unsaved changes, which the user saves, like `edit_blocks`. Its schema lists the fields with their types and the options of a select, and the tool refuses a value that doesn't fit before it changes any field. A field's `description` tells the agent what its type and label don't, e.g. that a price is a number although the form holds it as text, or that changing the manufacturer country clears the manufacturer, which the product form does after the tool set both.
- `get_<entity>_form_options` lists the options of a reference field, a select of other entities such as the manufacturer of a product, by ID and label. The agent sets the field by ID, and the tool loads the option objects the field holds. The options can depend on other fields, so the values of a call are converted in the order of the form's fields, and a reference loads its options with the values converted before it.
- `edit_<entity>_form_blocks` changes the blocks of a blocks field, such as the content of a news article, with the planner of `edit_blocks` (see below): the same operations, all or nothing, and rejected when the field changed while the batch was planned. A field declares its blocks block's `supportedBlocks` and its name in block-meta, where the agent starts the schema lookup, because the two names differ as for the page (`NewsContentBlock` is `NewsContent`). A single block, such as the image of a news article, is set in the shape it is saved in, merged into its current content like an update of `edit_blocks`, when the field has the block's name in block-meta; without it, it can only be read. The target of a redirect is such a block.

`AiModeFormToolset` is a component rather than a hook, so that it can read the form with `useForm` and so that only it re-renders when the form's `dirty` changes: the form of the news subscribes to nothing, so that typing doesn't re-render it.

### Tool descriptions

The descriptions are where the agent learns how to use the tools, so they say more than what a tool does:

- `edit_blocks` names the kinds of requests it is for and tells the agent to apply the change instead of writing it into the chat. Without that, the agent answered a request like "shorten the intro" with the new text in the chat. The description of `get_page_state` names `edit_blocks` as the way to change what it reports.
- A tool description may be at most 4096 characters long. What concerns a single parameter therefore goes into that parameter's description, as the saved shape and the merging of fields do in the description of `props`.

### Approval

The user approves every edit. The chat runs a host tool without asking only if its `readOnlyHint` is `true`, and shows the call with an approve and a reject button otherwise; `edit_blocks` sets `readOnlyHint: false`. The description tells the agent about the approval, so that it calls the tool instead of first asking for permission in the chat, which would ask the user twice.

A tool that only navigates or changes what a page shows, such as `open_page_tree_node`, `open_admin_page`, or the tools that change a grid's view and open a form, sets `readOnlyHint: true` although it changes the admin: it changes no data, and an approval for every step would slow the agent down without protecting anything. Unsaved changes aren't lost by it either, because the admin asks the user before it leaves a page with unsaved changes.

## Editing blocks

`edit_blocks` inserts, updates, removes, moves, hides, and shows the content blocks of the open page. It is a host tool because it changes the state of the edit page, which the MCP server can't see. The changes are unsaved, like changes the user made by hand, and the user still saves the page.

The agent passes a block's fields in the shape the block is **saved** in (`inputFields` in `block-meta.json`), the shape `get_page` returns and `get_block_schema` describes. `output2State` converts it into editor state; it is async and needs a `BlockContext`, because it also resolves references, e.g. it loads the DAM file for a `damFileId`.

Blocks already on the page are addressed by the **key** `get_page_state` reports, not by index: an index from an earlier summary goes stale as soon as anything else changes the list, and updating, removing, or moving by it would silently pick a block the agent didn't mean. A key that doesn't resolve fails and names the blocks that can be acted on.

### Batches

The tool takes a list of operations rather than being six tools, because one request ("remove the intro, add a button at the end, and move the gallery up") is usually several, and splitting it across calls is what makes the positions in it stale. The operations are applied **in order**, each one seeing the content as the preceding ones left it. Blocks inserted by the batch can't be addressed by a later operation in it, because their keys are generated on insertion.

A batch is **all or nothing**. `planBlockEdits` converts and checks every operation against a working copy first, and only then is the result applied; an operation that fails rejects the whole batch, names its position, and leaves the page unchanged. Apart from not saving, there is no undo for these changes, so a half-applied batch would leave the user to repair it by hand. Warnings aren't failures: an inserted block that reports itself invalid is still inserted, as when the user adds an empty one.

The conversions are awaited and can query the API, and the user can keep typing meanwhile, or open another page. Before the batch is applied, the tool therefore checks that the page's content blocks are still the list it was planned against, and rejects the whole batch otherwise, asking the agent to read the page state again. Applying it anyway would overwrite the user's edits to an updated block, which is replaced by the copy converted while planning, or land the batch on another page. The edit page then applies the batch in one `setPageState` update, so the page is marked as changed once and the preview refreshes once. The actions aren't one registered callback each, looped over by the batch, either: each would read the blocks from the closure of the last render, so two appends would report the same position and end up in reverse order.

The tool schema states the fields each operation needs as an `anyOf` over the six operations. `anyOf` rather than `oneOf` because that is the keyword tool schemas support, and the `operation` constants make the branches exclusive anyway. A tool schema is guidance for the agent, not enforced before the handler runs, so `asBlockEditOperations` checks the same requirements itself and names the missing field and what it is for.

`edit_blocks` is created with `createAiModeEditBlocksTool` of `@dextinity/cms-admin`, which `edit_<entity>_form_blocks` shares its behavior with; `pageTools.ts` passes what is specific to the page, such as the block names that differ from their types. In the package, `planBlockEdits.ts` holds the operations, the results, and the planner, which know nothing of the tools; `blockEditTool.ts` the tool and what it shares with `edit_<entity>_form_blocks`: the schema of the operations, the check of what the agent passes, the parts of the descriptions, and the result; `blockChildren.ts` what one kind of change does to the list of blocks; `blockProps.ts` the conversion and the checks. The schema and the check take the name of the tool that reports the keys of the blocks, e.g. `get_page_state`, because each of the two tools has its own.

### What is validated, and where

- **The block type** of an insertion is checked against `supportedBlocks` of `PageContentBlock`, narrowed to the blocks `isBlockSupported` allows in the current content scope, as in the admin's own block picker: outside the "main" domain, for example, no news blocks can be inserted. Blocks already on the page can still be updated whatever their type. This is the one check the admin is authoritative for: only the admin knows these lists.
- **The conversion** through `output2State` is the only structural check that comes from the block definitions. It is weak: the default implementation passes its input through unchanged.
- **The block's own fields** are checked by converting the result back. A block keeps the fields it declares and drops the rest, so a field from the wrong block's schema would be lost without an error while the tool reports success. Comparing the fields passed in with the fields that come back out catches this, and the error names the fields the block has. Blocks nested inside the block aren't checked.
- **`isValid`** is reported as a warning, never as a failure. Its default returns `true`, and the core blocks that implement it only check a format and give no message.
- **The API's block input validators** are the final check, and they run when the page is saved. There is no validation-only endpoint.

The wrong schema is easy to get, because a block's type on the page isn't its name in `block-meta.json`, and the name that suggests itself is often a real block: `media` is `StandaloneMedia` rather than `Media`, `richtext` is `StandaloneRichText` rather than `RichText`, `heading` is `StandaloneHeading` rather than `Heading`, and `image` is `DamImage`. The tool therefore tells the agent where to start the schema lookup: the content is the `PageContent` block, and the schema for a type is found by following `PageContent`'s `inputFields` → `blocks` → `props` mapping in `get_block_schema`, never by guessing the name from the type. For the same reason, the edit page passes the block-meta name of the root block (`schemaRootBlockName`) instead of letting the tool read the admin block's `name`, which differs for some blocks (`StandaloneMediaBlock` is called `Media` in the admin).

### Partial updates

Fields left out of an update keep their current value, nested fields included, so the agent can change a headline without restating the block's layout and media. A list is replaced as a whole, which is also the only way to shorten one.

To merge, the block's current editor state is converted to the saved shape with `state2Output`, the agent's fields are merged in (`mergeBlockProps`), and the result is converted back. Starting from the editor state rather than from the saved page keeps the user's unsaved changes to other fields. The round trip is confined to the updated block, but it drops the states of inactive variants of a one-of block inside it, because they aren't part of the saved shape. An updated block keeps its key, position, and visibility.

### Inserted blocks

An inserted block starts from the block's default values in the same way: its `defaultValues` are converted to the saved shape and the agent's fields are merged in. Without that, a field the agent leaves out stays empty instead of taking its default, because `output2State` converts only the fields it is given; an image block inserted with only the image would show an empty aspect ratio select.

The block also gets the default values of the page content's additional item fields, as the admin's own "add block" does. In Demo, that is the user group: without `userGroup`, the API's validation refuses the page when it is saved. An inserted block slides in like one the user added, so the change is as noticeable.

### Positions and visibility

A move's `index` is the position in the **resulting** order, so `0` moves the block to the top and `from + 1` moves it one down. That is the position the agent reads back off the summary afterwards; an offset into the list as it stands before the move would differ by one for every downward move. An index out of range is clamped to the last position, so "move it to the bottom" doesn't require the agent to know the number of blocks. An insertion without `index` appends.

`show` and `hide` set the block's `visible` flag, the same flag as the toggle in the block list. They are operations of their own rather than a field of `update`, because they need no props and work for any block type, including one whose props the agent couldn't build.

A move to the current position, a `show` of a visible block, and a `hide` of a hidden one change nothing, and a batch of only such operations doesn't mark the page as changed. The results report where the block was and whether it was visible, so the agent sees that its request was already the case rather than reading success as a change.

A removal has no undo, unlike the admin's own deletion with its snackbar; leaving the page without saving still discards it.

### Scope

Only the top-level blocks of the page's content can be edited. The stage is a one-of block, where a variant is switched rather than appended, and the SEO block is a composite. Blocks inside a nested blocks block, such as a columns or content group block, can't be edited either: that would need block routes instead of keys, and the block definition of a nested block is known only to its parent. `get_page_state` reports nested keys too, so `findBlockByKey` says that a key is nested instead of saying it doesn't exist.

## How to test locally

Set the widget ID and its secret key in `.env.local`:

```env
AI_HUB_API_KEY=…
AI_HUB_WIDGET_ID=…
```

They turn on the AI Hub proxy and the MCP server in the API, and the switch and the CSP directives in the admin. The key and the ID of Demo's widget come from the team. Restart the API and the admin afterwards, and log in as a user with the `aiHub` permission, which every user in Demo has. Open the page tree and turn on the switch in the header.

The chat talks to the staging AI Hub through the API, so the requests of the chat and their warnings show up in the API's logs (`pnpm exec dev-pm logs --lines 100 demo-api`).

### Without the AI Hub

The host tools can be checked without the real AI Hub by serving a stub of the web component in Playwright. Set `AI_HUB_WIDGET_ID` to any value, so that the switch shows, and route the script of the web component to a module that defines `ai-hub-chat` with a `bridge` that keeps the tools it is given:

```ts
await page.route(process.env.AI_HUB_WEB_COMPONENT_SCRIPT_SRC!, (route) =>
    route.fulfill({
        contentType: "text/javascript",
        body: `
            customElements.define("ai-hub-chat", class extends HTMLElement {
                bridge = {
                    registerMcpServers: (servers) => { window.aiHubMcpServers = servers; },
                    registerHostTools: (tools) => { window.aiHubHostTools = tools; },
                    setContext: (context) => { window.aiHubContext = context; },
                };
            });
        `,
    }),
);
```

Then open a page in the page tree, turn on the switch, and call a tool's handler from the page, e.g. `page.evaluate(() => window.aiHubHostTools.find((tool) => tool.name === "get_page_state").handler({}))`. `edit_blocks` changes the editor the same way it does for the agent, and `window.aiHubContext` shows what is pushed, the selection included. The approval is the chat's, so the stub runs every call without asking.

The unit tests of the AI Mode run with `pnpm --filter dextinity-demo-admin run test:unit`.
