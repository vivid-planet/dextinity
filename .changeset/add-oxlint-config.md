---
"@dextinity/oxlint-config": minor
---

Add `@dextinity/oxlint-config`

An opt-in alternative to `@dextinity/eslint-config` for projects that want to lint with [oxlint](https://oxc.rs/docs/guide/usage/linter) instead of ESLint.
It ships the `core`, `react`, `nestjs` and `nextjs` presets with the same rules as the ESLint presets.
Rules oxlint doesn't implement natively (e.g., `@dextinity/eslint-plugin`, `simple-import-sort`, `formatjs`) run as oxlint JS plugins.
Type-aware rules require `oxlint-tsgolint`.
`@dextinity/eslint-config` stays fully supported.

**Example**

```ts
// oxlint.config.ts
import reactConfig from "@dextinity/oxlint-config/react.js";
import { defineConfig } from "oxlint";

export default defineConfig({
    extends: [reactConfig],
    plugins: reactConfig.plugins,
    ignorePatterns: ["lib/**"],
});
```

Formatting isn't part of oxlint. Run Prettier separately, e.g., `prettier --check "src/**/*.{ts,tsx}"`.
