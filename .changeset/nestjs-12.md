---
"@dextinity/api-generator": major
"@dextinity/brevo-api": major
"@dextinity/cms-api": major
---

Upgrade NestJS to v12

See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for the required steps, and the [NestJS migration guide](https://docs.nestjs.com/migration-guide) for the complete list of upstream changes.

`nest-commander` pins `@golevelup/nestjs-discovery` at a version that still asks for NestJS v11 as a peer. npm and yarn install it as a nested copy and need nothing; pnpm with `strictPeerDependencies` needs the override the migration guide gives.

`@nestjs/core` exposes its subpaths through an `exports` map that maps `@nestjs/core/<name>` to `<name>.js`. `@nestjs/core/repl` is a directory, so that specifier no longer resolves — import `repl` from `@nestjs/core` instead:

```diff
- import { NestFactory } from "@nestjs/core";
- import { repl } from "@nestjs/core/repl";
+ import { NestFactory, repl } from "@nestjs/core";
```
