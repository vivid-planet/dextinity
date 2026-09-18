import type { ClassConstructor } from "class-transformer";

export interface VersionDataInterface {
    $$version?: number;
    $$vendorVersion?: number;
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

// Which of the two migration chains a migration belongs to: the block's own migrations count in
// `$$version`, the migrations shipped with the block by the library providing it in `$$vendorVersion`
export type BlockMigrationVersionField = "$$version" | "$$vendorVersion";

// Public Interface
export interface BlockMigrationInterface<Fn extends BlockMigrationTransformFn = BlockMigrationTransformFn> {
    readonly toVersion: number;
    readonly supports: (raw: From<Fn> & VersionDataInterface, versionField?: BlockMigrationVersionField) => boolean;
    readonly apply: (raw: From<Fn> & VersionDataInterface, versionField?: BlockMigrationVersionField) => To<Fn> & VersionDataInterface;
}

export interface MigrateOptions {
    migrations: ClassConstructor<BlockMigrationInterface>[];
    version: number;
    // Migrations shipped with the block by the library providing it. They form a chain of their own,
    // counted from 1 in `$$vendorVersion`, and run before the block's own migrations.
    vendorMigrations?: ClassConstructor<BlockMigrationInterface>[];
    vendorVersion?: number;
}
