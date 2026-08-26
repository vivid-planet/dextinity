import type { JSONContent } from "@tiptap/react";
import { FormattedMessage } from "react-intl";

import {
    createTipTapBlock,
    type TipTapRichTextBlockFactoryOptions,
    type TipTapRichTextBlockInterface,
    type TipTapSupports,
} from "./createTipTapRichTextBlock";

/**
 * Headings are left out on purpose: a table's header row already carries the emphasis a heading
 * would, so allowing them inside cells only produces inconsistent markup.
 */
const defaultSupports: TipTapSupports[] = [
    "history",
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
 * `maxTextBlocks` is omitted because the document holds exactly one table, so there are no
 * top-level text blocks to limit.
 */
export interface TipTapTableBlockFactoryOptions extends Omit<TipTapRichTextBlockFactoryOptions, "maxTextBlocks"> {
    name?: string;
    /**
     * Number of rows the initial table has, including the header row. Defaults to 3.
     */
    defaultRows?: number;
    /**
     * Number of columns the initial table has. Defaults to 3.
     */
    defaultColumns?: number;
    /**
     * Whether the initial table starts with a header row. Defaults to true. The header row can be
     * toggled from the toolbar regardless of this setting.
     */
    headerRow?: boolean;
}

const createTableContent = ({ rows, columns, headerRow }: { rows: number; columns: number; headerRow: boolean }): JSONContent => ({
    type: "doc",
    content: [
        {
            type: "table",
            content: Array.from({ length: rows }, (_, rowIndex) => ({
                type: "tableRow",
                content: Array.from({ length: columns }, () => ({
                    type: headerRow && rowIndex === 0 ? "tableHeader" : "tableCell",
                    content: [{ type: "paragraph" }],
                })),
            })),
        },
    ],
});

/**
 * A TipTap block whose document consists of exactly one table.
 *
 * Rows and columns can be added and removed from the toolbar, but the table itself cannot be
 * deleted: it is the document's only allowed child, so ProseMirror rejects every transaction that
 * would remove it.
 *
 * @experimental
 */
export const createTipTapTableBlock = (options?: TipTapTableBlockFactoryOptions): TipTapRichTextBlockInterface => {
    const rows = options?.defaultRows ?? 3;
    const columns = options?.defaultColumns ?? 3;
    const headerRow = options?.headerRow ?? true;

    if (!Number.isInteger(rows) || rows < 1 || !Number.isInteger(columns) || columns < 1) {
        throw new Error("defaultRows and defaultColumns must be integers greater than 0");
    }

    const supports = options?.supports ?? defaultSupports;

    const block = createTipTapBlock({
        ...options,
        // Drives both the table extensions and the toolbar's table menu, so it is never optional here.
        supports: supports.includes("table") ? supports : [...supports, "table"],
        singleTableDocument: true,
    });

    // Built per call so no two block states share a document.
    const createDefaultContent = () => createTableContent({ rows, columns, headerRow });

    return {
        ...block,

        name: options?.name ?? "TipTapTable",

        displayName: <FormattedMessage id="dextinity.blocks.tipTapTable" defaultMessage="Table (TipTap)" />,

        defaultValues: () => ({ tipTapContent: createDefaultContent() }),

        // The document is a single table, so the rich text block's empty-paragraph fallback would
        // be invalid here: fall back to a fresh table instead.
        input2State: (input) => block.input2State({ ...input, tipTapContent: input.tipTapContent ?? createDefaultContent() }),

        output2State: (output, context) => block.output2State({ ...output, tipTapContent: output.tipTapContent ?? createDefaultContent() }, context),

        previewContent: (state) => {
            const table = state.tipTapContent.content?.find((node) => node.type === "table");
            const rowCount = table?.content?.length ?? 0;
            const columnCount = table?.content?.[0]?.content?.reduce((total, cell) => total + ((cell.attrs?.colspan as number) ?? 1), 0) ?? 0;
            return [{ type: "text", content: `${rowCount} × ${columnCount}` }];
        },
    };
};
