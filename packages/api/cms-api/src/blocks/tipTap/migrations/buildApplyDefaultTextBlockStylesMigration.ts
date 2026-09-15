import type { JSONContent } from "@tiptap/core";
import type { ClassConstructor } from "class-transformer";

import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";

type TipTapTextBlockStyleTargetType = "paragraph" | "heading-1" | "heading-2" | "heading-3" | "heading-4" | "heading-5" | "heading-6";

interface TipTapTextBlockStyle {
    name: string;
    appliesTo?: string[];
}

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

// A node can carry a `textBlockStyle` that a later migration made invalid for its current tag (e.g. a
// heading bumped from level 1 to level 2 keeps a style whose `appliesTo` only lists `heading-1`), not
// just a missing one, so this checks appliesTo, not just presence, before falling back to the default.
function isTextBlockStyleValidForTag(
    styleName: string | undefined,
    textBlockType: TipTapTextBlockStyleTargetType,
    textBlockStyles: TipTapTextBlockStyle[],
): boolean {
    if (styleName === undefined) {
        return false;
    }
    const style = textBlockStyles.find((s) => s.name === styleName);
    return style !== undefined && (!style.appliesTo || style.appliesTo.includes(textBlockType));
}

function applyDefaultTextBlockStyles(
    node: JSONContent,
    defaultTextBlockStyles: Partial<Record<TipTapTextBlockStyleTargetType, string>>,
    textBlockStyles: TipTapTextBlockStyle[],
): JSONContent {
    const textBlockType = getTextBlockTypeFromNode(node);
    const defaultStyle = textBlockType ? defaultTextBlockStyles[textBlockType] : undefined;

    let result = node;
    if (textBlockType && defaultStyle !== undefined && !isTextBlockStyleValidForTag(node.attrs?.textBlockStyle, textBlockType, textBlockStyles)) {
        result = { ...node, attrs: { ...node.attrs, textBlockStyle: defaultStyle } };
    }
    if (Array.isArray(result.content)) {
        result = { ...result, content: result.content.map((child) => applyDefaultTextBlockStyles(child, defaultTextBlockStyles, textBlockStyles)) };
    }
    return result;
}

/**
 * Builds a migration that runs after every other migration (`migrateFromDraftJs`'s conversion step and any
 * block-specific migrations), so it's the safety net for `defaultTextBlockStyles`: earlier migrations resolve
 * the default against the tag/level a node has *at that point*, but a later migration can still change a node's
 * tag or heading level without knowing about `defaultTextBlockStyles` (see e.g. a migration that bumps every
 * heading level by one). This step re-checks the final content and fills in any still-missing default, or
 * swaps in the default for a style that no longer applies to the node's final tag.
 */
export function buildApplyDefaultTextBlockStylesMigration({
    toVersion,
    defaultTextBlockStyles,
    textBlockStyles,
}: {
    toVersion: number;
    defaultTextBlockStyles: Partial<Record<TipTapTextBlockStyleTargetType, string>>;
    textBlockStyles: TipTapTextBlockStyle[];
}): ClassConstructor<BlockMigrationInterface> {
    return class ApplyDefaultTextBlockStylesMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        public readonly toVersion = toVersion;

        protected migrate(from: From): To {
            return { tipTapContent: applyDefaultTextBlockStyles(from.tipTapContent, defaultTextBlockStyles, textBlockStyles) };
        }
    };
}
