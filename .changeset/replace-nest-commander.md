---
"@dextinity/cms-api": major
---

Replace `nest-commander` with a built-in implementation of console commands

`nest-commander` isn't maintained well, and its pinned dependencies held back NestJS upgrades.
`@dextinity/cms-api` now exports `Command`, `CommandRunner`, `Option` and `CommandFactory` with the same names and signatures for the features Dextinity uses.

```diff
- import { Command, CommandRunner, Option } from "nest-commander";
+ import { Command, CommandRunner, Option } from "@dextinity/cms-api";
```

Remove `nest-commander` and `@types/inquirer` from your project.
Interactive prompts, sub-commands, root commands and the `serviceErrorHandler` option of `CommandFactory` aren't supported.
Commands now fail when they're called with more arguments than they declare.
See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for details.
