import type { Block } from "../block";
import type { BlockFactoryNameOrOptions } from "../factories/types";
import {
    createTipTapBlock,
    type CreateTipTapRichTextBlockOptions,
    type TipTapRichTextBlockDataInterface,
    type TipTapRichTextBlockInputInterface,
    type TipTapSupports,
} from "./createTipTapRichTextBlock";

export type TipTapTableBlockDataInterface = TipTapRichTextBlockDataInterface;

export type TipTapTableBlockInputInterface = TipTapRichTextBlockInputInterface;

/**
 * `maxTextBlocks` and `migrateFromDraftJs` are omitted because the document holds exactly one
 * table: there are no top-level text blocks to limit, and DraftJS has no table equivalent to
 * migrate from.
 */
export type CreateTipTapTableBlockOptions = Omit<CreateTipTapRichTextBlockOptions, "maxTextBlocks" | "migrateFromDraftJs">;

/**
 * Headings are left out on purpose: a table's header row already carries the emphasis a heading
 * would, so allowing them inside cells only produces inconsistent markup.
 */
const defaultSupports: TipTapSupports[] = [
    "bold",
    "italic",
    "strike",
    "sub",
    "sup",
    "ordered-list",
    "unordered-list",
    "non-breaking-space",
    "soft-hyphen",
];

/**
 * A TipTap block whose document consists of exactly one table.
 *
 * The document's content expression pins the table in place, so validation rejects any content
 * that isn't a single table -- rows and columns can be added and removed, the table itself cannot
 * be deleted.
 *
 * @experimental
 */
export function createTipTapTableBlock(
    { supports = defaultSupports, ...options }: CreateTipTapTableBlockOptions = {},
    nameOrOptions: BlockFactoryNameOrOptions = "TipTapTable",
): Block<TipTapTableBlockDataInterface, TipTapTableBlockInputInterface> {
    return createTipTapBlock(
        {
            ...options,
            supports: supports.includes("table") ? supports : [...supports, "table"],
            singleTableDocument: true,
        },
        nameOrOptions,
    );
}
