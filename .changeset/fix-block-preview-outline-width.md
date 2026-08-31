---
"@dextinity/site-react": patch
---

Fix block preview outlines ending short of the block's right edge

`IFrameBridgeProvider` clipped every outline to the width of its children wrapper, comparing the block's document-relative left edge against that width. The comparison holds only while the wrapper starts at x = 0, so padding or another offset on an ancestor of the provider cut those pixels off the right edge of every outline of a block that fills the wrapper. The clip now uses the wrapper's right edge in document coordinates.
