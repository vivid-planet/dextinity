---
"@dextinity/admin": patch
---

Await Excel export download in `useDataGridExcelExport`, `useExportTableQuery` and `useExportPagedTableQuery`

Previously, errors while generating the Excel file weren't caught and the loading state was reset before the download started.
