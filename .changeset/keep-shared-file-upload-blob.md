---
"@dextinity/cms-api": patch
---

Keep the stored file when deleting a file upload whose content is used by another file upload

Previously, `FileUploadsService.delete()` removed the file from the blob storage even if another file upload with the same content hash still referenced it, which made that file upload's download fail.
