---
"@dextinity/cms-admin": patch
---

Fix the DAM video block losing its playback settings when no video file is selected

`output2State` dropped `autoplay`, `loop` and `showControls` when the block had no `damFileId`, so the stored playback settings were reset as soon as the video file was removed.
