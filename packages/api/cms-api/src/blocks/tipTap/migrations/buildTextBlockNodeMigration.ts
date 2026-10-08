import type { JSONContent } from "@tiptap/core";
import type { ClassConstructor } from "class-transformer";

import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";
import type { TipTapResolvedOptions } from "../createTipTapRichTextBlock";
import { findTextBlockForTag, type TipTapResolvedTextBlock, type TipTapTextBlockTag } from "../textBlocks";

interface From {
    tipTapContent: JSONContent;
}

type To = From;

/**
 * The text block a stored `paragraph`/`heading` node becomes: the one it already names, or the
 * first one with its tag. Two text blocks could not share a tag before the `textBlocks` option
 * existed, so the tag identifies the text block for every node this migration converts.
 */
function resolveTextBlock({ node, resolvedOptions }: { node: JSONContent; resolvedOptions: TipTapResolvedOptions }): TipTapResolvedTextBlock {
    const { textBlocks, defaultTextBlock } = resolvedOptions;

    const name = node.attrs?.textBlock;
    const named = textBlocks.find((textBlock) => textBlock.name === name);
    if (named) {
        return named;
    }

    const level = node.attrs?.level;
    const tag: TipTapTextBlockTag = node.type === "heading" && level !== undefined ? (`h${level}` as TipTapTextBlockTag) : "p";
    return findTextBlockForTag({ tag, textBlocks }) ?? defaultTextBlock;
}

function convertNode(node: JSONContent, resolvedOptions: TipTapResolvedOptions): JSONContent {
    const content = node.content?.map((child) => convertNode(child, resolvedOptions));

    if (node.type !== "paragraph" && node.type !== "heading") {
        return content ? { ...node, content } : node;
    }

    const { level, textBlock, ...attrs } = node.attrs ?? {};
    const converted: JSONContent = {
        ...node,
        type: "textBlock",
        attrs: { ...attrs, textBlock: resolveTextBlock({ node, resolvedOptions }).name },
    };
    return content ? { ...converted, content } : converted;
}

/**
 * Converts the `paragraph` and `heading` nodes of content stored before every text block became one
 * `textBlock` node. Content that is already converted passes through unchanged, which it has to:
 * the DraftJS migration runs in the same chain and writes the current format, so a node this
 * migration sees may come from either format.
 */
export function buildTextBlockNodeMigration({
    resolvedOptions,
}: {
    resolvedOptions: TipTapResolvedOptions;
}): ClassConstructor<BlockMigrationInterface> {
    return class TextBlockNodeMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        public readonly toVersion = 2;

        protected migrate({ tipTapContent, ...rest }: From): To {
            return { ...rest, tipTapContent: convertNode(tipTapContent, resolvedOptions) };
        }
    };
}
