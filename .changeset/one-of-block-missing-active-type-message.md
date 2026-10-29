---
"@dextinity/cms-admin": patch
---

Clarify the error thrown by `createOneOfBlock` when `activeType` has no entry in `attachedBlocks`

The message now names the active type and the types that `attachedBlocks` holds.
A missing `x-include-invisible-content` HTTP header is mentioned only as one possible cause, since the state can also come from malformed input to `output2State`.
