import type { JSONContent } from "@tiptap/core";
import type { ClassConstructor } from "class-transformer";

import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";
import {
    applyTextBlocks,
    orderedListName,
    resolveList,
    resolveTextBlocks,
    type TipTapListOptions,
    type TipTapTextBlock,
    unorderedListName,
} from "../textBlocks";

interface From {
    tipTapContent: JSONContent;
}

type To = From;

/**
 * Builds a migration that writes the `textBlock` attribute onto every paragraph/heading node - the
 * text block the node already names, or, for content written before the name was stored or after a
 * migration changed the node's tag, the first text block with a matching tag - and replaces a
 * `textBlockStyle` that text block (or the list the node sits in) doesn't offer with its
 * `defaultStyle`.
 *
 * The API resolves all of that when it reads the content anyway, so this migration is only needed
 * before a second text block starts sharing a tag and takes the content over. Place it after any
 * migration that changes a node's tag (e.g. one that bumps heading levels), since it resolves the
 * tag a node has at the point it runs.
 */
export function buildApplyTextBlocksMigration({
    toVersion,
    textBlocks,
    orderedList,
    unorderedList,
}: {
    toVersion: number;
    textBlocks: TipTapTextBlock[];
    orderedList?: boolean | TipTapListOptions;
    unorderedList?: boolean | TipTapListOptions;
}): ClassConstructor<BlockMigrationInterface> {
    const config = {
        textBlocks: resolveTextBlocks(textBlocks),
        orderedList: resolveList({ list: orderedList, name: orderedListName, tag: "ol" }),
        unorderedList: resolveList({ list: unorderedList, name: unorderedListName, tag: "ul" }),
    };

    return class ApplyTextBlocksMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        public readonly toVersion = toVersion;

        protected migrate(from: From): To {
            return { tipTapContent: applyTextBlocks(from.tipTapContent, config) };
        }
    };
}
