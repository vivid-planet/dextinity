---
"@dextinity/cms-api": patch
---

Validate the columns, rows and cells of `createTableBlock`

Before, the API saved a table block without validating its content. For example, it saved a `javascript:` link in a cell, which the rich text block rejects outside a table.
