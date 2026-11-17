---
title: Console Commands
---

Console commands are classes registered as providers in a NestJS module. They can be used locally or deployed, for instance as a cron job.

## Defining commands

```ts title="Demo console command"
import { ConsoleCommand, type ConsoleCommandInterface } from "@dextinity/cms-api";
import { CreateRequestContext } from "@mikro-orm/decorators/legacy";
import { MikroORM } from "@mikro-orm/postgresql";
import { Logger } from "@nestjs/common";

@ConsoleCommand({
    name: "demo-command",
    description: "Demo-Command for cronjob-deployment",
})
export class DemoCommand implements ConsoleCommandInterface {
    private readonly logger = new Logger(DemoCommand.name);

    constructor(
        private readonly orm: MikroORM, // MikroORM is injected so we can use the request context
    ) {}

    @CreateRequestContext()
    async run(): Promise<void> {
        this.logger.log("Execute demo-command.");
    }
}
```

## Arguments and options

Define arguments in [commander](https://github.com/tj/commander.js) syntax: `<name>` is required, `[name]` is optional.
They're passed to `run()` as the first parameter.

Define options with the `@ConsoleCommandOption()` decorator.
The decorated method parses the value passed on the command line, and `run()` receives the parsed values as the second parameter:

```ts
@ConsoleCommand({
    name: "import-products",
    arguments: "<filePath>",
})
export class ImportProductsCommand implements ConsoleCommandInterface {
    async run([filePath]: string[], { limit }: { limit: number }): Promise<void> {
        // ...
    }

    @ConsoleCommandOption({
        flags: "-l, --limit <limit>",
        description: "Maximum number of products to import",
        defaultValue: 100,
    })
    parseLimit(value: string): number {
        return parseInt(value);
    }
}
```

Set `required: true` to make an option mandatory.

## Running commands from `console.ts`

```ts title="api/src/console.ts"
import { runConsoleCommand } from "@dextinity/cms-api";
import { NestFactory } from "@nestjs/core";

const app = await NestFactory.createApplicationContext(AppModule.forRoot(config), { logger: ["error", "warn", "log"] });
await app.init();
await runConsoleCommand(app);
await app.close();
```

`runConsoleCommand()` rethrows errors thrown by the command, so `console.ts` can log them and exit with a non-zero code.

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
