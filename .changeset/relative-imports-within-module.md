---
"@dextinity/agent-features": patch
---

Allow relative imports from parent folders within the same module in the TypeScript rule

The rule now matches the ESLint rule `@dextinity/no-other-module-relative-import`, which reports only relative imports from another module.
Agents and review bots no longer flag relative imports such as `../entities/product.entity` within a module.
