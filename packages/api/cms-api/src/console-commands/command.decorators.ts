import type { Type } from "@nestjs/common";

import type { CommandRunner } from "./command-runner.js";

export const COMMAND_METADATA = "dextinity:command";
export const COMMAND_OPTIONS_METADATA = "dextinity:command-options";

export interface CommandMetadata {
    name: string;
    /**
     * Space-separated argument definitions in commander syntax, e.g. `"<filepath> [comment]"`.
     */
    arguments?: string;
    description?: string;
}

export interface OptionMetadata {
    /**
     * Flags in commander syntax, e.g. `"-p, --path <path>"`.
     */
    flags: string;
    description?: string;
    defaultValue?: string | boolean | number;
    required?: boolean;
}

export interface CommandOptionDefinition extends OptionMetadata {
    methodName: string | symbol;
}

export function Command(metadata: CommandMetadata) {
    return (target: Type<CommandRunner>): void => {
        Reflect.defineMetadata(COMMAND_METADATA, metadata, target);
    };
}

/**
 * The decorated method parses the option value. It receives the value passed on the command line and the previous value.
 */
export function Option(metadata: OptionMetadata): MethodDecorator {
    return (target, methodName) => {
        const options: CommandOptionDefinition[] = Reflect.getMetadata(COMMAND_OPTIONS_METADATA, target.constructor) ?? [];
        Reflect.defineMetadata(COMMAND_OPTIONS_METADATA, [...options, { ...metadata, methodName }], target.constructor);
    };
}
