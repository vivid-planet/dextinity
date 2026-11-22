---
"@dextinity/agent-features": patch
---

Remove outdated and redundant content from the coding guideline rules

Agents no longer name normal branches `feature/…`, because the `naming` rule now says the prefix is reserved for protected feature branches.
The `postgresql` rule is merged into the `api-nestjs` rule.
The `git`, `security`, `libraries`, `react` and `styling` rules no longer contain review and merge process, general principles that agents follow anyway, or rules ESLint already enforces.
