---
"@dextinity/cms-api": major
---

Replace `nest-commander` with built-in console commands

`nest-commander` isn't maintained well, and its pinned dependencies held back NestJS upgrades.
`@dextinity/cms-api` now exports `ConsoleCommand`, `ConsoleCommandOption`, `ConsoleCommandInterface` and `runConsoleCommand` for the features Dextinity uses.

```diff
- import { Command, CommandRunner } from "nest-commander";
+ import { ConsoleCommand, type ConsoleCommandInterface } from "@dextinity/cms-api";

- @Command({ name: "import-products", arguments: "<filePath>" })
- export class ImportProductsCommand extends CommandRunner {
+ @ConsoleCommand({ name: "import-products", arguments: "<filePath>" })
+ export class ImportProductsCommand implements ConsoleCommandInterface {
```

Remove `nest-commander` and `@types/inquirer` from your project.
Interactive prompts, sub-commands and root commands aren't supported.
Commands now fail when they're called with more arguments than they declare.
See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for details.
