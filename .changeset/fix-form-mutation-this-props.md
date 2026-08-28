---
"@dextinity/admin": patch
---

Fix `FormMutation` throwing when rendered

`FormMutation` read its children from `this.props` although it is a function component, so `this` was `undefined` and rendering it failed with `TypeError: Cannot read properties of undefined (reading 'props')`.
