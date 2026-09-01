---
"@dextinity/site-react": patch
---

Fix block preview outlines having the wrong width

`IFrameBridgeProvider` clipped every outline to the width of its children wrapper, comparing the block's document-relative left edge against that width. The comparison holds only while the wrapper starts at `x = 0`, so padding or another offset on an ancestor of the provider cut those pixels off the right edge of every outline of a block that fills the wrapper. The clip now uses the wrapper's right edge in document coordinates.

The wrapper was measured during render, while the resize and mutation observers recompute the outlines without a render in between. A recompute after a resize therefore clipped to the previous layout, and when its result matched the outlines already on screen, the `isEqual` check blocked the re-render that would have refreshed the measurement, so the outlines kept the wrong width. The wrapper is now measured in the recompute itself.
