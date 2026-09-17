import type { ClassConstructor } from "class-transformer";

export interface VersionDataInterface {
    $$version?: number;
    $$versions?: Record<string, number>;
}

// Instead of passing 2 Generics to BlockMigrationInterface
// like so: BlockMigrationInterface<From, To>
// this technique allows to pass 'From' and 'To' with one generic
// BlockMigrationInterface<(from: From) => To>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockMigrationTransformFn = (from: any) => any;

// Types to infer From and To from TransformFn
// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
export type From<T extends BlockMigrationTransformFn> = T extends (a: infer T) => any ? T & VersionDataInterface : VersionDataInterface;
// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
export type To<T extends BlockMigrationTransformFn> = T extends (from: any) => infer T ? T & VersionDataInterface : VersionDataInterface;

// Tells a migration which chain it is running in. Migrations without a scope share the block's
// `$$version` counter, scoped migrations count independently in `$$versions[scope]`.
export interface BlockMigrationContext {
    scope?: string;
}

// Public Interface
export interface BlockMigrationInterface<Fn extends BlockMigrationTransformFn = BlockMigrationTransformFn> {
    readonly toVersion: number;
    readonly supports: (raw: From<Fn> & VersionDataInterface, context?: BlockMigrationContext) => boolean;
    readonly apply: (raw: From<Fn> & VersionDataInterface, context?: BlockMigrationContext) => To<Fn> & VersionDataInterface;
}

// A chain of migrations owned by someone other than the block itself, for instance a library
// shipping migrations for a block a project configures. Each scope counts its versions from 1,
// independently of the block's `version` and of every other scope.
export interface BlockMigrationScopeOptions {
    version: number;
    migrations: ClassConstructor<BlockMigrationInterface>[];
    // Data saved before the scope existed only carries `$$version`. Maps that legacy counter to the
    // scope version the data already contains, so migrations moved into a scope don't run twice.
    initialVersionFromLegacy?: (legacyVersion: number) => number;
}

export interface MigrateOptions {
    migrations?: ClassConstructor<BlockMigrationInterface>[];
    version?: number;
    scopes?: Record<string, BlockMigrationScopeOptions>;
}
