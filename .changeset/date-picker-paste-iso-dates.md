---
"@dextinity/admin": patch
---

Support pasting ISO dates into `DatePicker`

Pasting into the field only worked when the copied date matched the field's display format (e.g. `01/15/2024`). Dates copied from an API response, the database or a URL are usually ISO 8601 (`2024-01-15`), and pasting those cleared the field instead of setting it. They are now accepted as well, with an optional time part being ignored.
