---
"@dextinity/agent-features": patch
---

Limit the TypeScript rule about `@src/…` imports to projects that define the alias

Library packages compiled with plain `tsc` can't use path aliases, because `tsc` doesn't rewrite them in its output.
Agents and review bots no longer flag their relative imports of ancestor files.
