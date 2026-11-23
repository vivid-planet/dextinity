---
"@dextinity/admin": minor
---

Add a side panel to `MasterLayout`

The `sidePanelComponent` is rendered next to the content, e.g. a help or a comments panel. The content narrows by the width of the side panel, so a side panel that animates its width resizes the content along with it. A side panel that overlays the content, e.g. with `position: fixed`, takes no width and leaves the content as it is.

The side panel's width is available as the `--dextinity-admin-master-layout-side-panel-width` CSS variable in the content wrapper, and its wrapper can be styled with the `sidePanel` slot.

**Example**

```tsx
<MasterLayout headerComponent={MasterHeader} menuComponent={MasterMenu} sidePanelComponent={HelpPanel}>
    <MasterMenuRoutes />
</MasterLayout>
```
