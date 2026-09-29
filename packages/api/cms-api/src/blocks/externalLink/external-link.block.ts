import { IsBoolean, IsOptional } from "class-validator";

import { BlockData, BlockInput, blockInputToData, createBlock } from "../block";
import { BlockField } from "../decorators/field";
import { IsLinkTarget } from "../validator/is-link-target.validator";
import { externalLinkMigrateVendor } from "./external-link-migrate-vendor";

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
    migrateVendor: externalLinkMigrateVendor,
});
