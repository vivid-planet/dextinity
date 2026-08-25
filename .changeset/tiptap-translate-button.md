---
"@dextinity/cms-admin": minor
---

Add an in-toolbar translate button to the TipTap rich text block

The Draft.js-based rich text block already has a toolbar button to translate a single field, with an optional dialog to review the translation before applying it. The TipTap rich text block had no equivalent, leaving document-wide translation as the only option for TipTap fields.

The button now appears in the TipTap toolbar whenever a `ContentTranslationServiceProvider` is enabled, and can be hidden per block with the new `disableContentTranslation` option:

```tsx
createTipTapRichTextBlock({ disableContentTranslation: true });
```
