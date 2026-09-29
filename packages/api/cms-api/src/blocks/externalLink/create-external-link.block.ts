import { IsBoolean, IsOptional } from "class-validator";

import { BlockData, BlockInput, createBlock, getRegisteredBlocks } from "../block";
import { BlockField } from "../decorators/field";
import type { BlockFactoryNameOrOptions } from "../factories/types";
import { IsLinkTarget } from "../validator/is-link-target.validator";
import { externalLinkMigrateVendor } from "./external-link-migrate-vendor";

type ExternalLinkBlockOption = "openInNewWindow" | "noFollow";

const allOptions: ExternalLinkBlockOption[] = ["openInNewWindow", "noFollow"];

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
 * Creates an external link block with the options the site supports. In contrast to hiding a field in the admin, an
 * option disabled here doesn't exist at all: it is absent from `block-meta.json` and the generated types, and sending
 * it as input is rejected by validation.
 *
 * Because the block's field set is part of what its name promises, the block needs its own name — hence the mandatory
 * `nameOrOptions`. It is a block of its own, not a variant of `ExternalLinkBlock`, and needs a matching admin block and
 * site component under that same name.
 *
 * Disabling an option does not delete values that are already stored under that name. They stay in the block's JSON,
 * but aren't passed on to the admin or the site, until a migration removes them or the block is saved again.
 */
export function createExternalLinkBlock(options: ExternalLinkBlockFactoryOptions, nameOrOptions: BlockFactoryNameOrOptions) {
    const name = typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name;
    const migrate = typeof nameOrOptions === "string" ? undefined : nameOrOptions.migrate;

    if (getRegisteredBlocks().some((block) => block.name === name)) {
        throw new Error(
            `A block named "${name}" is already registered. A block created with createExternalLinkBlock needs a name of its own, for instance createExternalLinkBlock({ openInNewWindow: false, noFollow: false }, "UrlLink").`,
        );
    }

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

    // Content stored by ExternalLinkBlock carries its vendor migrations, so a block replacing it needs them as well
    return createBlock(ExternalLinkBlockData, ExternalLinkBlockInput, { name, migrate, migrateVendor: externalLinkMigrateVendor });
}
