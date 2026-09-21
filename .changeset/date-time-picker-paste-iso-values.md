---
"@dextinity/admin": patch
---

Support pasting ISO values into the date and time pickers

Pasting only worked when the copied value matched the field's display format (e.g. `01/15/2024` or `02:30 PM`). Values copied from an API response, the database or a URL are usually ISO 8601 (`2024-01-15`, `2024-01-15T14:30:00`, `14:30`), and pasting those cleared the field instead of setting it.

`DatePicker`, `DateTimePicker`, `TimePicker`, `DateRangePicker`, `DateTimeRangePicker` and `TimeRangePicker` now accept them as well. In the range pickers, a pasted value replaces the date or time the cursor is in and leaves the other one untouched.
