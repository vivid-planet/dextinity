# @comet/eslint-config

## 8.31.0

### Patch Changes

- @comet/eslint-plugin@8.31.0

## 8.30.1

### Patch Changes

- @comet/eslint-plugin@8.30.1

## 8.30.0

### Patch Changes

- @comet/eslint-plugin@8.30.0

## 8.29.0

### Patch Changes

- @comet/eslint-plugin@8.29.0

## 8.28.2

### Patch Changes

- @comet/eslint-plugin@8.28.2

## 8.28.1

### Patch Changes

- @comet/eslint-plugin@8.28.1

## 8.28.0

### Patch Changes

- @comet/eslint-plugin@8.28.0

## 8.27.1

### Patch Changes

- @comet/eslint-plugin@8.27.1

## 8.27.0

### Patch Changes

- @comet/eslint-plugin@8.27.0

## 8.26.0

### Patch Changes

- @comet/eslint-plugin@8.26.0

## 8.25.1

### Patch Changes

- @comet/eslint-plugin@8.25.1

## 8.25.0

### Patch Changes

- @comet/eslint-plugin@8.25.0

## 8.24.5

### Patch Changes

- @comet/eslint-plugin@8.24.5

## 8.24.4

### Patch Changes

- @comet/eslint-plugin@8.24.4

## 8.24.3

### Patch Changes

- @comet/eslint-plugin@8.24.3

## 8.24.2

### Patch Changes

- @comet/eslint-plugin@8.24.2

## 8.24.1

### Patch Changes

- @comet/eslint-plugin@8.24.1

## 8.24.0

### Patch Changes

- @comet/eslint-plugin@8.24.0

## 8.23.4

### Patch Changes

- @comet/eslint-plugin@8.23.4

## 8.23.3

### Patch Changes

- @comet/eslint-plugin@8.23.3

## 8.23.2

### Patch Changes

- @comet/eslint-plugin@8.23.2

## 8.23.1

### Patch Changes

- @comet/eslint-plugin@8.23.1

## 8.23.0

### Patch Changes

- @comet/eslint-plugin@8.23.0

## 8.22.0

### Patch Changes

- @comet/eslint-plugin@8.22.0

## 8.21.1

### Patch Changes

- @comet/eslint-plugin@8.21.1

## 8.21.0

### Patch Changes

- @comet/eslint-plugin@8.21.0

## 8.20.4

### Patch Changes

- @comet/eslint-plugin@8.20.4

## 8.20.3

### Patch Changes

- @comet/eslint-plugin@8.20.3

## 8.20.2

### Patch Changes

- bd884f5: Fix missing Rules of React in `@comet/eslint-config/nextjs.js`
    - @comet/eslint-plugin@8.20.2

## 8.20.1

### Patch Changes

- @comet/eslint-plugin@8.20.1

## 8.20.0

### Patch Changes

- @comet/eslint-plugin@8.20.0

## 8.19.0

### Patch Changes

- @comet/eslint-plugin@8.19.0

## 8.18.0

### Patch Changes

- @comet/eslint-plugin@8.18.0

## 8.17.1

### Patch Changes

- @comet/eslint-plugin@8.17.1

## 8.17.0

### Patch Changes

- @comet/eslint-plugin@8.17.0

## 8.16.0

### Patch Changes

- @comet/eslint-plugin@8.16.0

## 8.15.0

### Patch Changes

- @comet/eslint-plugin@8.15.0

## 8.14.0

### Minor Changes

- af265a8: Clarify `next/image` import restriction in `@comet/eslint-config/nextjs.js`

### Patch Changes

- 3d0af69: Fix extending Next.js' ESLint config in `@comet/eslint-config/nextjs.js`
    - @comet/eslint-plugin@8.14.0

## 8.13.0

### Patch Changes

- @comet/eslint-plugin@8.13.0

## 8.12.0

### Patch Changes

- @comet/eslint-plugin@8.12.0

## 8.11.1

### Patch Changes

- @comet/eslint-plugin@8.11.1

## 8.11.0

### Minor Changes

- 4b448f6: Format.JS: enforce literal default messages

    Prevent function calls or variables in `defaultMessage` which are not supported in our internationalization workflow.

- e5427a0: Future: Ban `node-cache` because it's unmaintained

    Introduce a new rule in `future/nestjs` and `future/nextjs` that bans importing `node-cache` and recommends `cache-manager` / `@cacheable/node-cache` / `@nestjs/cache-manager` instead.

    This rule is now in the future configs and will be enforced generally in v9.

- 9d5e331: Enable `@typescript-eslint/consistent-type-exports` in `@comet/eslint-config/future/react.js`

### Patch Changes

- @comet/eslint-plugin@8.11.0

## 8.10.0

### Patch Changes

- @comet/eslint-plugin@8.10.0

## 8.9.0

### Patch Changes

- @comet/eslint-plugin@8.9.0

## 8.8.0

### Minor Changes

- f8bf3f5: Detect React version in `@comet/eslint-config/react.js` and `@comet/eslint-config/nextjs.js`

    Removes the `React version not specified in eslint-plugin-react settings. See https://github.com/jsx-eslint/eslint-plugin-react#configuration.` warning.

### Patch Changes

- @comet/eslint-plugin@8.8.0

## 8.7.1

### Patch Changes

- @comet/eslint-plugin@8.7.1

## 8.7.0

### Patch Changes

- @comet/eslint-plugin@8.7.0

## 8.6.0

### Patch Changes

- @comet/eslint-plugin@8.6.0

## 8.5.2

### Patch Changes

- @comet/eslint-plugin@8.5.2

## 8.5.1

### Patch Changes

- dcb9712: Disable `@next/next/no-img-element` rule
    - @comet/eslint-plugin@8.5.1

## 8.5.0

### Patch Changes

- @comet/eslint-plugin@8.5.0

## 8.4.2

### Patch Changes

- @comet/eslint-plugin@8.4.2

## 8.4.1

### Patch Changes

- @comet/eslint-plugin@8.4.1

## 8.4.0

### Patch Changes

- 576731f: Allow `%` as a string literal in `future/react.js`
    - @comet/eslint-plugin@8.4.0

## 8.3.0

### Minor Changes

- dd4e4a8: Introduce a new future/react.js configuration and enable the ESLint rule react/jsx-no-literals.

### Patch Changes

- @comet/eslint-plugin@8.3.0

## 8.2.0

### Patch Changes

- 594331e: Fix import restriction of `@mui/material` components: `Alert`, `Button`, `Dialog`, `Tooltip`

    The restriction was not working for deep imports like `import Button from "@mui/material/Button"`.
    - @comet/eslint-plugin@8.2.0

## 8.1.1

### Patch Changes

- @comet/eslint-plugin@8.1.1

## 8.1.0

### Patch Changes

- @comet/eslint-plugin@8.1.0

## 8.0.0

### Major Changes

- 6d3c196: Add import restriction for MUI's `Button`

    Buttons used in Comet DXP applications should match the Comet CI.
    Use `Button` from `@comet/admin` instead.

- ceaf99d: Bump ESLint peer dependency to v9
- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

- 4d0d820: Prevent `@mui/material` tooltip imports

    Tooltips used in Comet DXP applications should match the Comet CI.
    Use tooltips from `@comet/admin` instead.

- c6d87a2: Bump Prettier peer dependency to v3
- 9509f97: Enable rule to restrict barrel React imports

    Importing `React` is no longer necessary due to the new JSX transform, which automatically imports the necessary `react/jsx-runtime` functions.
    Use individual named imports instead, e.g, `import { useState } from "react"`.

### Minor Changes

- a8edddb: Enable `@typescript-eslint/consistent-type-imports` rule

### Patch Changes

- 6ec43c9: Use recommended config from eslint-plugin-package-json correctly
- 649297e: Readd `@comet/eslint-plugin` dependency that was mistakenly removed
- Updated dependencies [f904b71]
    - @comet/eslint-plugin@8.0.0

## 8.0.0-beta.6

### Patch Changes

- @comet/eslint-plugin@8.0.0-beta.6

## 8.0.0-beta.5

### Major Changes

- 6d3c196: Add import restriction for MUI's `Button`

    Buttons used in Comet DXP applications should match the Comet CI.
    Use `Button` from `@comet/admin` instead.

### Patch Changes

- @comet/eslint-plugin@8.0.0-beta.5

## 8.0.0-beta.4

### Patch Changes

- 6ec43c9: Use recommended config from eslint-plugin-package-json correctly
    - @comet/eslint-plugin@8.0.0-beta.4

## 8.0.0-beta.3

### Patch Changes

- @comet/eslint-plugin@8.0.0-beta.3

## 8.0.0-beta.2

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

### Patch Changes

- Updated dependencies [f904b71]
    - @comet/eslint-plugin@8.0.0-beta.2

## 8.0.0-beta.1

### Patch Changes

- 649297e: Readd `@comet/eslint-plugin` dependency that was mistakenly removed
    - @comet/eslint-plugin@8.0.0-beta.1

## 8.0.0-beta.0

### Major Changes

- ceaf99d: Bump ESLint peer dependency to v9
- 4d0d820: Prevent `@mui/material` tooltip imports

    Tooltips used in Comet DXP applications should match the Comet CI.
    Use tooltips from `@comet/admin` instead.

- c6d87a2: Bump Prettier peer dependency to v3
- 9509f97: Enable rule to restrict barrel React imports

    Importing `React` is no longer necessary due to the new JSX transform, which automatically imports the necessary `react/jsx-runtime` functions.
    Use individual named imports instead, e.g, `import { useState } from "react"`.

### Minor Changes

- a8edddb: Enable `@typescript-eslint/consistent-type-imports` rule

## 7.25.3

### Patch Changes

- @comet/eslint-plugin@7.25.3

## 7.25.2

### Patch Changes

- @comet/eslint-plugin@7.25.2

## 7.25.1

### Patch Changes

- Updated dependencies [85e80218f]
    - @comet/eslint-plugin@7.25.1

## 7.25.0

### Patch Changes

- @comet/eslint-plugin@7.25.0

## 7.24.0

### Patch Changes

- @comet/eslint-plugin@7.24.0

## 7.23.0

### Patch Changes

- @comet/eslint-plugin@7.23.0

## 7.22.0

### Patch Changes

- @comet/eslint-plugin@7.22.0

## 7.21.1

### Patch Changes

- @comet/eslint-plugin@7.21.1

## 7.21.0

### Patch Changes

- @comet/eslint-plugin@7.21.0

## 7.20.0

### Patch Changes

- @comet/eslint-plugin@7.20.0

## 7.19.0

### Patch Changes

- @comet/eslint-plugin@7.19.0

## 7.18.0

### Patch Changes

- @comet/eslint-plugin@7.18.0

## 7.17.0

### Patch Changes

- @comet/eslint-plugin@7.17.0

## 7.16.0

### Patch Changes

- @comet/eslint-plugin@7.16.0

## 7.15.0

### Patch Changes

- @comet/eslint-plugin@7.15.0

## 7.14.0

### Patch Changes

- @comet/eslint-plugin@7.14.0

## 7.13.0

### Patch Changes

- @comet/eslint-plugin@7.13.0

## 7.12.0

### Patch Changes

- @comet/eslint-plugin@7.12.0

## 7.11.0

### Patch Changes

- @comet/eslint-plugin@7.11.0

## 7.10.0

### Patch Changes

- @comet/eslint-plugin@7.10.0

## 7.9.0

### Patch Changes

- @comet/eslint-plugin@7.9.0

## 7.8.0

### Patch Changes

- @comet/eslint-plugin@7.8.0

## 7.7.0

### Patch Changes

- @comet/eslint-plugin@7.7.0

## 7.6.0

### Patch Changes

- @comet/eslint-plugin@7.6.0

## 7.5.0

### Patch Changes

- @comet/eslint-plugin@7.5.0

## 7.4.2

### Patch Changes

- @comet/eslint-plugin@7.4.2

## 7.4.1

### Patch Changes

- @comet/eslint-plugin@7.4.1

## 7.4.0

### Patch Changes

- @comet/eslint-plugin@7.4.0

## 7.3.2

### Patch Changes

- @comet/eslint-plugin@7.3.2

## 7.3.1

### Patch Changes

- @comet/eslint-plugin@7.3.1

## 7.3.0

### Patch Changes

- @comet/eslint-plugin@7.3.0

## 7.2.1

### Patch Changes

- @comet/eslint-plugin@7.2.1

## 7.2.0

### Patch Changes

- @comet/eslint-plugin@7.2.0

## 7.1.0

### Patch Changes

- @comet/eslint-plugin@7.1.0

## 7.0.0

### Major Changes

- 45585f4cc: Add the rule `@typescript-eslint/prefer-enum-initializers` to require enum initializers

    ```ts
    // ✅
    enum ExampleEnum {
        One = "One",
        Two = "Two",
    }
    ```

    ```ts
    // ❌
    enum ExampleEnum {
        One,
        Two,
    }
    ```

- af37ac9d1: nextjs: Enable `react/jsx-curly-brace-presence` rule
- 7a473ab8d: Prevent `@mui/icons-material` icon imports

    Icons used in Comet DXP applications should match the Comet CI.
    Use icons from `@comet/admin-icons` instead.

- 2e20a8684: nextjs/react: Enable `react/jsx-no-useless-fragment` rule

### Minor Changes

- 769bd72f0: Use the Next.js Preview Mode for the site preview

    The preview is entered by navigating to an API Route in the site, which has to be executed in a secured environment.
    In the API Route the current scope is checked (and possibly stored), then the client is redirected to the preview.

### Patch Changes

- @comet/eslint-plugin@7.0.0

## 7.0.0-beta.6

### Major Changes

- 2e20a8684: nextjs/react: Enable `react/jsx-no-useless-fragment` rule

### Patch Changes

- @comet/eslint-plugin@7.0.0-beta.6

## 7.0.0-beta.5

### Patch Changes

- @comet/eslint-plugin@7.0.0-beta.5

## 7.0.0-beta.4

### Patch Changes

- @comet/eslint-plugin@7.0.0-beta.4

## 7.0.0-beta.3

### Major Changes

- 7a473ab8d: Prevent `@mui/icons-material` icon imports

    Icons used in Comet DXP applications should match the Comet CI.
    Use icons from `@comet/admin-icons` instead.

### Patch Changes

- @comet/eslint-plugin@7.0.0-beta.3

## 7.0.0-beta.2

### Patch Changes

- @comet/eslint-plugin@7.0.0-beta.2

## 7.0.0-beta.1

### Patch Changes

- @comet/eslint-plugin@7.0.0-beta.1

## 7.0.0-beta.0

### Major Changes

- 45585f4cc: Enforce PascalCase for enums

    Changing the casing of an existing enum can be problematic, e.g., if the enum values are persisted in the database.
    In such cases, the rule can be disabled like so

    ```diff
    + /* eslint-disable @typescript-eslint/naming-convention */
      export enum ExampleEnum {
          attr1 = "attr1",
      }
    + /* eslint-enable @typescript-eslint/naming-convention */
    ```

- 45585f4cc: Add the rule `@typescript-eslint/prefer-enum-initializers` to require enum initializers

    ```ts
    // ✅
    enum ExampleEnum {
        One = "One",
        Two = "Two",
    }
    ```

    ```ts
    // ❌
    enum ExampleEnum {
        One,
        Two,
    }
    ```

- af37ac9d1: nextjs: Enable `react/jsx-curly-brace-presence` rule

### Minor Changes

- 769bd72f0: Uses the Next.JS Preview mode for the site preview

    The preview is entered by navigating to an API-Route in the site, which has to be executed in a secured environment.
    In the API-Routes the current scope is checked (and possibly stored), then the client is redirected to the Preview.

    // TODO Move the following introduction to the migration guide before releasing

    Requires following changes to site:
    - Import `useRouter` from `next/router` (not exported from `@comet/cms-site` anymore)
    - Import `Link` from `next/link` (not exported from `@comet/cms-site` anymore)
    - Remove preview pages (pages in `src/pages/preview/` directory which call `createGetUniversalProps` with preview parameters)
    - Remove `createGetUniversalProps`
        - Just implement `getStaticProps`/`getServerSideProps` (Preview Mode will SSR automatically)
        - Get `previewData` from `context` and use it to configure the GraphQL Client
    - Add `SitePreviewProvider` to `App` (typically in `src/pages/_app.tsx`)
    - Provide a protected environment for the site
        - Make sure that a Authorization-Header is present in this environment
        - Add a Next.JS API-Route for the site preview (eg. `/api/site-preview`)
        - Call `getValidatedSitePreviewParams()` in the API-Route (calls the API which checks the Authorization-Header with the submitted scope)
        - Use the `path`-part of the return value to redirect to the preview

    Requires following changes to admin
    - The `SitesConfig` must provide a `sitePreviewApiUrl`

### Patch Changes

- @comet/eslint-plugin@7.0.0-beta.0

## 6.17.1

### Patch Changes

- @comet/eslint-plugin@6.17.1

## 6.17.0

### Patch Changes

- @comet/eslint-plugin@6.17.0

## 6.16.0

### Patch Changes

- @comet/eslint-plugin@6.16.0

## 6.15.1

### Patch Changes

- 6cb850567: Fix Prettier peer dependency

    The dependency range was incorrectly set to `>= 2`. Change to `^2.0.0` since Prettier v3 isn't supported at the moment.
    - @comet/eslint-plugin@6.15.1

## 6.15.0

### Patch Changes

- @comet/eslint-plugin@6.15.0

## 6.14.1

### Patch Changes

- @comet/eslint-plugin@6.14.1

## 6.14.0

### Patch Changes

- @comet/eslint-plugin@6.14.0

## 6.13.0

### Patch Changes

- @comet/eslint-plugin@6.13.0

## 6.12.0

### Patch Changes

- @comet/eslint-plugin@6.12.0

## 6.11.0

### Patch Changes

- @comet/eslint-plugin@6.11.0

## 6.10.0

### Patch Changes

- @comet/eslint-plugin@6.10.0

## 6.9.0

### Patch Changes

- @comet/eslint-plugin@6.9.0

## 6.8.0

### Patch Changes

- @comet/eslint-plugin@6.8.0

## 6.7.0

### Patch Changes

- @comet/eslint-plugin@6.7.0

## 6.6.2

### Patch Changes

- @comet/eslint-plugin@6.6.2

## 6.6.1

### Patch Changes

- @comet/eslint-plugin@6.6.1

## 6.6.0

### Patch Changes

- @comet/eslint-plugin@6.6.0

## 6.5.0

### Patch Changes

- @comet/eslint-plugin@6.5.0

## 6.4.0

### Patch Changes

- @comet/eslint-plugin@6.4.0

## 6.3.0

### Patch Changes

- @comet/eslint-plugin@6.3.0

## 6.2.1

### Patch Changes

- @comet/eslint-plugin@6.2.1

## 6.2.0

### Patch Changes

- @comet/eslint-plugin@6.2.0

## 6.1.0

### Patch Changes

- @comet/eslint-plugin@6.1.0

## 6.0.0

### Major Changes

- 72f98c7a: Enable `import/newline-after-import`
- 47eb81c6: Enable no-other-module-relative-import rule by default

### Patch Changes

- @comet/eslint-plugin@6.0.0

## 5.6.0

### Patch Changes

- @comet/eslint-plugin@5.6.0

## 5.5.0

### Patch Changes

- 80a6d8d3: Move import restriction for MUI's `Alert` to correct ESLint config
    - @comet/eslint-plugin@5.5.0

## 5.4.0

### Patch Changes

- @comet/eslint-plugin@5.4.0

## 5.3.0

### Patch Changes

- @comet/eslint-plugin@5.3.0

## 5.2.0

### Patch Changes

- @comet/eslint-plugin@5.2.0

## 5.1.0

### Patch Changes

- Updated dependencies [ec0582e6]
    - @comet/eslint-plugin@5.1.0

## 5.0.0

### Minor Changes

- b6f8cc0a: Add a new eslint rule that bans private sibling imports

    A sibling file is, for example, a `Foo.gql.ts` file next to a `Foo.ts` file. `Foo.gql.ts` is considered a private sibling of `Foo.ts` and must not be used (imported) by any other file.

### Patch Changes

- @comet/eslint-plugin@5.0.0

## 4.7.0

## 4.6.0

## 4.5.0

## 4.4.3

## 4.4.2

## 4.4.1

## 4.4.0

## 4.3.0

## 4.2.0

### Minor Changes

- 7a7d6e6f: Remove explicit-function-return-type rule for default nestjs eslint config
- bc82bc34: Enable `json-files/sort-package-json` rule to sort package.json files automatically

## 4.1.0
