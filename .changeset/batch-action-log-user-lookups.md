---
"@comet/cms-api": patch
---

Batch user lookups in `ActionLog.user` resolver via DataLoader

When loading a list of action log entries, the `user` resolve-field previously
issued one `findUser` call per row sequentially. The lookups are now batched
through a request-scoped DataLoader and run concurrently.
