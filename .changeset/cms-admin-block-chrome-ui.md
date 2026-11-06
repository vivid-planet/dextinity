---
"@dextinity/cms-admin": major
---

Build the shared block admin chrome with `@dextinity/ui`

`BlockAdminComponentRoot`, `BlockAdminComponentPaper`, `BlockAdminComponentSection`, `BlockAdminComponentSectionGroup`, `BlockAdminComponentButton`, `BlockAdminComponentNestedButton`, `BlockAdminTabs` and `BlockAdminTabLabel` keep their names and props, but render the components and tokens of the design system instead of MUI:

- `BlockAdminComponentRoot` shows the `Breadcrumbs` of `@dextinity/ui` instead of `StackBreadcrumbs`, and only once a block is nested. The back button is gone; every level is a link. Theme overrides of `DextinityAdminStackBreadcrumbs` no longer apply to it.
- Sticky headers and toolbars inside the block admin stop below the breadcrumbs through the CSS variable `--dextinity-admin-sticky-top` instead of a fixed `70px` offset. Use it for your own sticky elements: `top: var(--dextinity-admin-sticky-top, 0px)`.
- `BlockAdminTabs` uses the `Tabs` of `@dextinity/ui`, still with one route per tab. MUI `Tabs`/`Tab` theme overrides no longer apply.
- `BlockAdminComponentButton` renders a `Button` of `@dextinity/ui`. Pass an `Icon` of `@dextinity/ui` as `startIcon`, e.g. `<Icon name="add" />`.
- The MUI class names and theme overrides of the replaced MUI components (e.g. `MuiPaper`, `MuiTabs`) no longer apply to these components.
