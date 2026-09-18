import type { BlockDataFactory, BlockDataInterface } from "../block";
import { applyBlockMigrations } from "./applyMigrations";
import type { MigrateOptions } from "./types";

// Decorates a BlockDataFactory to apply migrations
export function createAppliedMigrationsBlockDataFactoryDecorator(migrate: MigrateOptions, blockName?: string) {
    return function appliedMigrationsBlockDataFactoryDecorator<T extends BlockDataInterface>(fn: BlockDataFactory<T>): BlockDataFactory<T> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decoratedAppliedMigrationsBlockDataFactory: BlockDataFactory<T> = function decoratedAppliedMigrationsBlockDataFactory(value: any) {
            const blockData = fn(applyBlockMigrations(value, migrate, blockName));

            return blockData;
        };
        return decoratedAppliedMigrationsBlockDataFactory;
    };
}
