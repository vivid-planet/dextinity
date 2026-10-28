---
"@dextinity/admin": major
"@dextinity/admin-color-picker": major
"@dextinity/admin-date-time": major
"@dextinity/admin-generator": major
"@dextinity/admin-icons": major
"@dextinity/admin-rte": major
"@dextinity/brevo-admin": major
"@dextinity/cms-admin": major
---

Require MUI v9 and MUI X v9

The admin packages require `@mui/material` v9 and, where used, `@mui/x-data-grid` and `@mui/x-date-pickers` v9.

MUI v9 removes the system props, the deprecated component props and the deprecated CSS classes. Migrate your project with the codemods from the [Material UI migration guide](https://mui.com/material-ui/migration/upgrade-to-v9/) and follow the [Data Grid](https://mui.com/x/migration/migration-data-grid-v8/) and [Date and Time Pickers](https://mui.com/x/migration/migration-pickers-v8/) migration guides.

MUI X v9 requires a new license key for the Pro and Premium packages.

The Admin Generator renders the buttons linking to a stack page with `nativeButton={false}`, which MUI v9 requires for buttons rendered as a link.

See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for all required changes.
