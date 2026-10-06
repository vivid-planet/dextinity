---
"@dextinity/agent-features": patch
---

Teach the `dextinity-block` skill to write and maintain block descriptions

The skill creates new blocks with the options form of `createBlock`, which accepts a `description`. It adds the description where a block's name and fields don't say what the block is for, and updates it when the block's purpose changes.
