---
"@dextinity/cms-admin": major
---

Remove the `dataGrid` option of `DextinityConfigProvider` and the MUI X peer dependencies

The package's grids and the table block are built with `@dextinity/ui`, so nothing in it uses an MUI X data grid anymore. Remove the option and, unless your project uses MUI X itself, the `@mui/x-data-grid` and `@mui/x-data-grid-pro` dependencies:

```diff
 <DextinityConfigProvider
-    dataGrid={{ component: DataGridPro }}
 >
```

`@dextinity/admin` still requires `@mui/x-data-grid` and `@mui/x-date-pickers` as peer dependencies.
