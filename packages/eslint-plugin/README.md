# @dextinity/eslint-plugin

ESLint rules for Dextinity projects. The rules also work as an oxlint JS plugin.

The presets of `@dextinity/eslint-config` and `@dextinity/oxlint-config` enable the rules, so most projects don't need to install this package directly.

## Rules

| Rule                                                                               | Description                                                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [`no-private-sibling-import`](docs/rules/no-private-sibling-import.md)             | Allow a private sibling file (`Foo.gql.ts`, `Foo.sc.ts`) to be imported only by the file it belongs to |
| [`no-other-module-relative-import`](docs/rules/no-other-module-relative-import.md) | Require the source root alias instead of a relative path when importing from another module            |
| [`no-next-public-env`](docs/rules/no-next-public-env.md)                           | Disallow reading `NEXT_PUBLIC_*` environment variables                                                 |

## Usage

The plugin registers under the `@dextinity` namespace:

```js
import dextinityPlugin from "@dextinity/eslint-plugin";

export default [
    {
        plugins: { "@dextinity": dextinityPlugin },
        rules: {
            "@dextinity/no-private-sibling-import": "error",
        },
    },
];
```
