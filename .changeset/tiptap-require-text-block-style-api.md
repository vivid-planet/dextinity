---
"@dextinity/cms-api": minor
---

Add `requireTextBlockStyle` option to `createTipTapRichTextBlock`

Mirrors the admin-side `requireTextBlockStyle` option: when `textBlockStyles` are configured, rejects stored content where a heading or paragraph has at least one applicable style but none set, consistent with how `maxTextBlocks` and `listLevelMax` are already enforced server-side rather than trusting client-only validation.
