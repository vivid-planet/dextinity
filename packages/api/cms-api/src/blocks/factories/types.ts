import type { MigrateOptions } from "../migrations/types.js";

type BlockFactoryNameOrOptions = string | { name: string; description?: string; migrate?: MigrateOptions };

export type { BlockFactoryNameOrOptions };
