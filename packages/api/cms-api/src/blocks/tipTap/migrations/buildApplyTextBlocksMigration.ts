import type { JSONContent } from "@tiptap/core";
import type { ClassConstructor } from "class-transformer";

import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";
import type { TipTapTextBlock, TipTapTextBlockTag } from "../createTipTapRichTextBlock";

interface From {
    tipTapContent: JSONContent;
}

type To = From;

function getTagFromNode(node: JSONContent): TipTapTextBlockTag | undefined {
    if (node.type === "paragraph") {
        return "paragraph";
    }
    if (node.type === "heading" && node.attrs?.level) {
        return `heading-${node.attrs.level}` as TipTapTextBlockTag;
    }
    return undefined;
}

// A later migration (e.g. one that changes a node's heading level) can leave a node's
// `textBlockName` pointing at an entry that no longer matches its tag, or missing it entirely, since
// earlier steps only resolve it against the tag a node has *at that point*. Falls back to the first
// `textBlocks` entry with the node's current tag.
function resolveTextBlock(node: JSONContent, tag: TipTapTextBlockTag, textBlocks: TipTapTextBlock[]): TipTapTextBlock | undefined {
    const currentName = node.attrs?.textBlockName as string | undefined;
    const current = currentName ? textBlocks.find((b) => b.name === currentName) : undefined;
    if (current && current.tag === tag) {
        return current;
    }
    return textBlocks.find((b) => b.tag === tag);
}

function applyTextBlocks(node: JSONContent, textBlocks: TipTapTextBlock[], listStyles: string[], insideListItem: boolean): JSONContent {
    let result = node;
    const tag = getTagFromNode(node);
    if (tag) {
        const resolved = resolveTextBlock(node, tag, textBlocks);
        if (resolved) {
            const attrs = { ...node.attrs };
            let changed = false;

            if (attrs.textBlockName !== resolved.name) {
                attrs.textBlockName = resolved.name;
                changed = true;
            }

            // A list item's paragraph draws its style from `listStyles`, not the resolved entry's own
            // `styles`/`defaultStyle` — a list isn't a `textBlocks` entry of its own.
            const currentStyle = attrs.textBlockStyle as string | undefined;
            if (insideListItem && tag === "paragraph") {
                const styleStillValid = currentStyle != null && listStyles.includes(currentStyle);
                if (!styleStillValid && attrs.textBlockStyle !== null) {
                    attrs.textBlockStyle = null;
                    changed = true;
                }
            } else {
                const styleStillValid = currentStyle != null && (resolved.styles ?? []).includes(currentStyle);
                if (!styleStillValid) {
                    const newStyle = resolved.defaultStyle ?? null;
                    if (attrs.textBlockStyle !== newStyle) {
                        attrs.textBlockStyle = newStyle;
                        changed = true;
                    }
                }
            }

            if (changed) {
                result = { ...node, attrs };
            }
        }
    }
    if (Array.isArray(result.content)) {
        const isListItem = result.type === "listItem";
        result = {
            ...result,
            content: result.content.map((child) => applyTextBlocks(child, textBlocks, listStyles, insideListItem || isListItem)),
        };
    }
    return result;
}

/**
 * Builds a migration that runs after every other migration (`migrateFromDraftJs`'s conversion step and
 * any block-specific migrations), so it's the safety net that guarantees every paragraph/heading node
 * ends up with a valid `textBlockName` (and a `textBlockStyle` that's still one of that entry's
 * `styles`): earlier migrations resolve `textBlocks` against the tag/level a node has *at that point*,
 * but a later migration can still change a node's tag without knowing about `textBlocks` (see e.g. a
 * migration that bumps every heading level by one).
 */
export function buildApplyTextBlocksMigration({
    toVersion,
    textBlocks,
    listStyles = [],
}: {
    toVersion: number;
    textBlocks: TipTapTextBlock[];
    listStyles?: string[];
}): ClassConstructor<BlockMigrationInterface> {
    return class ApplyTextBlocksMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        public readonly toVersion = toVersion;

        protected migrate(from: From): To {
            return { tipTapContent: applyTextBlocks(from.tipTapContent, textBlocks, listStyles, false) };
        }
    };
}
