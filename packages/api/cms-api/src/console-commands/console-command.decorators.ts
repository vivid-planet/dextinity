import type { Type } from "@nestjs/common";

import type { ConsoleCommandInterface } from "./console-command.interface.js";

export const CONSOLE_COMMAND_METADATA = "dextinity:console-command";
export const CONSOLE_COMMAND_OPTIONS_METADATA = "dextinity:console-command-options";

export interface ConsoleCommandMetadata {
    name: string;
    /**
     * Space-separated argument definitions in commander syntax, e.g. `"<filepath> [comment]"`.
     */
    arguments?: string;
    description?: string;
}

export interface ConsoleCommandOptionMetadata {
    /**
     * Flags in commander syntax, e.g. `"-p, --path <path>"`.
     */
    flags: string;
    description?: string;
    defaultValue?: string | boolean | number;
    required?: boolean;
}

export interface ConsoleCommandOptionDefinition extends ConsoleCommandOptionMetadata {
    methodName: string | symbol;
}

export function ConsoleCommand(metadata: ConsoleCommandMetadata) {
    return (target: Type<ConsoleCommandInterface>): void => {
        Reflect.defineMetadata(CONSOLE_COMMAND_METADATA, metadata, target);
    };
}

/**
 * The decorated method parses the option value. It receives the value passed on the command line and the previous value.
 */
export function ConsoleCommandOption(metadata: ConsoleCommandOptionMetadata): MethodDecorator {
    return (target, methodName) => {
        const options: ConsoleCommandOptionDefinition[] = Reflect.getMetadata(CONSOLE_COMMAND_OPTIONS_METADATA, target.constructor) ?? [];
        Reflect.defineMetadata(CONSOLE_COMMAND_OPTIONS_METADATA, [...options, { ...metadata, methodName }], target.constructor);
    };
}
