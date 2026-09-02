# @comet/admin-generator

## 8.31.0

## 8.30.1

## 8.30.0

## 8.29.0

## 8.28.2

## 8.28.1

## 8.28.0

## 8.27.1

## 8.27.0

## 8.26.0

## 8.25.1

## 8.25.0

## 8.24.5

## 8.24.4

## 8.24.3

## 8.24.2

## 8.24.1

## 8.24.0

## 8.23.4

## 8.23.3

## 8.23.2

## 8.23.1

## 8.23.0

## 8.22.0

## 8.21.1

## 8.21.0

## 8.20.4

## 8.20.3

## 8.20.2

## 8.20.1

## 8.20.0

## 8.19.0

### Patch Changes

- 4bb3d09: Fix Prettier formatting in monorepo setups by using the Prettier API directly instead of the CLI

## 8.18.0

### Patch Changes

- b35454a: Fix `asyncSelect` form field generation and `staticSelect` grid column generation for nested fields from 1:1 relations (e.g., `"product.category"`)
- 69324f9: Grid: Fix emitting string literals for non-string `initialFilter` values

## 8.17.1

## 8.17.0

### Minor Changes

- cd854dc: Grid: Add automatic `onRowClick` navigation

    Generated grids now automatically navigate to the edit page when a row is clicked, improving user experience.
    - When `rowActionProp` is `false` (default): generates a `handleRowClick` handler using `useStackSwitchApi().activatePage("edit", id)`
    - When `rowActionProp` is `true`: adds an `onRowClick` prop to allow parent components to implement needed action

- 45163f1: Grid: Enable client side filter and sort when non paging api is used

## 8.16.0

## 8.15.0

### Minor Changes

- 82ff4c2: Form field boolean: use `label` as field label (before: checkbox label) and add new `checkboxLabel` option
- 14f9ef0: Add support for `<FormattedMessage />` in staticSelect values label
- 39a9bb0: Make paging conditional in grid generation: only add paging args (`offset`, `limit`) and paging return (`totalCount`, nested `nodes`) when the GQL schema query returns a paginated type
- cc96333: Add support for custom error responses in update and create mutation and show it in form as submission error

### Patch Changes

- 33ac500: Use the GraphQL schema scope type in generated grids when scope comes from context.
- 47ed8cf: Only emit grid sort variables and helpers when the schema supports sorting.

## 8.14.0

### Patch Changes

- 540f8c8: Form: Use scope type from gql schema when using scope from context

## 8.13.0

### Minor Changes

- 94abd9b: Add initialValuesAsProp config to generate a initialValues prop for the form that allows injecting dynamic initialValues

## 8.12.0

### Minor Changes

- 12466e4: CrudContextMenu: add deleteType ("delete"|"remove") that changes menu item and dialog from delete to remove for non-destructive data (relations)

## 8.11.1

### Patch Changes

- 64bd5f4: Revert "Replace ts-node with jiti"

    This broke import aliases (e.g, `@src/`) in config files.

- 0839bd6: Fix accidentally formatting all files

## 8.11.0

### Minor Changes

- 438e182: Replace ts-node with jiti

    This in preparation for the upcoming switch to ESM.

- 4bb9e21: Format generated files using prettier
- 0998531: Grid: add support for density setting to specify grid density programmatically
- 52006d2: Allow usage of `<FormattedMessage>` for user visible stings in config to allow customizing message ids
- f293762: Grid: Add support for column visible=false (not just breakpoints)
- 0371889: Grid: Add crudContextMenu.deleteText that allows customizing the menu item text for delete action
- 222ff35: Form: don't use `string` as form value for number fields as `NumberField` uses `number`

## 8.10.0

### Minor Changes

- 6570d03: Grid headerName: don't generate FormattedMessage for empty header (empty string)

## 8.9.0

## 8.8.0

### Minor Changes

- 6c6ea5e: Detect installed MUI X Data Grid package (community/pro/premium) and generate code accordingly
- 8575871: Add initialValue to form config for static initial values
- e16e1f9: Grid: support non-null sort argument

## 8.7.1

## 8.7.0

### Minor Changes

- bfb954e: Form: add support for fields accessing nested objects (e.g., Embeddable in MikroORM)
- 91f0b8d: Add injectFormVariables helper function to inject id, mode, client or formApi into validator

## 8.6.0

## 8.5.2

## 8.5.1

### Patch Changes

- 2be11c4: Fix incorrect `GridRenderCellParams` generic usage in `rowAction`
- ad9b20e: Grid: Fix type for forwarded prop, GQL prefix was missing for objects
- 1383c89: Restore persisted column state of generated DataGrid.

    **What changed**
    - Wrapped the DataGrid's column definitions in `useMemo` to ensure the `columns` prop keeps a stable reference between renders.

    **Why**
    - According to the MUI DataGrid documentation, the `columns` prop must keep the same reference across renders for persisted column state (width, order, visibility) to work correctly.
    - Previously, column definitions were re-created on every render, which caused loss of the persisted state.

    **Result**
    - Column width and order are now properly restored across all admin-generated DataGrids.

## 8.5.0

### Minor Changes

- 7806dd1: Add scopeAsProp to grid and form to generate a scope prop that needs to be passed into the generated grid/form
- c96e920: Add FormConfig.navigateOnCreate (defaults to true) to allow disabling the navigation to edit page after successful create mutation
- 7806dd1: form: add scope to create mutation (if any), defaulting to using the current scope from context (as grid does it) [breaking]

## 8.4.2

## 8.4.1

## 8.4.0

### Minor Changes

- 52f56b9: asyncSelect: add support for autocomplete, defaulting to true if rootQuery has a search argument [breaking]

## 8.3.0

### Minor Changes

- 3f832dd: Remove virtual setting from form config
- 00dd172: Support filtering asyncSelectFilter to allow multiple levels of filtered selects
- dbd83d6: Use `Future_DatePickerField` instead of `FinalFormDatePicker`
- 5ba61ab: Add form field type asyncSelectFilter that can be used to filter an asyncSelect
- f49b3c3: Use `Future_DateTimePickerField` instead of `DateTimePickerField`
- 4a65444: staticSelect/asyncSelect: add support for multiple (array) values, autodetects LIST fields in GraphQL schema

### Patch Changes

- ba0c023: Fix generating column for nested date field
- ebc6fff: Form Generation: `StaticSelect` with `inputType: "select"` now generates `SelectField` instead of `Field` + `FinalFormSelect`.
- fb9b950: Fix sending null for date field
- 512bd43: Fix selection for `selectionProps` `"singleSelect"`: set `disableRowSelectionOnClick` to `false`

## 8.2.0

### Minor Changes

- 67c52d5: Admin Generator: support export boolean column as real boolean column
- ef669d4: **Breaking:** Rename `filter.gqlName` to `filter.rootQueryArg` and `filter.fieldName` to `filter.formFieldName` for `asyncSelect` form fields

    This is done to better reflect what the options are used for.
    To upgrade, rename the fields in your Admin Generator configs:

    ```diff
    {
        fields: [
            {
                type: "asyncSelect",
                name: "manufacturer",
                rootQuery: "manufacturers",
                filter: {
                    type: "typeField",
    -               fieldName: "manufacturerCountry",
    +               formFieldName: "manufacturerCountry",
    -               gqlName: "addressAsEmbeddable_country",
    +               rootQueryArg: "addressAsEmbeddable_country",
                },
            },
        ];
    }
    ```

- 7f066d1: Admin Generator: Allow fetching additional fields for action columns

## 8.1.1

## 8.1.0

### Patch Changes

- 2fa023d: Fix disabling row selection on click
- 76586dc: Fix generated `ToolbarProps` for `excelExport`-only case

    When generating `ToolbarProps` with `forwardToolbarAction = false` and `excelExport = true`, the generator previously inserted `false` into the generated interface, causing invalid TypeScript output.

    **Example broken output**

    ```ts
    interface BooksGridToolbarToolbarProps extends GridToolbarProps {
        false;
        exportApi: ExportApi;
    }
    ```

- 00e7400: Fix generating too many props for grid-component

    This happened if there was a required root gql-arg for the corresponding create-mutation to support copy/paste.

- 177cb58: Fix missing required root gql-arg for export-query
- dc69279: Admin-Generator: Fix missing readOnly props for async-select
- ded0cbc: Admin-Generator: Fix using wrong query-var for export

## 8.0.0

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

- 8ef9a56: Use `GraphQLLocalDate` instead of `GraphQLDate` for date-only columns

    The `GraphQLDate` scalar coerces strings (e.g., `2025-06-30`) to `Date` objects when used as an input type.
    This causes problems when used in combination with MikroORM v6, which treats date-only columns as strings.
    Since using strings is preferred, the `GraphQLLocalDate` scalar is used instead, which performs no type coercion.

    **How to upgrade**
    1. Use `string` instead of `Date` for date-only columns:

    ```diff
    class Product {
        @Property({ type: types.date, nullable: true })
        @Field(() => GraphQLDate, { nullable: true })
    -   availableSince?: Date = undefined;
    +   availableSince?: string = undefined;
    }
    ```

    2. Use `GraphQLLocalDate` instead of `GraphQLDate`:

    ```diff
    - import { GraphQLDate } from "graphql-scalars";
    + import { GraphQLLocalDate } from "graphql-scalars";

    class Product {
        @Property({ type: types.date, nullable: true })
    -   @Field(() => GraphQLDate, { nullable: true })
    +   @Field(() => GraphQLLocalDate, { nullable: true })
        availableSince?: string = undefined;
    }
    ```

    3. Add the `LocalDate` scalar to `codegen.ts`:

    ```diff
    scalars: rootBlocks.reduce(
        (scalars, rootBlock) => ({ ...scalars, [rootBlock]: rootBlock }),
    +   { LocalDate: "string" }
    )
    ```

- 584f785: Move Admin Generator into separate `@comet/admin-generator` package.

    It can be run with the same `comet-admin-generator` command as before.

## 8.0.0-beta.6

## 8.0.0-beta.5

## 8.0.0-beta.4

## 8.0.0-beta.3

## 8.0.0-beta.2

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

## 8.0.0-beta.1

## 8.0.0-beta.0

### Major Changes

- 584f785: Move Admin Generator into separate `@comet/admin-generator` package.

    It can be run with the same `comet-admin-generator` command as before.
