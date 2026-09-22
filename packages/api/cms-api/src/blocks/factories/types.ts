import type { MigrateOptions } from "../migrations/types";

type BlockFactoryNameOrOptions = string | { name: string; description?: string; migrate?: MigrateOptions };

export { BlockFactoryNameOrOptions };
