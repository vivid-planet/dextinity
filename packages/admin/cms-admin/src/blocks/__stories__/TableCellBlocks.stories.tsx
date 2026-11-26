import { NumberField } from "@dextinity/admin";
import { Box } from "@mui/material";
// eslint-disable-next-line no-restricted-imports
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { type PropsWithChildren, useState } from "react";
import { FormattedNumber } from "react-intl";
import { expect, screen } from "storybook/test";

import { DextinityConfigProvider, useDextinityConfig } from "../../config/DextinityConfigContext";
import { DamImageBlock } from "../../dam/blocks/DamImageBlock";
import { createTableBlock } from "../createTableBlock";
import { BlocksFinalForm } from "../form/BlocksFinalForm";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { createTipTapRichTextBlock } from "../tipTap/createTipTapRichTextBlock";
import type { BlockInterface, BlockState, ReadOnlyBlockRenderInterface } from "../types";

const TextCellBlock = { ...createTipTapRichTextBlock(), displayName: "Text" };

type TextCellState = BlockState<typeof TextCellBlock>;

type PriceCellState = { amount?: number };

const PriceCellBlock: BlockInterface<PriceCellState, PriceCellState, PriceCellState> & ReadOnlyBlockRenderInterface<PriceCellState> = {
    ...createBlockSkeleton(),
    name: "PriceCell",
    displayName: "Price",
    defaultValues: () => ({}),
    AdminComponent: ({ state, updateState }) => (
        <Box sx={{ padding: 2 }}>
            <BlocksFinalForm<PriceCellState> onSubmit={updateState} initialValues={state}>
                <NumberField name="amount" label="Amount" decimals={2} fullWidth />
            </BlocksFinalForm>
        </Box>
    ),
    ReadOnlyComponent: ({ state }) => (state.amount == null ? null : <FormattedNumber value={state.amount} style="currency" currency="EUR" />),
};

const getPlainText = (content: TextCellState["tipTapContent"]): string => content.text ?? (content.content ?? []).map(getPlainText).join(" ");

const createTextCellState = (text: string): TextCellState => ({
    tipTapContent: { type: "doc", content: [{ type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "text", text }] }] },
});

const TableBlock = createTableBlock({
    cellBlocks: { text: TextCellBlock, price: PriceCellBlock, image: DamImageBlock },
    convertCell: {
        text: {
            price: ({ tipTapContent }) => {
                const plainText = getPlainText(tipTapContent).trim();
                return /^-?\d+(\.\d+)?$/.test(plainText) ? { amount: Number(plainText) } : null;
            },
        },
        price: {
            text: ({ amount }) => (amount == null ? null : createTextCellState(String(amount))),
        },
    },
});

const createImageCellInput = (name: string) => ({
    attachedBlocks: [
        {
            type: "image",
            props: {
                attachedBlocks: [
                    {
                        type: "pixelImage",
                        props: {
                            damFile: {
                                id: `${name}-id`,
                                name: `${name}.jpg`,
                                altText: name,
                                size: 120000,
                                mimetype: "image/jpeg",
                                contentHash: name,
                                archived: false,
                                image: { width: 800, height: 600, cropArea: { focalPoint: "SMART" } },
                                fileUrl: `/dam/files/${name}.jpg`,
                            },
                        },
                    },
                ],
                activeType: "pixelImage",
            },
        },
    ],
    activeType: "image",
});

const createTextCellInput = (text: string) => ({ attachedBlocks: [{ type: "text", props: createTextCellState(text) }], activeType: "text" });

const products = TableBlock.input2State({
    columns: [
        { id: "photo", settings: { size: "small", highlighted: false } },
        { id: "product", settings: { size: "standard", highlighted: false } },
        { id: "price", settings: { size: "standard", highlighted: false } },
    ],
    rows: [
        {
            id: "espresso-machine",
            cellValues: [
                { columnId: "photo", value: createImageCellInput("Espresso machine") },
                { columnId: "product", value: createTextCellInput("Espresso machine") },
                { columnId: "price", value: { attachedBlocks: [{ type: "price", props: { amount: 1299 } }], activeType: "price" } },
            ],
        },
        {
            id: "coffee-grinder",
            cellValues: [
                { columnId: "photo", value: createImageCellInput("Coffee grinder") },
                { columnId: "product", value: createTextCellInput("Coffee grinder") },
                {
                    columnId: "price",
                    value: {
                        attachedBlocks: [
                            { type: "price", props: { amount: 349 } },
                            { type: "text", props: createTextCellState("On request") },
                        ],
                        activeType: "text",
                    },
                },
            ],
        },
        {
            id: "milk-frother",
            cellValues: [
                { columnId: "photo", value: createImageCellInput("Milk frother") },
                { columnId: "product", value: createTextCellInput("Milk frother") },
                { columnId: "price", value: createTextCellInput("89") },
            ],
        },
    ],
});

function TableCellBlocksStory() {
    const [state, setState] = useState(products);

    return <TableBlock.AdminComponent state={state} updateState={setState} />;
}

function AbsoluteApiUrl({ children }: PropsWithChildren) {
    const config = useDextinityConfig();

    // The image blocks build the DAM preview URL with `new URL()`, which needs an absolute API URL
    return (
        <DextinityConfigProvider {...config} apiUrl={window.location.origin}>
            {children}
        </DextinityConfigProvider>
    );
}

const withAbsoluteApiUrl: Decorator = (Story) => (
    <AbsoluteApiUrl>
        <Story />
    </AbsoluteApiUrl>
);

const config: Meta<typeof TableCellBlocksStory> = {
    component: TableCellBlocksStory,
    title: "Debug/blocks/TableBlock/Cell blocks",
    tags: ["!autodocs"],
    decorators: [withAbsoluteApiUrl],
    parameters: {
        dataGrid: { component: DataGridPro },
    },
};

export default config;

type Story = StoryObj<typeof config>;

/**
 * A table whose cells can contain text, a price or an image. Double-click a cell to change its type in the cell editor:
 *
 * - The price "On request" of the coffee grinder isn't a number, so switching it to "Price" restores the price it had before.
 * - The price "89" of the milk frother is converted to a price when switching it to "Price".
 * - A price is converted to text when switching it to "Text".
 *
 * The images are placeholders served by a mock of the DAM.
 */
export const ImageCellShowsItsImage: Story = {
    play: async () => {
        expect(await screen.findByRole("img", { name: "Espresso machine" }, { timeout: 5000 })).toBeInTheDocument();
    },
};
