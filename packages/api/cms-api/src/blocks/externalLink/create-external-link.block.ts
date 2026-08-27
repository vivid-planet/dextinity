import { IsBoolean, IsOptional } from "class-validator";

import { BlockData, BlockInput, blockInputToData, createBlock } from "../block";
import { BlockField } from "../decorators/field";
import type { BlockFactoryNameOrOptions } from "../factories/types";
import { IsLinkTarget } from "../validator/is-link-target.validator";

type ExternalLinkBlockSupports = "openInNewWindow" | "noFollow";

const allSupports: ExternalLinkBlockSupports[] = ["openInNewWindow", "noFollow"];

interface ExternalLinkBlockFactoryOptions {
    /**
     * Which options the block has besides the URL. In contrast to hiding a field in the admin, an option
     * left out here doesn't exist at all: it is absent from `block-meta.json` and the generated types, and
     * sending it as input is rejected by validation.
     *
     * Because the block's field set is part of what its name promises, a block created with a reduced set
     * needs its own name — hence the mandatory `nameOrOptions`. It is a block of its own, not a variant of
     * `ExternalLinkBlock`, and needs a matching admin block and site component under that same name.
     *
     * Leaving a field out does not delete values that are already stored under that name. They stay in the
     * block's JSON, untyped, until a migration removes them.
     * @default ["openInNewWindow", "noFollow"]
     */
    supports?: ExternalLinkBlockSupports[];
}

export function createExternalLinkBlock({ supports = allSupports }: ExternalLinkBlockFactoryOptions, nameOrOptions: BlockFactoryNameOrOptions) {
    class ExternalLinkBlockData extends BlockData {
        @BlockField({ nullable: true })
        targetUrl?: string;

        openInNewWindow?: boolean;

        noFollow?: boolean;
    }

    class ExternalLinkBlockInput extends BlockInput {
        @IsOptional()
        @IsLinkTarget()
        @BlockField({ nullable: true })
        targetUrl?: string;

        openInNewWindow?: boolean;

        noFollow?: boolean;

        transformToBlockData(): ExternalLinkBlockData {
            return blockInputToData(ExternalLinkBlockData, this);
        }
    }

    // Applied imperatively, so that an option left out has no field at all rather than an optional one.
    // Iterating over allSupports instead of supports keeps the field order stable no matter how the caller
    // ordered its supports, which keeps block-meta.json stable.
    for (const field of allSupports.filter((field) => supports.includes(field))) {
        BlockField({ type: "boolean" })(ExternalLinkBlockData.prototype, field);

        BlockField({ type: "boolean" })(ExternalLinkBlockInput.prototype, field);
        IsBoolean()(ExternalLinkBlockInput.prototype, field);
    }

    return createBlock(ExternalLinkBlockData, ExternalLinkBlockInput, nameOrOptions);
}
