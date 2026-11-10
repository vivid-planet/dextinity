---
"@dextinity/cms-api": patch
---

Reject one-of block input whose `activeType` has no matching entry in `attachedBlocks`

Previously, input such as `{ "attachedBlocks": [], "activeType": "external" }` was saved. The site then rendered nothing, and the admin failed when opening the block.
Blocks created with `allowEmpty: false` now also reject a missing `activeType`.
