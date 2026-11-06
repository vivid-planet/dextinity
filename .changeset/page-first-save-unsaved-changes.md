---
"@dextinity/cms-admin": patch
---

Show a newly created document as saved after its first save

The editors built with `createUsePage` still reported unsaved changes after the first save of a document that didn't exist yet, e.g. a new link, because its default values contain keys set to `undefined` that the saved document doesn't have.
