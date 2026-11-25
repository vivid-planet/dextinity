// eslint-disable-next-line no-restricted-imports
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { createTableBlock } from "../createTableBlock";
import { createTableSettings } from "../table/createTableSettings";
import { createTipTapRichTextBlock } from "../tipTap/createTipTapRichTextBlock";
import type { BlockInputApi } from "../types";

const RichTextBlock = createTipTapRichTextBlock();

const columnSettings = createTableSettings({
    hiddenBelow: {
        type: "select",
        label: "Hidden below",
        options: [
            { value: "never", label: "Never" },
            { value: "tablet", label: "Tablet" },
            { value: "desktop", label: "Desktop" },
        ],
        defaultValue: "never",
    },
});

const rowSettings = createTableSettings({
    soldOut: { type: "checkbox", label: "Sold out", defaultValue: false },
    badges: {
        type: "multiSelect",
        label: "Badges",
        options: [
            { value: "new", label: "New" },
            { value: "sale", label: "Sale" },
        ],
        defaultValue: [],
    },
});

const TableBlock = createTableBlock({
    richText: RichTextBlock,
    columnSettings,
    rowSettings,
    getCellStyle: ({ rowSettings }) => ({ opacity: rowSettings.soldOut ? 0.5 : undefined }),
});

const createCellInput = (text: string): BlockInputApi<typeof RichTextBlock> => ({
    tipTapContent: {
        type: "doc",
        content: [{ type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "text", text }] }],
    },
});

const products = TableBlock.input2State({
    columns: [
        { id: "product", size: "standard", highlighted: false, settings: { hiddenBelow: "never" } },
        { id: "price", size: "standard", highlighted: false, settings: { hiddenBelow: "never" } },
        { id: "description", size: "large", highlighted: false, settings: { hiddenBelow: "tablet" } },
    ],
    rows: [
        {
            id: "espresso-machine",
            highlighted: false,
            settings: { soldOut: false, badges: ["new"] },
            cellValues: [
                { columnId: "product", value: createCellInput("Espresso machine") },
                { columnId: "price", value: createCellInput("1,299 €") },
                { columnId: "description", value: createCellInput("Dual boiler with a PID controller") },
            ],
        },
        {
            id: "coffee-grinder",
            highlighted: false,
            settings: { soldOut: true, badges: [] },
            cellValues: [
                { columnId: "product", value: createCellInput("Coffee grinder") },
                { columnId: "price", value: createCellInput("349 €") },
                { columnId: "description", value: createCellInput("Conical burrs, 40 grind settings") },
            ],
        },
    ],
});

function TableSettingsStory() {
    const [state, setState] = useState(products);

    return <TableBlock.AdminComponent state={state} updateState={setState} />;
}

const config: Meta<typeof TableSettingsStory> = {
    component: TableSettingsStory,
    title: "Debug/blocks/TableBlock/Row and column settings",
    tags: ["!autodocs"],
    parameters: {
        dataGrid: { component: DataGridPro },
    },
};

export default config;

type Story = StoryObj<typeof config>;

/**
 * Change the settings in the menus of the column headers and rows:
 *
 * - The row setting "Sold out" (checkbox) dims the cells of the row with `getCellStyle`.
 * - The column setting "Hidden below" (select) and the row setting "Badges" (multi-select) only change the state, like settings that only the site uses.
 */
export const RowAndColumnSettings: Story = {};
