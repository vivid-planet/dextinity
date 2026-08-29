---
"@dextinity/cms-admin": patch
---

Show the folder path of search results in the "Select file from DAM" dialog

When searching in the DAM, results show the path of the folder the item lives in. The file selection dialogs (`ChooseDamFileDialog`, `ChooseDamFilesDialog`) didn't, making it impossible to tell apart files with the same name in different folders.

`RenderDamLabelOptions` now contains `isSearching`, so custom `renderDamLabel` implementations can pass it to `DamItemLabel`'s `showPath` prop:

```tsx
<DamTable renderDamLabel={(row, { matches, isSearching }) => <DamItemLabel asset={row} matches={matches} showPath={isSearching} />} />
```
