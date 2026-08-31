---
"@dextinity/admin": patch
---

Fix `FormMutation` throwing when rendered

`FormMutation` accessed its children through `this.props` although it is a function component. Modules are always in strict mode, so `this` was `undefined` and rendering the component failed with `TypeError: Cannot read properties of undefined (reading 'props')`.
