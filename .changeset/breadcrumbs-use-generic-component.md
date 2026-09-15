---
"@dextinity/admin": major
---

Build `StackBreadcrumbs` and `ToolbarBreadcrumbs` on top of the generic `Breadcrumbs` component

Both components maintained their own breadcrumb rendering, overflow handling and mobile menu, which meant three implementations of the same UI that had already drifted apart visually.
They are now thin wrappers around the `Breadcrumbs` component, which is exported from `@dextinity/admin` as well.

`Breadcrumbs` has a new `startAdornment` prop for content that belongs in front of the items.
`StackBreadcrumbs` uses it for its back button and `Toolbar` passes its `scopeIndicator` through it, so the scope indicator is now part of the breadcrumbs instead of a sibling in the top bar.

**Example**

```tsx
<Breadcrumbs items={[{ url: "/products", title: "Products" }]} startAdornment={<ContentScopeIndicator />} />
```

**Breaking changes**

`StackBreadcrumbs` and `ToolbarBreadcrumbs` no longer render their own markup, so their slots and class keys are gone.
Use the slots of `Breadcrumbs` (through `slotProps.root` or the `DextinityAdminBreadcrumbs` theme key) to customize the items, the separator, the overflow menu and the mobile menu.

- `StackBreadcrumbsClassKey` is reduced to `"root" | "backButton" | "backButtonSeparator"`.
- `ToolbarBreadcrumbsClassKey` is reduced to `"root"`.
- The `separator` prop of `StackBreadcrumbs` is replaced by `iconMapping.separator`, matching `Breadcrumbs`. The back button icon can be replaced through `iconMapping.backButton`.
- The `overflowLinkText` prop of `StackBreadcrumbs` is removed. The overflow button is labeled by the `ellipsis` slot of `Breadcrumbs`.
- The `iconMapping` keys of `ToolbarBreadcrumbs` are renamed from `itemSeparator`, `openMobileMenu` and `closeMobileMenu` to `separator`, `openMenu` and `closeMenu`.
