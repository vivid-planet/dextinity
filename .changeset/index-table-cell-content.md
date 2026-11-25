---
"@dextinity/cms-api": patch
---

Index the content of table cells

The table block didn't report its cells as child blocks, so the dependencies, the search text and the block warnings left out everything inside a cell, for example a link to another page.

For existing content, the dependencies are updated when the `migrateBlocks` command runs after the deployment.
The search text of a page is only updated when the page is saved again, and its warnings when it's saved or on the next run of the `check-warnings` command.
