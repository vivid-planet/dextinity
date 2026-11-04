---
"@dextinity/admin": patch
---

Wait for the Excel file in the export hooks

The Excel export hooks (`useExportTableQuery`, `useExportPagedTableQuery`, `useExportDisplayedTableData` and `useDataGridExcelExport`) didn't wait for the Excel file to be written.
As a result, the loading state was reset before the file was downloaded, and errors thrown while writing the file weren't caught by the hooks' error handling.
