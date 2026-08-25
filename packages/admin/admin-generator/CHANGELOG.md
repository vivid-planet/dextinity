# @comet/admin-generator

## 10.1.0

### Patch Changes

- @dextinity/admin@10.1.0
- @dextinity/admin-icons@10.1.0
- @dextinity/cms-admin@10.1.0

## 10.0.1

### Patch Changes

- Updated dependencies [48748b0]
    - @dextinity/admin@10.0.1
    - @dextinity/cms-admin@10.0.1
    - @dextinity/admin-icons@10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/admin-generator` to `@dextinity/admin-generator`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename the `comet-admin-generator` binary to `dextinity-admin-generator`:

        ```diff
        - "generate-admin": "comet-admin-generator generate"
        + "generate-admin": "dextinity-admin-generator generate"
        ```

    - Rename the config file suffix from `.cometGen.tsx` to `.dextinityGen.tsx`. The default file pattern is now `src/**/*.dextinityGen.{ts,tsx}`
    - Change the header of generated files. Rerun the generator to update them

### Patch Changes

- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
    - @dextinity/admin-icons@10.0.0
    - @dextinity/admin@10.0.0
    - @dextinity/cms-admin@10.0.0

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/admin-generator` to `@dextinity/admin-generator`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename the `comet-admin-generator` binary to `dextinity-admin-generator`:

        ```diff
        - "generate-admin": "comet-admin-generator generate"
        + "generate-admin": "dextinity-admin-generator generate"
        ```

    - Rename the config file suffix from `.cometGen.tsx` to `.dextinityGen.tsx`. The default file pattern is now `src/**/*.dextinityGen.{ts,tsx}`
    - Change the header of generated files. Rerun the generator to update them

### Patch Changes

- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
- Updated dependencies [085b9ac]
- Updated dependencies [0f17fbd]
    - @dextinity/admin-icons@10.0.0-beta.0
    - @dextinity/admin@10.0.0-beta.0
    - @dextinity/cms-admin@10.0.0-beta.0

## 9.5.0

### Patch Changes

- @comet/admin@9.5.0
- @comet/admin-icons@9.5.0
- @comet/cms-admin@9.5.0

## 9.4.0

### Patch Changes

- Updated dependencies [bf1ff64]
- Updated dependencies [ca88ec6]
- Updated dependencies [ca88ec6]
- Updated dependencies [4e27111]
- Updated dependencies [71d6a95]
- Updated dependencies [085b9ac]
- Updated dependencies [0f17fbd]
    - @comet/admin@9.4.0
    - @comet/cms-admin@9.4.0
    - @comet/admin-icons@9.4.0

## 9.3.0

### Patch Changes

- Updated dependencies [7b2d8db]
- Updated dependencies [924b66c]
    - @comet/admin@9.3.0
    - @comet/cms-admin@9.3.0
    - @comet/admin-icons@9.3.0

## 9.2.2

### Patch Changes

- @comet/admin@9.2.2
- @comet/admin-icons@9.2.2
- @comet/cms-admin@9.2.2

## 9.2.1

### Patch Changes

- @comet/admin@9.2.1
- @comet/admin-icons@9.2.1
- @comet/cms-admin@9.2.1

## 9.2.0

### Patch Changes

- Updated dependencies [ee0bf93]
- Updated dependencies [5a05d97]
- Updated dependencies [8c866a3]
- Updated dependencies [48d06d6]
- Updated dependencies [ba56f97]
- Updated dependencies [eb0b156]
    - @comet/cms-admin@9.2.0
    - @comet/admin@9.2.0
    - @comet/admin-icons@9.2.0

## 9.1.1

### Patch Changes

- Updated dependencies [097f85a]
    - @comet/cms-admin@9.1.1
    - @comet/admin@9.1.1
    - @comet/admin-icons@9.1.1

## 9.1.0

### Patch Changes

- Updated dependencies [319f5b8]
    - @comet/cms-admin@9.1.0
    - @comet/admin@9.1.0
    - @comet/admin-icons@9.1.0

## 9.0.1

### Patch Changes

- Updated dependencies [0c8063e]
    - @comet/cms-admin@9.0.1
    - @comet/admin@9.0.1
    - @comet/admin-icons@9.0.1

## 9.0.0

### Major Changes

- 99140f8: Bump MUI X Data Grid peer dependency to v8

    See the migration guide for information on how to upgrade.

- 0ec748a: Convert to ESM

    To upgrade, make the following changes to your `tsconfig.json`:

    ```diff
    {
        "compilerOptions": {
    -       "module": "ESNext",
    -       "moduleResolution": "Node",
    +       "module": "preserve",
    +       "moduleResolution": "bundler"
        }
    }
    ```

### Minor Changes

- f1e6145: Add `initialPageSize` option to `GridConfig` for the Admin Generator. When set, the value is passed as `pageSize` to `useDataGridRemote` in the generated DataGrid code.
- f066335: Add support for React 19

### Patch Changes

- Updated dependencies [4c1aeb2]
- Updated dependencies [92281f1]
- Updated dependencies [dc8f29c]
- Updated dependencies [15e771b]
- Updated dependencies [c0cee12]
- Updated dependencies [d7b77af]
- Updated dependencies [7fbe2a7]
- Updated dependencies [d7b77af]
- Updated dependencies [1475f4a]
- Updated dependencies [3cbf0ff]
- Updated dependencies [8a93124]
- Updated dependencies [8c2fdde]
- Updated dependencies [f066335]
- Updated dependencies [ee24125]
- Updated dependencies [b4ba869]
- Updated dependencies [0e9189b]
- Updated dependencies [c6703db]
- Updated dependencies [8cb0844]
- Updated dependencies [127a492]
- Updated dependencies [c6703db]
- Updated dependencies [fa5c7a4]
- Updated dependencies [5d006c1]
- Updated dependencies [31d9296]
- Updated dependencies [57678d0]
- Updated dependencies [fdabaf1]
- Updated dependencies [c7f80e9]
- Updated dependencies [8e40458]
- Updated dependencies [ae85ba9]
- Updated dependencies [25f7342]
- Updated dependencies [71dce06]
- Updated dependencies [5f1566a]
- Updated dependencies [99140f8]
- Updated dependencies [b459ec7]
- Updated dependencies [cabba53]
- Updated dependencies [790e8d0]
- Updated dependencies [8e3a074]
- Updated dependencies [3fda20b]
- Updated dependencies [f29b2d7]
- Updated dependencies [fd5c36f]
- Updated dependencies [3c81ff0]
- Updated dependencies [5e87236]
- Updated dependencies [631540c]
- Updated dependencies [7ab96c2]
- Updated dependencies [85b09a2]
- Updated dependencies [171c335]
- Updated dependencies [4729b3f]
- Updated dependencies [8ad9dd8]
- Updated dependencies [bc57b4a]
- Updated dependencies [2fe9d4b]
- Updated dependencies [460cbfb]
- Updated dependencies [9cb3f95]
- Updated dependencies [ab5e547]
    - @comet/cms-admin@9.0.0
    - @comet/admin@9.0.0
    - @comet/admin-icons@9.0.0

## 9.0.0-beta.6

### Patch Changes

- Updated dependencies [4c1aeb2]
- Updated dependencies [15e771b]
- Updated dependencies [7fbe2a7]
- Updated dependencies [b4ba869]
- Updated dependencies [0e9189b]
- Updated dependencies [57678d0]
- Updated dependencies [c7f80e9]
- Updated dependencies [b459ec7]
- Updated dependencies [5e87236]
- Updated dependencies [7ab96c2]
    - @comet/cms-admin@9.0.0-beta.6
    - @comet/admin@9.0.0-beta.6
    - @comet/admin-icons@9.0.0-beta.6

## 9.0.0-beta.5

### Patch Changes

- Updated dependencies [c0cee12]
- Updated dependencies [3cbf0ff]
- Updated dependencies [8cb0844]
- Updated dependencies [5d006c1]
- Updated dependencies [fdabaf1]
- Updated dependencies [8ad9dd8]
    - @comet/cms-admin@9.0.0-beta.5
    - @comet/admin@9.0.0-beta.5
    - @comet/admin-icons@9.0.0-beta.5

## 9.0.0-beta.4

### Patch Changes

- Updated dependencies [d7b77af]
- Updated dependencies [d7b77af]
- Updated dependencies [c6703db]
- Updated dependencies [127a492]
- Updated dependencies [c6703db]
- Updated dependencies [fa5c7a4]
- Updated dependencies [31d9296]
- Updated dependencies [8e40458]
- Updated dependencies [ae85ba9]
- Updated dependencies [2fe9d4b]
- Updated dependencies [460cbfb]
- Updated dependencies [ab5e547]
    - @comet/admin@9.0.0-beta.4
    - @comet/cms-admin@9.0.0-beta.4
    - @comet/admin-icons@9.0.0-beta.4

## 9.0.0-beta.3

### Minor Changes

- f1e6145: Add `initialPageSize` option to `GridConfig` for the Admin Generator. When set, the value is passed as `pageSize` to `useDataGridRemote` in the generated DataGrid code.

### Patch Changes

- Updated dependencies [dc8f29c]
- Updated dependencies [1475f4a]
- Updated dependencies [8a93124]
- Updated dependencies [71dce06]
- Updated dependencies [cabba53]
- Updated dependencies [f29b2d7]
- Updated dependencies [3c81ff0]
- Updated dependencies [4729b3f]
    - @comet/cms-admin@9.0.0-beta.3
    - @comet/admin@9.0.0-beta.3
    - @comet/admin-icons@9.0.0-beta.3

## 9.0.0-beta.2

### Major Changes

- 99140f8: Bump MUI X Data Grid peer dependency to v8

    See the migration guide for information on how to upgrade.

### Patch Changes

- Updated dependencies [92281f1]
- Updated dependencies [25f7342]
- Updated dependencies [99140f8]
- Updated dependencies [9cb3f95]
    - @comet/admin@9.0.0-beta.2
    - @comet/admin-icons@9.0.0-beta.2
    - @comet/cms-admin@9.0.0-beta.2

## 9.0.0-beta.1

### Patch Changes

- Updated dependencies [8c2fdde]
- Updated dependencies [8e3a074]
- Updated dependencies [85b09a2]
- Updated dependencies [171c335]
    - @comet/cms-admin@9.0.0-beta.1
    - @comet/admin@9.0.0-beta.1
    - @comet/admin-icons@9.0.0-beta.1

## 9.0.0-beta.0

### Major Changes

- 0ec748a: Convert to ESM

    To upgrade, make the following changes to your `tsconfig.json`:

    ```diff
    {
        "compilerOptions": {
    -       "module": "ESNext",
    -       "moduleResolution": "Node",
    +       "module": "preserve",
    +       "moduleResolution": "bundler"
        }
    }
    ```

### Minor Changes

- f066335: Add support for React 19

### Patch Changes

- Updated dependencies [f066335]
- Updated dependencies [ee24125]
- Updated dependencies [5f1566a]
- Updated dependencies [790e8d0]
- Updated dependencies [3fda20b]
- Updated dependencies [fd5c36f]
- Updated dependencies [631540c]
    - @comet/admin-icons@9.0.0-beta.0
    - @comet/admin@9.0.0-beta.0
    - @comet/cms-admin@9.0.0-beta.0

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
