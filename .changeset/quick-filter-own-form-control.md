---
"@dextinity/admin": patch
---

Prevent `GridToolbarQuickFilter` and `DataGridPagination` from interfering with a surrounding form field

Previously, when a data grid was rendered inside a form field, for instance in a dialog opened from a field, the quick filter's search input and the pagination's page size select registered with the field's `FormControl`.
This caused a console error about multiple inputs inside a `FormControl`, and the field and the data grid shared their focused, filled, disabled, and error state.
