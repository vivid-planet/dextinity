---
"@dextinity/admin": major
"@dextinity/admin-color-picker": major
---

Replace the MUI props removed in MUI v9 in the props of the admin components

The following props forwarded the MUI props removed in MUI v9 and use their replacements now:

- `ToolbarBreadcrumbs`: `slotProps.mobileMenu.MenuListProps` and `slotProps.mobileMenu.PaperProps` become `slotProps.mobileMenu.slotProps.list` and `slotProps.mobileMenu.slotProps.paper`
- `MainNavigation`: `slotProps.permanentDrawer.PaperProps` becomes `slotProps.permanentDrawer.slotProps.paper`
- `FilterBarPopoverFilter`: `slotProps.popover.PaperProps` becomes `slotProps.popover.slotProps.paper`
- `Tabs`: `ScrollButtonComponent` becomes `slots.scrollButtons`
- `RouterTabs`: `tabsProps.ScrollButtonComponent` becomes `tabsProps.slots.scrollButtons`
- `InputWithPopper`: `components` only accepts `Transition`, pass the slots of the input with `slots`
- `ColorPicker`: `components` only accepts `Transition` and the preview components, pass the slots of the input with `slots`
- `RowActionsSubMenu`: `componentsProps` only accepts `rowActionsIconItem` and `rowActionsListItem`, pass the slot props of the menu with `slotProps`

```diff
 <MainNavigation
     slotProps={{
         permanentDrawer: {
-            PaperProps: { elevation: 0 },
+            slotProps: { paper: { elevation: 0 } },
         },
     }}
 />
```

The date and time pickers now also apply `slotProps.root.slotProps.textField` when it is a function.
