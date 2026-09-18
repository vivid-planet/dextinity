import type { BlockDataFactory, BlockDataInterface } from "../block";
import { applyBlockMigrations, type BlockMigrateOptions } from "./applyMigrations";

// Decorates a BlockDataFactory to apply migrations
export function createAppliedMigrationsBlockDataFactoryDecorator(options: BlockMigrateOptions) {
    return function appliedMigrationsBlockDataFactoryDecorator<T extends BlockDataInterface>(fn: BlockDataFactory<T>): BlockDataFactory<T> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decoratedAppliedMigrationsBlockDataFactory: BlockDataFactory<T> = function decoratedAppliedMigrationsBlockDataFactory(value: any) {
            const blockData = fn(applyBlockMigrations(value, options));

            return blockData;
        };
        return decoratedAppliedMigrationsBlockDataFactory;
    };
}
