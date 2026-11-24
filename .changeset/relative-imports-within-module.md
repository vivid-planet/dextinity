---
"@dextinity/agent-features": patch
---

Remove the rule about relative imports from the TypeScript rule

The ESLint rule `@dextinity/no-other-module-relative-import` checks import paths.
The removed rule asked for `@src/…` imports that the ESLint rule doesn't require, so agents and review bots reported relative imports such as `../entities/product.entity` within a module.
