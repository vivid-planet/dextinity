---
"@dextinity/site-react": patch
---

Fix the block preview box of a block with a hidden element

An element with `display: none`, for instance a desktop-only image on mobile, stretched the box to the top left corner of the window.
