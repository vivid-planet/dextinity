---
"@dextinity/eslint-config": minor
---

Add a `json` preset that only lints JSON files

oxlint can't lint JSON files. Projects using `@dextinity/oxlint-config` can keep linting JSON files with ESLint using this preset:

```js
// eslint.config.mjs
import eslintConfigJson from "@dextinity/eslint-config/json.js";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([globalIgnores(["dist/**"]), ...eslintConfigJson]);
```

Run ESLint for JSON files only, e.g. `eslint --max-warnings 0 '**/*.json'`.
