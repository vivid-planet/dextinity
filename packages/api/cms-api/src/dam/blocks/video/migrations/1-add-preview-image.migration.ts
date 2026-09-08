import type { ClassConstructor } from "class-transformer";

import { BlockMigration } from "../../../../blocks/migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../../../blocks/migrations/types";

interface From {
    damFileId?: string;
    autoplay?: boolean;
    showControls?: boolean;
    loop?: boolean;
    previewImage?: unknown;
}

type To = From;

/**
 * Version 1 of every block created by `createDamVideoBlock`: the preview image the block gained after its
 * first release.
 *
 * The migration is always part of the chain so that version 1 means the same thing for every block the
 * factory creates, no matter what it supports. For a block without preview image support it only marks the
 * data as up to date, which keeps the version numbers stable when `supports` is widened later on.
 */
export function buildAddPreviewImageMigration({
    supportsPreviewImage,
}: {
    supportsPreviewImage: boolean;
}): ClassConstructor<BlockMigrationInterface> {
    return class AddPreviewImageMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        public readonly toVersion = 1;

        protected migrate(props: From): To {
            if (!supportsPreviewImage) {
                return props;
            }

            // Keep the preview image of a block that stored one without versioning its data.
            return { ...props, previewImage: props.previewImage ?? {} };
        }
    };
}
