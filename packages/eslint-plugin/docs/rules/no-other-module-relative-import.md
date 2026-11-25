# @dextinity/no-other-module-relative-import

📝 Require the source root alias instead of a relative path when importing from another module.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Each direct subdirectory of the source root (`src/` by default) is a module, for example `src/products/` or `src/news/`. Inside a module, relative imports are fine. An import that leaves the module, such as `../news/News`, breaks when either file moves and hides the dependency between the modules. With the alias (`@src/news/News`), the import shows which module it depends on and stays the same wherever the importing file is.

The rule has an autofix that replaces the relative path with the alias.

## Examples

Code that fails, in `src/products/ProductsGrid.tsx`:

```ts
import { NewsGrid } from "../news/NewsGrid";
```

Code that passes, in `src/products/ProductsGrid.tsx`:

```ts
import { NewsGrid } from "@src/news/NewsGrid";
```

Code that passes, in `src/products/grid/ProductsGrid.tsx`:

```ts
import { ProductForm } from "../ProductForm";
```

Files outside the source root and files directly in it are not checked.

## Options

```js
"@dextinity/no-other-module-relative-import": ["warn", { sourceRoot: "./src", sourceRootAlias: "@src" }]
```

| Option            | Default   | Description                                                                            |
| ----------------- | --------- | -------------------------------------------------------------------------------------- |
| `sourceRoot`      | `"./src"` | Path to the source root, relative to the directory ESLint runs in                      |
| `sourceRootAlias` | `"@src"`  | Import alias that points to the source root, as set in `paths` in your `tsconfig.json` |

When you pass the options object, set both options: an option missing from the object does not fall back to its default.

## Presets

Enabled as `warn` in the `core` preset of `@dextinity/eslint-config` and `@dextinity/oxlint-config`, so all other presets include it.
