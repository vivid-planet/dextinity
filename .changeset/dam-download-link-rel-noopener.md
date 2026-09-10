---
"@dextinity/site-react": patch
---

Add `rel="noopener"` to `DamFileDownloadLinkBlock` links that open in a new tab

Links with `target="_blank"` gave the opened page access to `window.opener`, allowing it to redirect the original tab (reverse tabnabbing). `rel="noopener"` is now set whenever the link opens in a new tab, whether via `openFileType: "NewTab"` or an explicitly passed `target="_blank"`.
