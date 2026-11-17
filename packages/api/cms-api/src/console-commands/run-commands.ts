import type { INestApplicationContext, Type } from "@nestjs/common";
import { DiscoveryService, ModulesContainer } from "@nestjs/core";
import { Command, Option } from "commander";

import { COMMAND_METADATA, COMMAND_OPTIONS_METADATA, type CommandMetadata, type CommandOptionDefinition } from "./command.decorators.js";
import type { CommandRunner } from "./command-runner.js";

export async function runCommands(app: INestApplicationContext, argv: string[] = process.argv): Promise<void> {
    const program = new Command();

    for (const { metatype, instance } of findCommands(app)) {
        program.addCommand(createCommand(metatype, instance));
    }

    await program.parseAsync(argv);
}

function findCommands(app: INestApplicationContext): Array<{ metatype: Type<CommandRunner>; instance: CommandRunner }> {
    const discoveryService = new DiscoveryService(app.get(ModulesContainer));
    const commands = new Map<Type<CommandRunner>, CommandRunner>();

    for (const wrapper of discoveryService.getProviders()) {
        const metatype = wrapper.metatype as Type<CommandRunner> | null;

        if (!metatype || !wrapper.instance || !wrapper.isDependencyTreeStatic() || commands.has(metatype)) {
            continue;
        }

        if (Reflect.hasMetadata(COMMAND_METADATA, metatype)) {
            commands.set(metatype, wrapper.instance as CommandRunner);
        }
    }

    return Array.from(commands, ([metatype, instance]) => ({ metatype, instance }));
}

function createCommand(metatype: Type<CommandRunner>, instance: CommandRunner): Command {
    const metadata: CommandMetadata = Reflect.getMetadata(COMMAND_METADATA, metatype);
    const optionDefinitions: CommandOptionDefinition[] = Reflect.getMetadata(COMMAND_OPTIONS_METADATA, metatype) ?? [];

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
