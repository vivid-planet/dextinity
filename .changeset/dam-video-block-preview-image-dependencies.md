---
"@dextinity/cms-admin": patch
---

Track the preview image of the video blocks as a block dependency

`createDamVideoBlock`, `YouTubeVideoBlock` and `VimeoVideoBlock` didn't report the DAM file used as preview image as a dependency, so it showed no usages and its ID wasn't remapped when copying pages between scopes, leaving a dangling reference.
The blocks now delegate to `PixelImageBlock` for the preview image. `createDamVideoBlock` merges the result with the dependency of its own video file.
