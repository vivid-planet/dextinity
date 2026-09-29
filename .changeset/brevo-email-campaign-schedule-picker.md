---
"@dextinity/brevo-admin": patch
---

Allow typing the email campaign schedule date

The schedule field used the deprecated `FinalFormDateTimePicker` from `@dextinity/admin-date-time`, which renders a read-only input, so the date and time could only be picked from the calendar. It now uses `DateTimePickerField` from `@dextinity/admin`, which accepts keyboard input.

`@dextinity/brevo-admin` no longer depends on `@dextinity/admin-date-time`.
