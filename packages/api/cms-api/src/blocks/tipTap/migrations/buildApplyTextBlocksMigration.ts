import type { JSONContent } from "@tiptap/core";
import type { ClassConstructor } from "class-transformer";

import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";
import { findTextBlock, getTextBlockTag, resolveTextBlocks, type TipTapTextBlock } from "../textBlocks";

interface From {
    tipTapContent: JSONContent;
}

type To = From;

function applyTextBlocks(node: JSONContent, textBlocks: ReturnType<typeof resolveTextBlocks>): JSONContent {
    let result = node;

    const tag = getTextBlockTag(node);
    if (tag !== undefined) {
        const textBlock = findTextBlock({ name: node.attrs?.textBlock, tag, textBlocks });
        if (textBlock && node.attrs?.textBlock !== textBlock.name) {
            result = { ...node, attrs: { ...node.attrs, textBlock: textBlock.name } };
        }
    }

    if (Array.isArray(result.content)) {
        result = { ...result, content: result.content.map((child) => applyTextBlocks(child, textBlocks)) };
    }

    return result;
}

/**
 * Builds a migration that writes the `textBlock` attribute onto every paragraph/heading node: the
 * text block the node already names, or - for content written before the name was stored, or after a
 * migration changed the node's tag - the first text block with a matching tag.
 *
 * Content without the attribute is resolved by its tag anyway, so this migration is only needed to
 * assign such content to a specific one of several text blocks sharing a tag. Place it after any
 * migration that changes a node's tag (e.g. one that bumps heading levels), since it resolves the
 * tag a node has at the point it runs.
 */
export function buildApplyTextBlocksMigration({
    toVersion,
    textBlocks,
}: {
    toVersion: number;
    textBlocks: TipTapTextBlock[];
}): ClassConstructor<BlockMigrationInterface> {
    const resolvedTextBlocks = resolveTextBlocks(textBlocks);

    return class ApplyTextBlocksMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        public readonly toVersion = toVersion;

        protected migrate(from: From): To {
            return { tipTapContent: applyTextBlocks(from.tipTapContent, resolvedTextBlocks) };
        }
    };
}
