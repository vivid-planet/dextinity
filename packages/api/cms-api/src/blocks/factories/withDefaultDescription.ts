import type { BlockFactoryNameOrOptions } from "./types";

export function withDefaultDescription(nameOrOptions: BlockFactoryNameOrOptions, description: string): Exclude<BlockFactoryNameOrOptions, string> {
    if (typeof nameOrOptions === "string") {
        return { name: nameOrOptions, description };
    }

    return { ...nameOrOptions, description: nameOrOptions.description ?? description };
}
