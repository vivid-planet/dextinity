---
"@dextinity/eslint-plugin": minor
---

Add `no-next-public-env` rule

The rule reports reading `process.env.NEXT_PUBLIC_*` variables. Next.js inlines them at build time, so they can't differ between environments. Use site configs or a custom provider instead.

The rule works with ESLint and as an oxlint JS plugin. The `nextjs` preset of `@dextinity/oxlint-config` enables it.
