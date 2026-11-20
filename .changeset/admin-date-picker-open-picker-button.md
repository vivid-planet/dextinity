---
"@dextinity/admin": major
---

Remove the `openPickerAdornment` slot of the date and time pickers

`DatePicker`, `DateTimePicker`, `TimePicker` and `DateRangePicker` render the open picker button of MUI X now, positioned at the start of the input. `DateTimeRangePicker` and `TimeRangePicker` keep their own button, because the two-input fields of MUI X don't render one.

The `openPickerAdornment` slot and the `DextinityAdminOpenPickerAdornment` theme key are removed from all six pickers. Pass the props of the button with `slotProps.root.slotProps.openPickerButton` instead:

```diff
  <DatePicker
      slotProps={{
-         openPickerAdornment: {
-             slotProps: { openPickerButton: { "aria-label": "Choose a date" } },
-         },
+         root: {
+             slotProps: { openPickerButton: { "aria-label": "Choose a date" } },
+         },
      }}
  />
```

Move the customizations of the `DextinityAdminOpenPickerAdornment` theme key to `slotProps.root.slotProps.openPickerButton` in the `defaultProps` of each picker, e.g. `DextinityAdminDatePicker`.
