---
"@dextinity/eslint-config": patch
---

Update `globals` to v17

The browser configs know about newer browser APIs.
Audio worklet globals, such as `registerProcessor` and `sampleRate`, are no longer defined in the browser configs.
