import type { MigrateVendorOptions } from "./types";

// The vendor migrations are kept on the BlockData class, so a block extending another block's data
// inherits them. Without that, the extending block would neither run them nor be allowed to claim
// they ran, as its data is the data they migrate.
const migrateVendorKey = Symbol("migrateVendor");

interface BlockDataClass {
    [migrateVendorKey]?: MigrateVendorOptions;
}

export function setBlockDataMigrateVendor(BlockData: unknown, migrateVendor: MigrateVendorOptions): void {
    (BlockData as BlockDataClass)[migrateVendorKey] = migrateVendor;
}

// Reads the block's own vendor migrations, or those of the block it extends
export function getBlockDataMigrateVendor(BlockData: unknown): MigrateVendorOptions | undefined {
    return (BlockData as BlockDataClass)[migrateVendorKey];
}
