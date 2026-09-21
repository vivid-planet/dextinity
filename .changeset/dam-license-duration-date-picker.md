---
"@dextinity/cms-admin": patch
---

Allow typing the DAM licence duration dates

The licence duration fields used the deprecated `FinalFormDatePicker` from `@dextinity/admin-date-time`, which renders a read-only input, so a date could only be picked from the calendar. They now use `DatePickerField` from `@dextinity/admin`, which accepts keyboard input.

The fields are labelled "From" and "To" instead of using untranslated `from`/`to` placeholders, and the calendar icon moved from the end to the start of the input.

`@dextinity/cms-admin` no longer depends on `@dextinity/admin-date-time`.
