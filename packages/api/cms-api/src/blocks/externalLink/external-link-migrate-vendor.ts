import type { MigrateVendorOptions } from "../migrations/types";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe";
import { AddNoFollowMigration } from "./migrations/1-add-no-follow.migration";

// Shared by ExternalLinkBlock and the blocks created by createExternalLinkBlock, so that content stored by
// ExternalLinkBlock loads the same way in a block of a project's own and its own migrations start at version 1
export const externalLinkMigrateVendor: MigrateVendorOptions = {
    version: 1,
    migrations: typeSafeBlockMigrationPipe([AddNoFollowMigration]),
    // The migration counted in the block's version before it moved into the vendor chain
    legacyVersions: 1,
};
