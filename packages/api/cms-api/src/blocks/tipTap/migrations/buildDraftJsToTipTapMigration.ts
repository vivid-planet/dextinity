import type { JSONContent } from "@tiptap/core";
import type { Schema } from "@tiptap/pm/model";
import type { ClassConstructor } from "class-transformer";

import type { Block } from "../../block";
import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";
import { isValidTipTapContentSync } from "../tipTapValidation";
import {
    buildEmptyTipTapDoc,
    buildStrippedTipTapDoc,
    convertDraftJsToTipTap,
    type ConvertOptions,
    type DraftJsContent,
} from "./convertDraftJsToTipTap";

interface From {
    draftContent?: DraftJsContent;
    tipTapContent?: JSONContent;
}

interface To {
    tipTapContent: JSONContent;
}

function isDraftJsContent(value: unknown): value is DraftJsContent {
    return (
        typeof value === "object" &&
        value !== null &&
        "blocks" in value &&
        Array.isArray((value as DraftJsContent).blocks) &&
        "entityMap" in value &&
        typeof (value as DraftJsContent).entityMap === "object" &&
        (value as DraftJsContent).entityMap !== null
    );
}

interface BuildOptions extends ConvertOptions {
    schema: Schema;
    maxTextBlocks?: number;
    link?: Block;
}

export function buildDraftJsToTipTapMigration(options: BuildOptions): ClassConstructor<BlockMigrationInterface> {
    const { schema, maxTextBlocks, resolvedOptions, link, textBlockMap, inlineStyleMap, listLevelMax } = options;
    const textBlocks = resolvedOptions.textBlocks;
    const emptyDoc = buildEmptyTipTapDoc(resolvedOptions);

    for (const [draftJsBlockType, { textBlock }] of Object.entries(textBlockMap ?? {})) {
        // A name that doesn't exist would convert the content to whichever text block shares the
        // DraftJS block's tag instead - silently, and only once, since the DraftJS content is gone afterwards.
        if (!textBlocks.some((configured) => configured.name === textBlock)) {
            throw new Error(`textBlockMap maps "${draftJsBlockType}" to the text block "${textBlock}", which is not configured`);
        }
    }

    return class DraftJsToTipTapMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        public readonly toVersion = 1;

        protected migrate(from: From): To {
            // No-op for data that does not look like DraftJS (e.g. already TipTap-shaped).
            if (!isDraftJsContent(from.draftContent)) {
                if (from.tipTapContent !== undefined) {
                    return { tipTapContent: from.tipTapContent };
                }
                return { tipTapContent: emptyDoc };
            }

            const converted = convertDraftJsToTipTap(from.draftContent, { resolvedOptions, link, textBlockMap, inlineStyleMap, listLevelMax });
            if (
                isValidTipTapContentSync(converted, schema, {
                    maxTextBlocks,
                    listLevelMax,
                    textBlocks,
                    defaultTextBlock: resolvedOptions.defaultTextBlock,
                    orderedList: resolvedOptions.orderedList,
                    unorderedList: resolvedOptions.unorderedList,
                })
            ) {
                return { tipTapContent: converted };
            }

            if (process.env.NODE_ENV === "development") {
                throw new Error(`DraftJS->TipTap migration produced invalid content that doesn't pass validation`);
            }

            const stripped = buildStrippedTipTapDoc(from.draftContent, resolvedOptions);
            if (
                isValidTipTapContentSync(stripped, schema, {
                    maxTextBlocks,
                    textBlocks,
                    defaultTextBlock: resolvedOptions.defaultTextBlock,
                    orderedList: resolvedOptions.orderedList,
                    unorderedList: resolvedOptions.unorderedList,
                })
            ) {
                console.warn("DraftJS->TipTap migration failed, using stripped content");
                return { tipTapContent: stripped };
            }

            console.warn("DraftJS->TipTap migration failed, lost content!");
            return { tipTapContent: emptyDoc };
        }
    };
}
