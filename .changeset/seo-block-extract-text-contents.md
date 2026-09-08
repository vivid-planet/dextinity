---
"@dextinity/cms-admin": patch
---

Implement `extractTextContents` in the SEO block

The SEO block only extracted the text contents of the Open Graph image, so its own texts (HTML title, meta description, Open Graph title and description) were missing wherever block text contents are used, e.g., for SEO text generation.
