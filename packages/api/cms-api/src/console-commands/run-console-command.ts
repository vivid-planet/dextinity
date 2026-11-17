import type { INestApplicationContext, Type } from "@nestjs/common";
import { DiscoveryService, ModulesContainer } from "@nestjs/core";
import { Command, Option } from "commander";

import {
    CONSOLE_COMMAND_METADATA,
    CONSOLE_COMMAND_OPTIONS_METADATA,
    type ConsoleCommandMetadata,
    type ConsoleCommandOptionDefinition,
} from "./console-command.decorators.js";
import type { ConsoleCommandInterface } from "./console-command.interface.js";

/**
 * Runs the console command passed on the command line. Errors thrown by the command are rethrown.
 */
export async function runConsoleCommand(app: INestApplicationContext, argv: string[] = process.argv): Promise<void> {
    const program = new Command();

    for (const { metatype, instance } of findConsoleCommands(app)) {
        program.addCommand(createCommand(metatype, instance));
    }

    await program.parseAsync(argv);
}

function findConsoleCommands(app: INestApplicationContext): Array<{ metatype: Type<ConsoleCommandInterface>; instance: ConsoleCommandInterface }> {
    const discoveryService = new DiscoveryService(app.get(ModulesContainer));
    const consoleCommands = new Map<Type<ConsoleCommandInterface>, ConsoleCommandInterface>();

    for (const wrapper of discoveryService.getProviders()) {
        const metatype = wrapper.metatype as Type<ConsoleCommandInterface> | null;

        if (!metatype || !wrapper.instance || !wrapper.isDependencyTreeStatic() || consoleCommands.has(metatype)) {
            continue;
        }

        if (Reflect.hasMetadata(CONSOLE_COMMAND_METADATA, metatype)) {
            consoleCommands.set(metatype, wrapper.instance as ConsoleCommandInterface);
        }
    }

    return Array.from(consoleCommands, ([metatype, instance]) => ({ metatype, instance }));
}

function createCommand(metatype: Type<ConsoleCommandInterface>, instance: ConsoleCommandInterface): Command {
    const metadata: ConsoleCommandMetadata = Reflect.getMetadata(CONSOLE_COMMAND_METADATA, metatype);
    const optionDefinitions: ConsoleCommandOptionDefinition[] = Reflect.getMetadata(CONSOLE_COMMAND_OPTIONS_METADATA, metatype) ?? [];

    const command = new Command(metadata.name).description(metadata.description ?? "");

    if (metadata.arguments) {
        command.arguments(metadata.arguments);
    }

    for (const { flags, description, defaultValue, required, methodName } of optionDefinitions) {
        const parse = (instance as unknown as Record<string | symbol, (value: string, previous: unknown) => unknown>)[methodName];
        const option = new Option(flags, description).makeOptionMandatory(required ?? false).argParser(parse.bind(instance));

        if (defaultValue !== undefined) {
            option.default(defaultValue);
        }

        command.addOption(option);
    }

    command.action(async () => {
        await instance.run(command.args, command.opts());
    });

    return command;
}
