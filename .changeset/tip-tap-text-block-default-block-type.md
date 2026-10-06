---
"@dextinity/cms-admin": patch
"@dextinity/cms-api": patch
---

Fix saving a TipTap rich text that ends with a list

Since v10.8.0, the editor added an empty list after a list at the end of the content. The API rejects a list without items, so saving failed with "Validation failed". Removing the list didn't fix it: the empty list stayed at the end of the content, where editors couldn't see or remove it.

ProseMirror fills content with the schema's first block node, for instance after a list at the end of the content or when all content is deleted. When the `textBlock` node replaced the paragraph and heading nodes, it lost the paragraph's priority, so a list became the first block node. The `textBlock` node gets the paragraph's priority again, so the editor adds an empty text block after a list, as it did before v10.8.0.
