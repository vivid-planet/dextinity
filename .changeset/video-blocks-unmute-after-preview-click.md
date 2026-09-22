---
"@dextinity/site-react": patch
---

Play the video unmuted in `YouTubeVideoBlock`, `VimeoVideoBlock` and `DamVideoBlock` when it is started by clicking the preview image

Autoplaying videos still start muted, since browsers block unmuted autoplay without a user interaction. The click on the preview image is such an interaction, so muting is no longer necessary from that point on.
