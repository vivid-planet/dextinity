---
title: Console Commands
---

We use [nest-commander](https://nest-commander.jaymcdoniel.dev/) to create console commands. Console commands can be used locally or deployed.

## Defining Commands

```ts title="Demo console command"
import { CreateRequestContext } from "@mikro-orm/decorators/legacy";
import { MikroORM } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

@Command({
    command: "demo-command",
    description: "Demo-Command for cronjob-deployment",
})
export class DemoCommand extends CommandRunner {
    private readonly logger = new Logger(DemoConsole.name);

    constructor(
        private readonly orm: MikroORM, // MikroORM is injected so we can use the request context
    ) {
        super();
    }

    @CreateRequestContext()
    async run(): Promise<void> {
        this.logger.log("Execute demo-command.");
    }
}
```

## Listing all available commands

Locally

```bash
npm run console
```

Deployed

```bash
npm run console:prod
```

## Running commands

Locally

```bash
npm run console demo-command
```

Deployed

```bash
npm run console:prod demo-command
```

## Best practices

- Use kebab case for command names and arguments.
- Dangerous commands (e.g. resetting the database) should check the `NODE_ENV` and only run locally.

```ts
async execute(): Promise<void> {
    if (process.env.NODE_ENV !== "development") {
        this.logger.error("Not allowed in production environments");
        process.exit(1);
    }

    // ...
}
```
