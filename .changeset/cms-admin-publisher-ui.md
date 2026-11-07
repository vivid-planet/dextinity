---
"@dextinity/cms-admin": major
---

Build `PublisherPage`, `StartBuildsDialog` and `BuildEntry` with `@dextinity/ui`

The publisher lists the builds in the `DataGrid` of `@dextinity/ui`, shows the progress of a running build and when the next automatic publication is planned, and refreshes every 10 seconds. Starting builds manually is a form with a checkbox per build template.

`BuildEntry` is a `Popover` with an `IconButton` trigger instead of an `AppHeaderDropdown`, so it belongs in a `TopBar` of `@dextinity/ui` rather than the MUI `AppHeader`.
