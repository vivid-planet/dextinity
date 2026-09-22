---
"@dextinity/api-generator": major
---

Require TypeScript 6

`typescript` is a direct dependency of the generator, so projects using `dextinity-api-generator` now get TypeScript 6 in their dependency tree and should upgrade their own `typescript` to `^6.0.3`.

TypeScript 6 turns two deprecated options into errors, both of which affect the API `tsconfig.json` the generator reads:

- `baseUrl` is deprecated. Replace it with relative `paths` entries, which resolve relative to the `tsconfig.json` instead:

    ```json
    // Before
    {
        "compilerOptions": {
            "baseUrl": "./",
            "paths": { "@src/*": ["src/*"] }
        }
    }

    // After
    {
        "compilerOptions": {
            "paths": { "@src/*": ["./src/*"] }
        }
    }
    ```

    `tsconfig-paths` needs to be on `^4.2.0` for this, because version 3 skips path mapping entirely when no `baseUrl` is set.

- `rootDir` must be set explicitly whenever `outDir` is set:

    ```json
    {
        "compilerOptions": {
            "outDir": "./dist",
            "rootDir": "./src"
        }
    }
    ```
