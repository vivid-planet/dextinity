---
name: comet-admin-datagrid
description: |
    Generates and modifies server-side MUI DataGrid components for a Comet DXP admin project. All filtering, sorting, searching, and pagination are handled server-side using Apollo Client and @comet/admin hooks.
    TRIGGER when: user says "create a datagrid for X", "add a grid for X", "build a list view for X", "generate a datagrid", or any similar phrase requesting a data table or grid component. Also trigger when the user asks to add, remove, or modify columns, filters, toolbar actions, or any other aspect of an existing DataGrid.
---

# Comet DataGrid Skill

Generate server-side DataGrid components by reading the GraphQL schema, determining columns, and producing the grid files following the patterns in `references/`.

## Prerequisites

1. **Read the GraphQL schema** for the target entity to determine: list query signature (`filter`, `limit`, `offset`, `search`, `sort`), paginated return type, available fields, and whether a `deleteXxx` mutation exists.
2. **Check MUI DataGrid package** in `admin/package.json` — use whichever variant is installed (`DataGrid`, `DataGridPro`, or `DataGridPremium`).
3. **Confirm output path** with the user if not obvious from context.

## Core Imports

| Import                     | Source         | Purpose                                            |
| -------------------------- | -------------- | -------------------------------------------------- |
| `useDataGridRemote`        | `@comet/admin` | Server-side pagination, sorting, filtering         |
| `useDataGridUrlState`      | `@comet/admin` | Client-side state for non-paginated grids          |
| `usePersistentColumnState` | `@comet/admin` | Persist column visibility/order                    |
| `useBufferedRowCount`      | `@comet/admin` | Prevent flickering row count during loading        |
| `useDataGridExcelExport`   | `@comet/admin` | Excel export hook                                  |
| `muiGridFilterToGql`       | `@comet/admin` | Convert MUI filter model to GQL filter/search      |
| `muiGridSortToGql`         | `@comet/admin` | Convert MUI sort model to GQL sort                 |
| `GridColDef`               | `@comet/admin` | Typed column definition                            |
| `GridCellContent`          | `@comet/admin` | Rich cell with primary/secondary text and icon     |
| `CrudContextMenu`          | `@comet/admin` | Delete action context menu                         |
| `CrudMoreActionsMenu`      | `@comet/admin` | Toolbar overflow menu (e.g. excel export)          |
| `DataGridToolbar`          | `@comet/admin` | Toolbar wrapper for DataGrid                       |
| `GridFilterButton`         | `@comet/admin` | Opens column filter panel                          |
| `FillSpace`                | `@comet/admin` | Flex spacer between toolbar items                  |
| `Tooltip`                  | `@comet/admin` | Tooltip for column header info icons               |
| `ExportApi`                | `@comet/admin` | Type for excel export API                          |
| `messages`                 | `@comet/admin` | Pre-defined i18n messages (e.g. `downloadAsExcel`) |
| `renderStaticSelectCell`   | `@comet/admin` | Render function for static select (enum) columns   |
| `dataGridDateTimeColumn`   | `@comet/admin` | Spread into DateTime columns                       |
| `dataGridDateColumn`       | `@comet/admin` | Spread into LocalDate columns                      |
| `dataGridManyToManyColumn` | `@comet/admin` | Spread into ManyToMany columns                     |
| `dataGridOneToManyColumn`  | `@comet/admin` | Spread into OneToMany columns                      |
| `dataGridIdColumn`         | `@comet/admin` | Spread into ID columns                             |

## Grid Variants & Features

**Always read [grid-00-standard-paginated.md](references/grid-00-standard-paginated.md) first** — it is the base pattern. Then read any applicable variant/feature files:

| Variant / Feature             | When to use                                                 | State hook            | Key differences                                                                   | Reference                                                                     |
| ----------------------------- | ----------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Standard paginated** (base) | Query returns `{ nodes, totalCount }` with `offset`/`limit` | `useDataGridRemote`   | Default pattern with server-side sort/filter/search                               | [grid-00-standard-paginated.md](references/grid-00-standard-paginated.md)     |
| **Non-paginated**             | Query returns flat `[Entity!]!` list                        | `useDataGridUrlState` | No offset/limit/filter/search/sort vars, no rowCount                              | [grid-01-non-paginated.md](references/grid-01-non-paginated.md)               |
| **Row reordering**            | Entity has `position` field, drag-and-drop ordering         | `useDataGridRemote`   | Fixed sort by position, `rowReordering`, `hideFooterPagination`, no filter/search | [grid-02-row-reordering.md](references/grid-02-row-reordering.md)             |
| **Sub-entity**                | Grid scoped to a parent (e.g. variants of a product)        | `useDataGridRemote`   | Parent ID as required prop, forwarded to query vars                               | [grid-03-sub-entity.md](references/grid-03-sub-entity.md)                     |
| **Select / Checkbox**         | Picker dialog for selecting entities                        | `useDataGridRemote`   | `checkboxSelection`, no actions column, no delete                                 | [grid-04-select.md](references/grid-04-select.md)                             |
| **Excel export**              | User needs to export grid data                              | any                   | `useDataGridExcelExport`, `CrudMoreActionsMenu` in toolbar                        | [grid-05-excel-export.md](references/grid-05-excel-export.md)                 |
| **Responsive columns**        | Different layouts for mobile vs desktop                     | any                   | `visible: theme.breakpoints.up/down()`, overview column                           | [grid-06-responsive-columns.md](references/grid-06-responsive-columns.md)     |
| **Initial sort/filter**       | Grid should start with pre-applied sort or filter           | `useDataGridRemote`   | `initialSort` / `initialFilter` options                                           | [grid-07-initial-sort-filter.md](references/grid-07-initial-sort-filter.md)   |
| **External filter prop**      | Grid filtered by parent context                             | any                   | `filter` prop combined via `{ and: [gqlFilter, filter] }`                         | [grid-08-external-filter-prop.md](references/grid-08-external-filter-prop.md) |
| **Content scope**             | Entity query requires a `scope` argument                    | any                   | `useContentScope()` from `@comet/cms-admin`, pass `scope` to query vars           | [grid-09-content-scope.md](references/grid-09-content-scope.md)               |

These can be combined — e.g. a sub-entity grid with excel export and responsive columns.

## Key Rules

- Ask the user which fields to show as columns, or infer sensible defaults (e.g. `title`, `status`, `createdAt`). Keep defaults minimal.
- **Enum columns always render as chips with a filterable select by default.** For every enum column: (1) search for an existing chip component (`**/<EnumName>Chip.tsx`) — if none exists, use the `comet-admin-enum` skill to create one first; (2) always add `type: "singleSelect"` and `valueOptions` using the `messageDescriptorMapToValueOptions` helper to make the column filterable. Import the enum's `messageDescriptorMap` from the translatable enum file. See [grid-col-def-05-enum.md](references/grid-col-def-05-enum.md) for the full pattern and helper function. Only use `renderStaticSelectCell` when the user explicitly requests it.
- ManyToOne relation columns require a custom filter component — see [grid-col-def-13-relation-filter.md](references/grid-col-def-13-relation-filter.md).
- Always define columns inside `useMemo` to ensure stable `GridColDef` references and prevent unnecessary re-renders.
- Only include fields actually used in grid columns in the GQL fragment.

## Toolbar Variants

| Variant             | When to use                                                             | Reference                                                                         |
| ------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Standard**        | Default toolbar with search, filter, and add button                     | [grid-toolbar-00-standard.md](references/grid-toolbar-00-standard.md)             |
| **Excel export**    | Adds export action via `CrudMoreActionsMenu`, receives `exportApi` prop | [grid-toolbar-01-excel-export.md](references/grid-toolbar-01-excel-export.md)     |
| **Row reordering**  | No search/filter, only add button                                       | [grid-toolbar-02-row-reordering.md](references/grid-toolbar-02-row-reordering.md) |
| **Select / Picker** | Search and filter only, no add button                                   | [grid-toolbar-03-select.md](references/grid-toolbar-03-select.md)                 |

## Column Type Reference

Read the relevant column file based on the field type from the GraphQL schema:

| Column Type          | File                                                                                  | When to use                                       |
| -------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------- |
| String               | [grid-col-def-01-string.md](references/grid-col-def-01-string.md)                     | String/text fields (primary label, secondary)     |
| Boolean              | [grid-col-def-02-boolean.md](references/grid-col-def-02-boolean.md)                   | Boolean fields                                    |
| Number               | [grid-col-def-03-number.md](references/grid-col-def-03-number.md)                     | Int, Float, currency fields                       |
| DateTime / LocalDate | [grid-col-def-04-datetime.md](references/grid-col-def-04-datetime.md)                 | DateTime, LocalDate, audit timestamps             |
| Enum                 | [grid-col-def-05-enum.md](references/grid-col-def-05-enum.md)                         | Enum fields (chip component or static select)     |
| ManyToOne            | [grid-col-def-06-many-to-one.md](references/grid-col-def-06-many-to-one.md)           | ManyToOne relation fields                         |
| ManyToMany           | [grid-col-def-07-many-to-many.md](references/grid-col-def-07-many-to-many.md)         | ManyToMany / array of relations                   |
| OneToMany            | [grid-col-def-08-one-to-many.md](references/grid-col-def-08-one-to-many.md)           | OneToMany / child entity list                     |
| Array of Scalars     | [grid-col-def-09-array-of-scalars.md](references/grid-col-def-09-array-of-scalars.md) | Array of primitive values                         |
| Nested Object        | [grid-col-def-10-nested-object.md](references/grid-col-def-10-nested-object.md)       | Nested scalar objects (with deep nesting support) |
| FileUpload           | [grid-col-def-11-file-upload.md](references/grid-col-def-11-file-upload.md)           | FileUpload (image, document) and DAM Image        |
| ID                   | [grid-col-def-12-id.md](references/grid-col-def-12-id.md)                             | ID column display                                 |
| Relation Filter      | [grid-col-def-13-relation-filter.md](references/grid-col-def-13-relation-filter.md)   | Custom filter for ManyToOne relation columns      |
