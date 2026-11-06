---
"@dextinity/cms-admin": minor
---

Add `AppFrame`, the admin's frame built on `@dextinity/ui`

It renders the navigation from the same `MasterMenuData` that `MasterMenu` and `MasterMenuRoutes` take, a top bar with the content scope switcher and the user menu, and a command palette (⌘K / Ctrl+K) that searches the content with the full-text search and jumps to menu entries. Color scheme and density are controlled props, so the application decides where to persist them.

```tsx
<AppFrame
    menu={masterMenuData}
    title="Demo"
    logo={<DextinityLogo />}
    colorScheme={colorScheme}
    onColorSchemeChange={setColorScheme}
    density={density}
    onDensityChange={setDensity}
>
    <MasterMenuRoutes menu={masterMenuData} />
</AppFrame>
```
