---
"@dextinity/cms-admin": major
---

Build the block preview and the site preview with `@dextinity/ui`

Add `BlockPreviewPane`, the block preview for editors built with `@dextinity/ui`. It shows the `DevicePreview` of the design system with the device switch, a toggle for invisible blocks and, with `onOpenSitePreview`, an action that opens the site preview. Render it inside the `IFrameBridgeProvider` that also wraps the block admin:

```tsx
<IFrameBridgeProvider key={previewUrl}>
    <BlockPreviewPane
        url={previewUrl}
        siteUrl={`${siteConfig.url}${pageState.path}`}
        previewState={previewState}
        previewApi={previewApi}
        onOpenSitePreview={() => openSitePreviewWindow(pageState.path, contentScopeMatch.url)}
    />
    {/* block admin */}
</IFrameBridgeProvider>
```

`BlockPreview`, `SplitPreview` and `BlockPreviewWithTabs` stay for editors built with MUI and render the new preview as well. Pass them the public address of the edited page as `siteUrl` to show it above the preview instead of the address of the block preview page.

**Breaking changes**

- `device` of `BlockPreviewApi` (returned by `useBlockPreview`) is now a `DevicePreviewDevice` of `@dextinity/ui` (`"responsive"`, `"desktop"`, `"tablet"` or `"mobile"`) instead of a number. A device stored by earlier versions is read and replaced on the next change.
- The `device` URL parameter of the site preview takes the same names. Old links with a number still open with the right device.
- `SitePreview` is wrapped in the `Theme` of `@dextinity/ui`, since it is opened outside of the `AppFrame`. Pass the color scheme the user chose in the admin through the new `colorScheme` prop (and `brand`/`density` if you change them). The external link dialog is a `ConfirmDialog` of the design system.
- The highlight of `HoverPreviewComponent` uses the accent color of the design system. Its markup no longer contains MUI components.
