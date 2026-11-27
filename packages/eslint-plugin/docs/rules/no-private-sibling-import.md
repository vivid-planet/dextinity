# @dextinity/no-private-sibling-import

📝 Allow a private sibling file (`Foo.gql.ts`, `Foo.sc.ts`) to be imported only by the file it belongs to.

<!-- end auto-generated rule header -->

A private sibling file has the same name as its owner plus an extra extension. For example, `Foo.gql.ts` holds the GraphQL documents of `Foo.tsx`, and `Foo.sc.ts` holds its styled components. Other files must not import them: when another component needs the same query or style, move it to a shared file instead. This keeps each private sibling safe to change together with its owner.

The rule also requires private siblings to be imported with a relative path (`./Foo.gql`), because a sibling always lives in the same directory as its owner.

## Examples

Code that fails, in `Foo.tsx`:

```ts
import { barQuery } from "./Bar.gql";
import { Root } from "@src/foo/Foo.sc";
```

Code that passes, in `Foo.tsx`:

```ts
import { fooQuery } from "./Foo.gql";
import { Root } from "./Foo.sc";
```

The owner may itself have an extension, for example `FooBlock.loader.ts` may import `./FooBlock.loader.gql`. `FooBlock.ts` may not import it.

## Options

The rule takes an array of the extensions that mark a private sibling. The default is `["gql", "sc"]`.

```js
"@dextinity/no-private-sibling-import": ["error", ["gql", "sc", "gql.generated"]]
```

Add `gql.generated` when GraphQL Codegen generates the types of `Foo.gql.ts` into `Foo.gql.generated.ts`.

## Presets

Enabled as `error` in the `react` and `nextjs` presets of `@dextinity/eslint-config` and `@dextinity/oxlint-config`. The `nextjs` presets add `gql.generated` to the extensions.
