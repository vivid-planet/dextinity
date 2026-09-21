import { IsBoolean, IsOptional } from "class-validator";

import { BlockData, BlockInput, blockInputToData, createBlock } from "../block";
import { BlockField } from "../decorators/field";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe";
import { IsLinkTarget } from "../validator/is-link-target.validator";
import { AddNoFollowMigration } from "./migrations/1-add-no-follow.migration";

class ExternalLinkBlockData extends BlockData {
    @BlockField({ nullable: true })
    targetUrl?: string;

    @BlockField()
    openInNewWindow: boolean;

    @BlockField()
    noFollow: boolean;
}

class ExternalLinkBlockInput extends BlockInput {
    @IsOptional()
    @IsLinkTarget()
    @BlockField({ nullable: true })
    targetUrl?: string;

    @IsBoolean()
    @BlockField()
    openInNewWindow: boolean;

    @IsBoolean()
    @BlockField()
    noFollow: boolean;

    transformToBlockData(): ExternalLinkBlockData {
        return blockInputToData(ExternalLinkBlockData, this);
    }
}

export const ExternalLinkBlock = createBlock(ExternalLinkBlockData, ExternalLinkBlockInput, {
    name: "ExternalLink",
    description: "A link to a URL outside of this application.",
    migrateVendor: {
        version: 1,
        migrations: typeSafeBlockMigrationPipe([AddNoFollowMigration]),
        // The migration counted in the block's version before it moved into the vendor chain
        legacyVersions: 1,
    },
});
