---
"@dextinity/cms-api": patch
---

Await flush when deleting a user permission

Previously, `userPermissionsDeletePermission` returned before the permission was deleted from the database, and errors during deletion were unhandled.
