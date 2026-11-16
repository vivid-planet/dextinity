---
"@dextinity/cms-admin": patch
---

Show an error in `FinalFormFileUpload` when the upload request fails

Previously, a network error (e.g., a dropped connection) or a non-JSON response left the file in the loading state forever. The file is now shown as a failed upload instead.
