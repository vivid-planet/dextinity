# @comet/eslint-config

## 7.26.1

### Patch Changes

-   @comet/eslint-plugin@7.26.1

## 7.26.0

### Patch Changes

-   @comet/eslint-plugin@7.26.0

## 7.25.15

### Patch Changes

-   @comet/eslint-plugin@7.25.15

## 7.25.14

### Patch Changes

-   @comet/eslint-plugin@7.25.14

## 7.25.13

### Patch Changes

-   @comet/eslint-plugin@7.25.13

## 7.25.12

### Patch Changes

-   @comet/eslint-plugin@7.25.12

## 7.25.11

### Patch Changes

-   @comet/eslint-plugin@7.25.11

## 7.25.10

### Patch Changes

-   @comet/eslint-plugin@7.25.10

## 7.25.9

### Patch Changes

-   @comet/eslint-plugin@7.25.9

## 7.25.8

### Patch Changes

-   @comet/eslint-plugin@7.25.8

## 7.25.7

### Patch Changes

-   @comet/eslint-plugin@7.25.7

## 7.25.6

### Patch Changes

-   @comet/eslint-plugin@7.25.6

## 7.25.5

### Patch Changes

-   @comet/eslint-plugin@7.25.5

## 7.25.4

### Patch Changes

-   @comet/eslint-plugin@7.25.4

## 7.25.3

### Patch Changes

-   @comet/eslint-plugin@7.25.3

## 7.25.2

### Patch Changes

-   @comet/eslint-plugin@7.25.2

## 7.25.1

### Patch Changes

-   Updated dependencies [85e80218f]
    -   @comet/eslint-plugin@7.25.1

## 7.25.0

### Patch Changes

-   @comet/eslint-plugin@7.25.0

## 7.24.0

### Patch Changes

-   @comet/eslint-plugin@7.24.0

## 7.23.0

### Patch Changes

-   @comet/eslint-plugin@7.23.0

## 7.22.0

### Patch Changes

-   @comet/eslint-plugin@7.22.0

## 7.21.1

### Patch Changes

-   @comet/eslint-plugin@7.21.1

## 7.21.0

### Patch Changes

-   @comet/eslint-plugin@7.21.0

## 7.20.0

### Patch Changes

-   @comet/eslint-plugin@7.20.0

## 7.19.0

### Patch Changes

-   @comet/eslint-plugin@7.19.0

## 7.18.0

### Patch Changes

-   @comet/eslint-plugin@7.18.0

## 7.17.0

### Patch Changes

-   @comet/eslint-plugin@7.17.0

## 7.16.0

### Patch Changes

-   @comet/eslint-plugin@7.16.0

## 7.15.0

### Patch Changes

-   @comet/eslint-plugin@7.15.0

## 7.14.0

### Patch Changes

-   @comet/eslint-plugin@7.14.0

## 7.13.0

### Patch Changes

-   @comet/eslint-plugin@7.13.0

## 7.12.0

### Patch Changes

-   @comet/eslint-plugin@7.12.0

## 7.11.0

### Patch Changes

-   @comet/eslint-plugin@7.11.0

## 7.10.0

### Patch Changes

-   @comet/eslint-plugin@7.10.0

## 7.9.0

### Patch Changes

-   @comet/eslint-plugin@7.9.0

## 7.8.0

### Patch Changes

-   @comet/eslint-plugin@7.8.0

## 7.7.0

### Patch Changes

-   @comet/eslint-plugin@7.7.0

## 7.6.0

### Patch Changes

-   @comet/eslint-plugin@7.6.0

## 7.5.0

### Patch Changes

-   @comet/eslint-plugin@7.5.0

## 7.4.2

### Patch Changes

-   @comet/eslint-plugin@7.4.2

## 7.4.1

### Patch Changes

-   @comet/eslint-plugin@7.4.1

## 7.4.0

### Patch Changes

-   @comet/eslint-plugin@7.4.0

## 7.3.2

### Patch Changes

-   @comet/eslint-plugin@7.3.2

## 7.3.1

### Patch Changes

-   @comet/eslint-plugin@7.3.1

## 7.3.0

### Patch Changes

-   @comet/eslint-plugin@7.3.0

## 7.2.1

### Patch Changes

-   @comet/eslint-plugin@7.2.1

## 7.2.0

### Patch Changes

-   @comet/eslint-plugin@7.2.0

## 7.1.0

### Patch Changes

-   @comet/eslint-plugin@7.1.0

## 7.0.0

### Major Changes

-   45585f4cc: Add the rule `@typescript-eslint/prefer-enum-initializers` to require enum initializers

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

-   af37ac9d1: nextjs: Enable `react/jsx-curly-brace-presence` rule
-   7a473ab8d: Prevent `@mui/icons-material` icon imports

    Icons used in Comet DXP applications should match the Comet CI.
    Use icons from `@comet/admin-icons` instead.

-   2e20a8684: nextjs/react: Enable `react/jsx-no-useless-fragment` rule

### Minor Changes

-   769bd72f0: Use the Next.js Preview Mode for the site preview

    The preview is entered by navigating to an API Route in the site, which has to be executed in a secured environment.
    In the API Route the current scope is checked (and possibly stored), then the client is redirected to the preview.

### Patch Changes

-   @comet/eslint-plugin@7.0.0

## 7.0.0-beta.6

### Major Changes

-   2e20a8684: nextjs/react: Enable `react/jsx-no-useless-fragment` rule

### Patch Changes

-   @comet/eslint-plugin@7.0.0-beta.6

## 7.0.0-beta.5

### Patch Changes

-   @comet/eslint-plugin@7.0.0-beta.5

## 7.0.0-beta.4

### Patch Changes

-   @comet/eslint-plugin@7.0.0-beta.4

## 7.0.0-beta.3

### Major Changes

-   7a473ab8d: Prevent `@mui/icons-material` icon imports

    Icons used in Comet DXP applications should match the Comet CI.
    Use icons from `@comet/admin-icons` instead.

### Patch Changes

-   @comet/eslint-plugin@7.0.0-beta.3

## 7.0.0-beta.2

### Patch Changes

-   @comet/eslint-plugin@7.0.0-beta.2

## 7.0.0-beta.1

### Patch Changes

-   @comet/eslint-plugin@7.0.0-beta.1

## 7.0.0-beta.0

### Major Changes

-   45585f4cc: Enforce PascalCase for enums

    Changing the casing of an existing enum can be problematic, e.g., if the enum values are persisted in the database.
    In such cases, the rule can be disabled like so

    ```diff
    + /* eslint-disable @typescript-eslint/naming-convention */
      export enum ExampleEnum {
          attr1 = "attr1",
      }
    + /* eslint-enable @typescript-eslint/naming-convention */
    ```

-   45585f4cc: Add the rule `@typescript-eslint/prefer-enum-initializers` to require enum initializers

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

-   af37ac9d1: nextjs: Enable `react/jsx-curly-brace-presence` rule

### Minor Changes

-   769bd72f0: Uses the Next.JS Preview mode for the site preview

    The preview is entered by navigating to an API-Route in the site, which has to be executed in a secured environment.
    In the API-Routes the current scope is checked (and possibly stored), then the client is redirected to the Preview.

    // TODO Move the following introduction to the migration guide before releasing

    Requires following changes to site:

    -   Import `useRouter` from `next/router` (not exported from `@comet/cms-site` anymore)
    -   Import `Link` from `next/link` (not exported from `@comet/cms-site` anymore)
    -   Remove preview pages (pages in `src/pages/preview/` directory which call `createGetUniversalProps` with preview parameters)
    -   Remove `createGetUniversalProps`
        -   Just implement `getStaticProps`/`getServerSideProps` (Preview Mode will SSR automatically)
        -   Get `previewData` from `context` and use it to configure the GraphQL Client
    -   Add `SitePreviewProvider` to `App` (typically in `src/pages/_app.tsx`)
    -   Provide a protected environment for the site
        -   Make sure that a Authorization-Header is present in this environment
        -   Add a Next.JS API-Route for the site preview (eg. `/api/site-preview`)
        -   Call `getValidatedSitePreviewParams()` in the API-Route (calls the API which checks the Authorization-Header with the submitted scope)
        -   Use the `path`-part of the return value to redirect to the preview

    Requires following changes to admin

    -   The `SitesConfig` must provide a `sitePreviewApiUrl`

### Patch Changes

-   @comet/eslint-plugin@7.0.0-beta.0

## 6.17.1

### Patch Changes

-   @comet/eslint-plugin@6.17.1

## 6.17.0

### Patch Changes

-   @comet/eslint-plugin@6.17.0

## 6.16.0

### Patch Changes

-   @comet/eslint-plugin@6.16.0

## 6.15.1

### Patch Changes

-   6cb850567: Fix Prettier peer dependency

    The dependency range was incorrectly set to `>= 2`. Change to `^2.0.0` since Prettier v3 isn't supported at the moment.

    -   @comet/eslint-plugin@6.15.1

## 6.15.0

### Patch Changes

-   @comet/eslint-plugin@6.15.0

## 6.14.1

### Patch Changes

-   @comet/eslint-plugin@6.14.1

## 6.14.0

### Patch Changes

-   @comet/eslint-plugin@6.14.0

## 6.13.0

### Patch Changes

-   @comet/eslint-plugin@6.13.0

## 6.12.0

### Patch Changes

-   @comet/eslint-plugin@6.12.0

## 6.11.0

### Patch Changes

-   @comet/eslint-plugin@6.11.0

## 6.10.0

### Patch Changes

-   @comet/eslint-plugin@6.10.0

## 6.9.0

### Patch Changes

-   @comet/eslint-plugin@6.9.0

## 6.8.0

### Patch Changes

-   @comet/eslint-plugin@6.8.0

## 6.7.0

### Patch Changes

-   @comet/eslint-plugin@6.7.0

## 6.6.2

### Patch Changes

-   @comet/eslint-plugin@6.6.2

## 6.6.1

### Patch Changes

-   @comet/eslint-plugin@6.6.1

## 6.6.0

### Patch Changes

-   @comet/eslint-plugin@6.6.0

## 6.5.0

### Patch Changes

-   @comet/eslint-plugin@6.5.0

## 6.4.0

### Patch Changes

-   @comet/eslint-plugin@6.4.0

## 6.3.0

### Patch Changes

-   @comet/eslint-plugin@6.3.0

## 6.2.1

### Patch Changes

-   @comet/eslint-plugin@6.2.1

## 6.2.0

### Patch Changes

-   @comet/eslint-plugin@6.2.0

## 6.1.0

### Patch Changes

-   @comet/eslint-plugin@6.1.0

## 6.0.0

### Major Changes

-   72f98c7a: Enable `import/newline-after-import`
-   47eb81c6: Enable no-other-module-relative-import rule by default

### Patch Changes

-   @comet/eslint-plugin@6.0.0

## 5.6.0

### Patch Changes

-   @comet/eslint-plugin@5.6.0

## 5.5.0

### Patch Changes

-   80a6d8d3: Move import restriction for MUI's `Alert` to correct ESLint config
    -   @comet/eslint-plugin@5.5.0

## 5.4.0

### Patch Changes

-   @comet/eslint-plugin@5.4.0

## 5.3.0

### Patch Changes

-   @comet/eslint-plugin@5.3.0

## 5.2.0

### Patch Changes

-   @comet/eslint-plugin@5.2.0

## 5.1.0

### Patch Changes

-   Updated dependencies [ec0582e6]
    -   @comet/eslint-plugin@5.1.0

## 5.0.0

### Minor Changes

-   b6f8cc0a: Add a new eslint rule that bans private sibling imports

    A sibling file is, for example, a `Foo.gql.ts` file next to a `Foo.ts` file. `Foo.gql.ts` is considered a private sibling of `Foo.ts` and must not be used (imported) by any other file.

### Patch Changes

-   @comet/eslint-plugin@5.0.0

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

-   7a7d6e6f: Remove explicit-function-return-type rule for default nestjs eslint config
-   bc82bc34: Enable `json-files/sort-package-json` rule to sort package.json files automatically

## 4.1.0
