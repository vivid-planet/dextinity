import type { MigrateOptions } from "../block.js";

type BlockFactoryNameOrOptions = string | { name: string; migrate?: MigrateOptions };

export type { BlockFactoryNameOrOptions };
