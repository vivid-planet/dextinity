import type { MigrateOptions } from "../migrations/types";

type BlockFactoryNameOrOptions = string | { name: string; migrate?: MigrateOptions };

export { BlockFactoryNameOrOptions };
