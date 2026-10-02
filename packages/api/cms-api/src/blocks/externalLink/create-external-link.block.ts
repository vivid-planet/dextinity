import { IsBoolean, IsOptional } from "class-validator";

import { BlockData, BlockInput, createBlock } from "../block";
import { BlockField } from "../decorators/field";
import type { BlockFactoryNameOrOptions } from "../factories/types";
import type { MigrateVendorOptions } from "../migrations/types";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe";
import { IsLinkTarget } from "../validator/is-link-target.validator";
import { AddNoFollowMigration } from "./migrations/1-add-no-follow.migration";

type ExternalLinkBlockOption = "openInNewWindow" | "noFollow";

const allOptions: ExternalLinkBlockOption[] = ["openInNewWindow", "noFollow"];

const migrateVendor: MigrateVendorOptions = {
    version: 1,
    migrations: typeSafeBlockMigrationPipe([AddNoFollowMigration]),
    // The migration counted in the block's version before it moved into the vendor chain
    legacyVersions: 1,
};

interface ExternalLinkBlockFactoryOptions {
    /**
     * Lets links open in a new window. Defaults to `true`.
     */
    openInNewWindow?: boolean;
    /**
     * Lets links be marked with `rel="nofollow"`. Defaults to `true`.
     */
    noFollow?: boolean;
}

/**
 * Creates an external link block without the options disabled here.
 */
export function createExternalLinkBlock(options: ExternalLinkBlockFactoryOptions, nameOrOptions: BlockFactoryNameOrOptions) {
    const name = typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name;
    const migrate = typeof nameOrOptions === "string" ? undefined : nameOrOptions.migrate;

    const supportedFields = allOptions.filter((option) => options[option] !== false);

    // Picks the fields the block has, so that values stored before an option was left out aren't passed on
    const pickSupportedFields = (source: { targetUrl?: string; openInNewWindow?: boolean; noFollow?: boolean }) => ({
        targetUrl: source.targetUrl,
        ...Object.fromEntries(supportedFields.map((field) => [field, source[field]])),
    });

    class ExternalLinkBlockData extends BlockData {
        @BlockField({ nullable: true })
        targetUrl?: string;

        openInNewWindow?: boolean;

        noFollow?: boolean;

        async transformToPlain() {
            return pickSupportedFields(this);
        }
    }

    class ExternalLinkBlockInput extends BlockInput {
        @IsOptional()
        @IsLinkTarget()
        @BlockField({ nullable: true })
        targetUrl?: string;

        openInNewWindow?: boolean;

        noFollow?: boolean;

        transformToBlockData(): ExternalLinkBlockData {
            return Object.assign(new ExternalLinkBlockData(), pickSupportedFields(this));
        }
    }

    // Applied imperatively, so that an option left out has no field at all rather than an optional one.
    for (const field of supportedFields) {
        BlockField({ type: "boolean" })(ExternalLinkBlockData.prototype, field);

        BlockField({ type: "boolean" })(ExternalLinkBlockInput.prototype, field);
        IsBoolean()(ExternalLinkBlockInput.prototype, field);
    }

    // Shared with the ExternalLinkBlock, so that a block replacing it reads the content it stored
    return createBlock(ExternalLinkBlockData, ExternalLinkBlockInput, { name, migrate, migrateVendor });
}
