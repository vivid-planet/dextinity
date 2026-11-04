---
"@dextinity/site-nextjs": minor
---

Delete the build assets of older uploads in `dextinity-upload-build-assets`

The storage keeps the build assets of the last 10 uploads, configurable with `--keep-builds` (or `keepBuilds` of `uploadBuildAssets`).
Each upload stores a manifest of its build assets under `<storage-key-prefix>/build-assets-manifests/`, and the build assets that are only listed in older manifests are deleted.
Build assets uploaded without a manifest are kept until the storage holds more uploads than are kept.
A failed cleanup is logged and doesn't fail the upload.

The storage needs to allow listing and deleting files.
