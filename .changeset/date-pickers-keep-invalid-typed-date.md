---
"@dextinity/admin": patch
---

Keep the typed day in `DateTimePicker`, `DateTimeRangePicker` and `DateRangePicker` when the date is invalid while typing

Typing a date can pass through a date that doesn't exist. For instance, typing "31" into the day of a date in November gives 31 November.
`DateTimePicker` and `DateTimeRangePicker` ignored such a date, and `DateRangePicker` threw a `RangeError`. As a result, MUI X removed the second digit, and the picker stored 3 November.
The pickers now change their value to empty for an invalid date, as `DatePicker` already does, so the typed text stays and the user can finish typing the date.
