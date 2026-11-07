---
"@dextinity/cms-admin": major
---

Remove the `dataGrid` option of `DextinityConfigProvider` and the MUI X peer dependencies

The package's grids and the table block are built with `@dextinity/ui`, so nothing in it uses an MUI X data grid anymore. Remove the option and, unless your project uses it itself, the `@mui/x-data-grid-pro` dependency and its license key:

```diff
 <DextinityConfigProvider
-    dataGrid={{ component: DataGridPro }}
 >
```

Keep `@mui/x-data-grid` and `@mui/x-date-pickers`: `@dextinity/admin` still requires them as peer dependencies.
