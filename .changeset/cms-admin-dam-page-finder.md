---
"@dextinity/cms-admin": major
---

Show the finder in `DamPage` and remove the old asset manager

`DamPage` now renders `DamFinderPage` built on `@dextinity/ui` and keeps hosting a file's settings at `<route>/<fileId>/edit` and the DAM settings at `<route>/settings/settings`. One "Assets" menu entry is enough: replace a separate route to `DamFinderPage` with `DamPage`.

The finder took over what only the old asset manager had: a search across all folders, a filter to show archived files and, with `enableLicenseFeature`, to show files by license state, and actions for the selection to move files and folders into a folder chosen from the tree, download files or a folder as a ZIP, archive, restore, and delete them. Folders can be uploaded with "Upload folder". `DamFinderPage` gets the props `additionalToolbarItems` (defaults to `additionalToolbarItems` of the DAM config) and `settingsUrl`. Items in `additionalToolbarItems` render in the page header and can upload into the open folder with `useCurrentDamFolder` and `useDamFileUpload`; the finder shows and selects what they uploaded. Archived files and files with an invalid license are labelled in the item details.

**Breaking changes**

- The MUI data grid of the asset manager is gone, and with it its columns (source, usages, creation date), the row context menu, the custom DAM item labels, and the old move dialog.
- `renderContentScopeIndicator` of `DamPage` is deprecated and unused; the content scope is shown in the top bar.
- Items in `additionalToolbarItems` render next to `@dextinity/ui` buttons in the page header instead of in the MUI grid toolbar. Build them with `@dextinity/ui`.
- The DAM settings are linked from the finder's header only with `enableLicenseFeature` and `blockFilesWithInvalidLicense`, as before from the "More" menu.
