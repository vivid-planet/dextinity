---
"@dextinity/site-react": patch
---

Respect the `autoplay` setting of `YouTubeVideoBlock` when no preview image is set

Previously the video only started playing after the preview image was clicked, so blocks without a preview image (e.g. in a kiosk) never autoplayed.

The embedded player is now also loaded lazily, so a video further down the page doesn't start playing before it is anywhere near the viewport.
