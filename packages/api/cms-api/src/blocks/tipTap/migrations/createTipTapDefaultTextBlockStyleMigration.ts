import type { JSONContent } from "@tiptap/core";
import type { ClassConstructor } from "class-transformer";

import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";

interface From {
    tipTapContent: JSONContent;
}

type To = From;

interface DefaultTextBlockStyles {
    /**
     * Name of the text block a node naming none is: the block's `defaultTextBlock`, or its first text
     * block. Content written through the API may leave the name out.
     */
    defaultTextBlock?: string;
    /**
     * Maps a text block's `name` to the style a text block of that type without one gets.
     */
    textBlocks?: Record<string, string>;
    /**
     * Style a text block without one gets inside an item of an ordered list.
     */
    orderedList?: string;
    /**
     * Style a text block without one gets inside an item of an unordered list.
     */
    unorderedList?: string;
}

function applyDefaultStyles({
    node,
    defaultStyles,
    list,
}: {
    node: JSONContent;
    defaultStyles: DefaultTextBlockStyles;
    list?: "orderedList" | "bulletList";
}): JSONContent {
    const containingList = node.type === "orderedList" || node.type === "bulletList" ? node.type : list;

    let result = node;
    if (node.type === "textBlock" && node.attrs?.textBlockStyle == null) {
        // Inside a list item the list decides the style, like it does in the Admin, even where the
        // list has no default and the text block has one.
        const defaultStyle =
            containingList === "orderedList"
                ? defaultStyles.orderedList
                : containingList === "bulletList"
                  ? defaultStyles.unorderedList
                  : defaultStyles.textBlocks?.[node.attrs?.textBlock ?? defaultStyles.defaultTextBlock];
        if (defaultStyle !== undefined) {
            result = { ...node, attrs: { ...node.attrs, textBlockStyle: defaultStyle } };
        }
    }

    if (Array.isArray(result.content)) {
        result = { ...result, content: result.content.map((child) => applyDefaultStyles({ node: child, defaultStyles, list: containingList })) };
    }
    return result;
}

/**
 * Creates a block migration that gives every text block without a style the default style of its
 * text block or, inside a list item, of its list.
 *
 * The Admin applies a text block's `defaultStyle` to content it creates, but content written before
 * the `defaultStyle` was configured carries no style. Add this migration to the block's own
 * migrations whenever a `defaultStyle` is added, so the site never has to handle a missing style.
 *
 * The styles are passed here rather than read from the block's configuration, so the migration keeps
 * applying the defaults of its version when they change later.
 *
 * @experimental
 */
export function createTipTapDefaultTextBlockStyleMigration({
    toVersion,
    ...defaultStyles
}: DefaultTextBlockStyles & { toVersion: number }): ClassConstructor<BlockMigrationInterface> {
    return class TipTapDefaultTextBlockStyleMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        public readonly toVersion = toVersion;

        protected migrate({ tipTapContent, ...rest }: From): To {
            return { ...rest, tipTapContent: applyDefaultStyles({ node: tipTapContent, defaultStyles }) };
        }
    };
}
