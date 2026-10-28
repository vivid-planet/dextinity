---
"@dextinity/cms-api": patch
---

Keep inline styles and links in place after emojis when migrating Draft.js content to TipTap

Draft.js stores the offsets of inline styles and entities in code points, but `migrateFromDraftJs` used them as string indices, which count UTF-16 code units.
Every emoji or other character outside the Basic Multilingual Plane shifted the ranges after it by one character, and a range ending inside such a character split it into two broken characters.
