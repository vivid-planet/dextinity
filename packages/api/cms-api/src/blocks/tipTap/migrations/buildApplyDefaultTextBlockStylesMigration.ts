import type { JSONContent } from "@tiptap/core";
import type { ClassConstructor } from "class-transformer";

import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";

type TipTapTextBlockStyleTargetType = "paragraph" | "heading-1" | "heading-2" | "heading-3" | "heading-4" | "heading-5" | "heading-6";

interface From {
    tipTapContent: JSONContent;
}

type To = From;

function getTextBlockTypeFromNode(node: JSONContent): TipTapTextBlockStyleTargetType | undefined {
    if (node.type === "paragraph") {
        return "paragraph";
    }
    if (node.type === "heading" && node.attrs?.level) {
        return `heading-${node.attrs.level}` as TipTapTextBlockStyleTargetType;
    }
    return undefined;
}

function applyDefaultTextBlockStyles(
    node: JSONContent,
    defaultTextBlockStyles: Partial<Record<TipTapTextBlockStyleTargetType, string>>,
): JSONContent {
    const textBlockType = getTextBlockTypeFromNode(node);
    const defaultStyle = textBlockType ? defaultTextBlockStyles[textBlockType] : undefined;

    let result = node;
    if (defaultStyle !== undefined && !node.attrs?.textBlockStyle) {
        result = { ...node, attrs: { ...node.attrs, textBlockStyle: defaultStyle } };
    }
    if (Array.isArray(result.content)) {
        result = { ...result, content: result.content.map((child) => applyDefaultTextBlockStyles(child, defaultTextBlockStyles)) };
    }
    return result;
}

/**
 * Builds a migration that runs after every other migration (`migrateFromDraftJs`'s conversion step and any
 * block-specific migrations), so it's the safety net for `defaultTextBlockStyles`: earlier migrations resolve
 * the default against the tag/level a node has *at that point*, but a later migration can still change a node's
 * tag or heading level without knowing about `defaultTextBlockStyles` (see e.g. a migration that bumps every
 * heading level by one). This step re-checks the final content and fills in any still-missing default.
 */
export function buildApplyDefaultTextBlockStylesMigration({
    toVersion,
    defaultTextBlockStyles,
}: {
    toVersion: number;
    defaultTextBlockStyles: Partial<Record<TipTapTextBlockStyleTargetType, string>>;
}): ClassConstructor<BlockMigrationInterface> {
    return class ApplyDefaultTextBlockStylesMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        public readonly toVersion = toVersion;

        protected migrate(from: From): To {
            return { tipTapContent: applyDefaultTextBlockStyles(from.tipTapContent, defaultTextBlockStyles) };
        }
    };
}
