---
name: comet-admin-pages
description: |
    Best practices for building Comet admin page navigation patterns (Stack, StackSwitch, StackPage, StackLink), page layouts (StackToolbar, StackMainContent), RouterTabs, EditDialog, and SaveBoundary placement.
    TRIGGER when: user asks to create or modify admin pages, CRUD page structure, navigation patterns, page layouts, or asks about best practices for page structure, toolbars, tabs, or navigation in the Comet admin framework. Also trigger when the user mentions "toolbar", "entity toolbar", or asks to create/modify a toolbar for an entity. Also trigger when any user or agent action involves creating, modifying, or working on admin page components (Stack, StackSwitch, StackPage, RouterTabs, EditDialog, SaveBoundary, StackLink, StackToolbar, StackMainContent).
---

# Comet Admin Pages - Navigation Patterns

Build admin pages by composing navigation (Stack, StackSwitch), layout (StackToolbar, StackMainContent), and tab (RouterTabs) components. Choose the right navigation pattern based on complexity.

## Decision Guide

1. **Single page (form or grid)?** -> No StackSwitch needed, just Stack + StackToolbar + StackMainContent
2. **Grid + simple edit?** -> `useEditDialog` (dialog-based, no page navigation)
3. **Grid + complex edit?** -> `StackSwitch` with grid/add/edit `StackPage`s
4. **Edit with sections?** -> `RouterTabs` inside edit `StackPage`
5. **Nested CRUD inside tabs?** -> Nested `StackSwitch` inside `RouterTab`

## Core Components

| Component                   | Purpose                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `Stack`                     | Root wrapper, sets top-level breadcrumb title                                                 |
| `StackSwitch`               | Routes between sibling `StackPage`s (renders one at a time)                                   |
| `StackPage`                 | Individual page within a `StackSwitch`. Receives URL payload via render function              |
| `StackLink`                 | Router link for stack navigation (preferred over `activatePage`)                              |
| `StackPageTitle`            | Dynamically updates breadcrumb title (used in nested stacks)                                  |
| `StackToolbar`              | Toolbar that only renders in the active (deepest) stack                                       |
| `StackMainContent`          | Main content area. Use `fullHeight` prop for grids                                            |
| `ToolbarBackButton`         | Back navigation in toolbar                                                                    |
| `ToolbarAutomaticTitleItem` | Auto-displays stack page title in toolbar                                                     |
| `ToolbarActions`            | Container for action buttons (right side of toolbar)                                          |
| `FillSpace`                 | Flex spacer between toolbar items                                                             |
| `SaveBoundary`              | Manages save state, unsaved changes warning. Wraps form pages                                 |
| `SaveBoundarySaveButton`    | Save button integrated with SaveBoundary                                                      |
| `useEditDialog`             | Hook returning `[EditDialog, { id, mode }, editDialogApi]` for dialog-based CRUD              |
| `useStackSwitchApi`         | Access existing StackSwitch API from child components (e.g., redirect after create in a form) |
| `RouterTabs` / `RouterTab`  | URL-based tab navigation. Auto-hides parent tabs when nested                                  |
| `FullHeightContent`         | Full viewport height wrapper (for grids inside tabs)                                          |

## Key Rules

- **`StackSwitch` must always be wrapped in a `Stack`** component with a `topLevelTitle` prop. The `Stack` sets the top-level breadcrumb and is required for stack navigation to work. Never render `StackSwitch` without a parent `Stack`.
- Use `StackMainContent` (not `MainContent`) inside `Stack`/`StackSwitch` pages.
- Use `StackMainContent fullHeight` when the page contains only a DataGrid.
- Use `FullHeightContent` for DataGrids inside `RouterTab`s.
- Always wrap form pages in `SaveBoundary` with `SaveBoundarySaveButton` in toolbar.
- Always add a `ContentScopeIndicator` to the `StackToolbar` via the `scopeIndicator` prop. Use `<ContentScopeIndicator global />` for global/unscoped entities, or `<ContentScopeIndicator />` for scoped entities. Import from `@comet/cms-admin`.
- Prefer `<FormattedMessage>` over `intl.formatMessage()` wherever possible. Only use `intl.formatMessage()` when a prop requires a plain `string` type. Props like `topLevelTitle` and `title` on `Stack`, `StackPage`, `StackSwitch` etc. accept `ReactNode`, so use `<FormattedMessage>` there.
- Use `StackLink` for navigation (not `activatePage`) when possible. For programmatic navigation (e.g., redirect after create), use `useStackSwitchApi()` inside child components (returns `api` to access the nearest parent `StackSwitch`), or `useStackSwitch()` in the page component (returns `[Component, api]`, replaces `<StackSwitch>`).
- `StackPage name="edit"` uses render function `{(id) => ...}` to receive the URL payload.
- `StackPage name="add"` does not need a render function (no payload).
- `forceRender={true}` on `RouterTab` keeps form state when switching tabs (use for form tabs sharing a `SaveBoundary`). Do NOT use `forceRender` on tabs containing a nested `StackSwitch`.

## Patterns Reference

Visual demos of all patterns: [Storybook - Grid and Form Layouts](https://storybook.comet-dxp.com/?path=/docs/docs-best-practices-grid-and-form-layouts--docs)

Read the relevant pattern file from `references/` based on the use case:

| Pattern                                  | File                                              | When to use                                                                    |
| ---------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------ |
| Single Page (grid or form)               | [01](references/01-single-page.md)                | Page with just a grid or just a form, no sub-navigation                        |
| Grid with Edit in Dialog                 | [02](references/02-grid-with-dialog.md)           | Simple CRUD, small edit form in dialog                                         |
| Grid with Edit on Page                   | [03](references/03-grid-with-edit-page.md)        | Complex CRUD, full edit page via StackSwitch                                   |
| Grid with Edit Page with RouterTabs      | [04](references/04-edit-page-with-tabs.md)        | Grid + edit page with tabbed sections (form + grid tabs)                       |
| Deeply Nested Navigation                 | [05](references/05-deeply-nested.md)              | CRUD inside tabs inside CRUD                                                   |
| useStackSwitch (Programmatic Navigation) | [06](references/06-use-stack-switch.md)           | Programmatic navigation (e.g., redirect after create) with `useStackSwitch`    |
| ManyToMany Selection Tab                 | [07](references/07-many-to-many-selection-tab.md) | Tab with selected-items grid + modal selection dialog for ManyToMany relations |

## Dialog Rules

When using the Comet `Dialog` component (from `@comet/admin`):

- **Use the `title` prop** — never use MUI `DialogTitle` as a child. Comet's `Dialog` renders its own styled title with close button.
- **Never two primary buttons** — a dialog should have at most one prominent action. Use `variant="textDark"` for the cancel/dismiss button, and the default variant for the confirm action.
- **No `DialogContent` wrapper for DataGrids** — when the dialog body is a DataGrid, place the `DataGridPro` directly inside the `Dialog` (no `DialogContent`). This avoids unwanted padding/margin. Set `sx={{ height: "70vh" }}` on the DataGrid itself.
- **`DialogActions`** from `@mui/material` is fine for the button row at the bottom.

## Cross-Entity Navigation

- **`StackLink`** only works within the same `StackSwitch` — it navigates between sibling `StackPage`s.
- **For cross-entity links** (e.g., from a ProductCollection's products tab to the Product edit page), use `RouterLink` from `react-router-dom` with `contentScopeMatch.url` prefix:
    ```tsx
    import { Link as RouterLink } from "react-router-dom";
    const { match: contentScopeMatch } = useContentScope();
    // ...
    <IconButton component={RouterLink} to={`${contentScopeMatch.url}/other-entity/edit/${id}`}>
    ```

## DataGrids

When a page pattern includes a DataGrid, use the **comet-admin-datagrid** skill to generate it. This skill covers server-side filtering, sorting, pagination, column definitions, and toolbar variants.

## Toolbar Help Dialog

`StackToolbar` supports a `topBarActions` prop for placing a `HelpDialogButton` that opens a modal with help information about the current page. Use this when the user requests page-level help or when a page benefits from contextual guidance.

```tsx
import { HelpDialogButton } from "@comet/admin";

<StackToolbar
    scopeIndicator={<ContentScopeIndicator global />}
    topBarActions={
        <HelpDialogButton
            dialogTitle={<FormattedMessage id="products.helpDialog.title" defaultMessage="Help" />}
            dialogDescription={
                <Typography>
                    <FormattedMessage id="products.helpDialog.description" defaultMessage="Some helpful text about this page." />
                </Typography>
            }
        />
    }
>
    <ToolbarBackButton />
    <ToolbarAutomaticTitleItem />
</StackToolbar>;
```

- `dialogDescription` accepts `ReactNode` — can include images, formatted text, lists, etc.
- Only add when the user explicitly requests it or when a page clearly benefits from contextual help.

## Toolbar Patterns

Choose the right toolbar pattern based on complexity:

| Variant                     | File                                          | When to use                                                               |
| --------------------------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| Simple FormToolbar          | [toolbar-00](references/toolbar-00-simple.md) | No entity data needed in toolbar, title from automatic breadcrumbs        |
| Entity Toolbar (with Query) | [toolbar-01](references/toolbar-01-entity.md) | Toolbar fetches entity data (title, status), handles loading/error states |

**Default:** Use the **Entity Toolbar** (toolbar-01) for edit pages. Fall back to the **Simple FormToolbar** (toolbar-00) only for simple pages where the automatic breadcrumb title is sufficient and no entity-specific data is needed in the toolbar.
