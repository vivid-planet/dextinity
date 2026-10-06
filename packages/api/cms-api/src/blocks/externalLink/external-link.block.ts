import { IsBoolean, IsOptional } from "class-validator";

import { BlockData, BlockInput, blockInputToData, createBlock } from "../block.js";
import { BlockField } from "../decorators/field.js";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe.js";
import { IsLinkTarget } from "../validator/is-link-target.validator.js";
import { AddNoFollowMigration } from "./migrations/1-add-no-follow.migration.js";

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
    migrate: {
        version: 1,
        migrations: typeSafeBlockMigrationPipe([AddNoFollowMigration]),
    },
});
