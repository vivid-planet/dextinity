---
"@dextinity/mail-react": patch
---

Fix head CSS lost after the first `@media` block in Outlook.com and the Outlook apps for iOS and Android

These clients stop reading a `<style>` tag at the first `}}`, which minified CSS writes at the end of every `@media` block.
