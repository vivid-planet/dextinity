---
"@dextinity/site-nextjs": minor
---

Delete the build assets of older uploads in `dextinity-upload-build-assets`

The storage keeps the build assets of the last 10 uploads, configurable with `--keep-builds` (or `keepBuilds` of `uploadBuildAssets`).
Each upload stores a manifest of its build assets under `<storage-key-prefix>/build-assets-manifests/`.
Build assets listed only in the manifests of older uploads are deleted.
Build assets no manifest lists are never deleted, so an upload running in parallel keeps its files.
A failed cleanup is logged and doesn't fail the upload.

The storage needs to allow listing and deleting files.

Build assets uploaded before this version aren't listed in a manifest and therefore aren't deleted.
Delete them manually from `<storage-key-prefix>/_next/static/` once all running instances serve builds uploaded with this version.
