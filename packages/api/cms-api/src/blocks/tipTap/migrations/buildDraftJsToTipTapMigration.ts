import type { JSONContent } from "@tiptap/core";
import type { Schema } from "@tiptap/pm/model";
import type { ClassConstructor } from "class-transformer";

import type { Block } from "../../block";
import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";
import { isValidTipTapContentSync } from "../tipTapValidation";
import { buildStrippedTipTapDoc, convertDraftJsToTipTap, type ConvertOptions, type DraftJsContent } from "./convertDraftJsToTipTap";

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
    headingLevels?: number[];
    link?: Block;
}

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

export function buildDraftJsToTipTapMigration(options: BuildOptions): ClassConstructor<BlockMigrationInterface> {
    const { schema, maxTextBlocks, headingLevels, supports, link, textBlockStyleMap, inlineStyleMap, listLevelMax } = options;

    return class DraftJsToTipTapMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        public readonly toVersion = 1;

        protected migrate(from: From): To {
            // No-op for data that does not look like DraftJS (e.g. already TipTap-shaped).
            if (!isDraftJsContent(from.draftContent)) {
                if (from.tipTapContent !== undefined) {
                    return { tipTapContent: from.tipTapContent };
                }
                return { tipTapContent: EMPTY_DOC };
            }

            const converted = convertDraftJsToTipTap(from.draftContent, { supports, link, textBlockStyleMap, inlineStyleMap, listLevelMax });
            if (isValidTipTapContentSync(converted, schema, { maxTextBlocks, listLevelMax, headingLevels })) {
                return { tipTapContent: converted };
            }

            if (process.env.NODE_ENV === "development") {
                throw new Error(`DraftJS->TipTap migration produced invalid content that doesn't pass validation`);
            }

            const stripped = buildStrippedTipTapDoc(from.draftContent);
            if (isValidTipTapContentSync(stripped, schema, { maxTextBlocks })) {
                console.warn("DraftJS->TipTap migration failed, using stripped content");
                return { tipTapContent: stripped };
            }

            console.warn("DraftJS->TipTap migration failed, lost content!");
            return { tipTapContent: EMPTY_DOC };
        }
    };
}
