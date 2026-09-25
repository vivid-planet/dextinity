---
"@dextinity/cms-api": patch
---

Wait for the permission to be deleted in the `userPermissionsDeletePermission` mutation

Previously, the mutation returned `true` before the deletion was flushed, so errors during deletion weren't reported to the client.
