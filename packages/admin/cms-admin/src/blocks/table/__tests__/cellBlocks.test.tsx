import { RouterMemoryRouter } from "@dextinity/admin";
import { useState } from "react";
import { cleanup, fireEvent, render, waitFor } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import type { BlockContext } from "../../context/BlockContext";
import { createTableBlock } from "../../createTableBlock";
import { createCompositeBlock } from "../../factories/createCompositeBlock";
import type { OneOfBlockState } from "../../factories/createOneOfBlock";
import { createBlockSkeleton } from "../../helpers/createBlockSkeleton";
import type { BlockInterface, BlockPreviewContext, ReadOnlyBlockRenderInterface } from "../../types";
import { CellValue } from "../CellValue";
import { createTableCellBlock, type TableCellBlockInterface, type TableCellConversions } from "../createTableCellBlock";
import { TableBlockContextProvider } from "../TableBlockContext";
import { parseCellHash } from "../utils/cellRoute";

type TextCellState = { text: string };

const TextCellBlock: BlockInterface & ReadOnlyBlockRenderInterface<TextCellState> = {
    ...createBlockSkeleton(),
    name: "TextCell",
    displayName: "Text",
    defaultValues: () => ({ text: "" }),
    AdminComponent: ({ state, updateState }) => (
        <input aria-label="Text content" value={state.text} onChange={(event) => updateState({ text: event.target.value })} />
    ),
    ReadOnlyComponent: ({ state }) => <span>{state.text}</span>,
};

type NumberCellState = { amount: number };

const NumberCellBlock: BlockInterface & ReadOnlyBlockRenderInterface<NumberCellState> = {
    ...createBlockSkeleton(),
    name: "NumberCell",
    displayName: "Number",
    defaultValues: () => ({ amount: 0 }),
    AdminComponent: ({ state, updateState }) => (
        <input aria-label="Amount" type="number" value={state.amount} onChange={(event) => updateState({ amount: Number(event.target.value) })} />
    ),
    ReadOnlyComponent: ({ state }) => <span>{state.amount}</span>,
};

const CompositeCellBlock: TableCellBlockInterface = {
    ...createCompositeBlock({ name: "CompositeCell", displayName: "Composite", groups: { content: { blocks: { text: { block: TextCellBlock } } } } }),
    ReadOnlyComponent: () => null,
};

const createTableState = (cellValue: OneOfBlockState) => ({
    columns: [{ id: "column", settings: {} }],
    rows: [{ id: "row", settings: {}, cellValues: [{ columnId: "column", value: cellValue }] }],
});

const renderCellEditor = (
    cellBlocks: Record<string, TableCellBlockInterface>,
    initialState?: OneOfBlockState,
    convertCell?: TableCellConversions<Record<string, TableCellBlockInterface>>,
) => {
    const CellBlock = createTableCellBlock({ name: "TestTableCell", cellBlocks, convertCell });
    let latestState: OneOfBlockState = initialState ?? CellBlock.defaultValues();

    const CellEditor = () => {
        const [state, setState] = useState(latestState);
        latestState = state;
        return <CellBlock.AdminComponent state={state} updateState={setState} />;
    };

    const rendered = render(
        <RouterMemoryRouter>
            <CellEditor />
        </RouterMemoryRouter>,
    );

    return { rendered, getState: () => latestState };
};

const selectType = async (rendered: ReturnType<typeof render>, typeLabel: string) => {
    fireEvent.mouseDown(rendered.getByRole("combobox"));
    fireEvent.click(await rendered.findByRole("option", { name: typeLabel }));
};

describe("cell blocks", () => {
    afterEach(cleanup);

    it("starts new cells with the first cell block", () => {
        const TableBlock = createTableBlock({ cellBlocks: { number: NumberCellBlock, text: TextCellBlock } });

        const cellValues = TableBlock.defaultValues().rows.flatMap((row) => row.cellValues.map((cellValue) => cellValue.value));

        expect(cellValues).not.toHaveLength(0);
        for (const cellValue of cellValues) {
            expect(cellValue).toEqual({ attachedBlocks: [{ type: "number", props: { amount: 0 } }], activeType: "number" });
        }
    });

    it("shows no type select with a single cell block", () => {
        const { rendered } = renderCellEditor({ text: TextCellBlock });

        expect(rendered.queryByRole("combobox")).toBeNull();
        expect(rendered.getByLabelText("Text content")).toBeTruthy();
    });

    it("starts a cell with the default values when switching to a type for the first time", async () => {
        const { rendered, getState } = renderCellEditor({ text: TextCellBlock, number: NumberCellBlock });

        fireEvent.change(rendered.getByLabelText("Text content"), { target: { value: "Content" } });
        await selectType(rendered, "Number");

        expect(await rendered.findByLabelText("Amount")).toHaveProperty("value", "0");
        await waitFor(() => {
            expect(getState()).toEqual({
                attachedBlocks: [
                    { type: "text", props: { text: "Content" } },
                    { type: "number", props: { amount: 0 } },
                ],
                activeType: "number",
            });
        });
    });

    it("restores the content a cell had in a type when switching back to it", async () => {
        const { rendered, getState } = renderCellEditor(
            { text: TextCellBlock, number: NumberCellBlock },
            {
                attachedBlocks: [
                    { type: "text", props: { text: "Content" } },
                    { type: "number", props: { amount: 42 } },
                ],
                activeType: "number",
            },
        );

        await selectType(rendered, "Text");

        expect(await rendered.findByLabelText("Text content")).toHaveProperty("value", "Content");
        await waitFor(() => {
            expect(getState()).toEqual({
                attachedBlocks: [
                    { type: "text", props: { text: "Content" } },
                    { type: "number", props: { amount: 42 } },
                ],
                activeType: "text",
            });
        });
    });

    describe("with a conversion", () => {
        const convertCell: TableCellConversions<{ text: typeof TextCellBlock; number: typeof NumberCellBlock }> = {
            text: {
                number: ({ text }: TextCellState) => {
                    const amount = Number(text);
                    return Number.isNaN(amount) ? null : { amount };
                },
            },
        };

        it("converts the content instead of restoring the content the cell had in the new type", async () => {
            const { rendered, getState } = renderCellEditor(
                { text: TextCellBlock, number: NumberCellBlock },
                {
                    attachedBlocks: [
                        { type: "text", props: { text: "42" } },
                        { type: "number", props: { amount: 7 } },
                    ],
                    activeType: "text",
                },
                convertCell,
            );

            await selectType(rendered, "Number");

            expect(await rendered.findByLabelText("Amount")).toHaveProperty("value", "42");
            await waitFor(() => {
                expect(getState()).toEqual({
                    attachedBlocks: [
                        { type: "text", props: { text: "42" } },
                        { type: "number", props: { amount: 42 } },
                    ],
                    activeType: "number",
                });
            });
        });

        it("restores the content the cell had in the new type when the conversion returns null", async () => {
            const { rendered, getState } = renderCellEditor(
                { text: TextCellBlock, number: NumberCellBlock },
                {
                    attachedBlocks: [
                        { type: "text", props: { text: "Content" } },
                        { type: "number", props: { amount: 7 } },
                    ],
                    activeType: "text",
                },
                convertCell,
            );

            await selectType(rendered, "Number");

            expect(await rendered.findByLabelText("Amount")).toHaveProperty("value", "7");
            await waitFor(() => {
                expect(getState().activeType).toBe("number");
            });
        });
    });

    it("renders the active cell block in the grid cell", () => {
        const CellBlock = createTableCellBlock({ name: "TestTableCell", cellBlocks: { text: TextCellBlock, number: NumberCellBlock } });

        const rendered = render(
            <TableBlockContextProvider CellBlock={CellBlock}>
                <CellValue
                    value={{
                        attachedBlocks: [
                            { type: "text", props: { text: "Inactive content" } },
                            { type: "number", props: { amount: 42 } },
                        ],
                        activeType: "number",
                    }}
                    rowSettings={{}}
                    columnSettings={{}}
                />
            </TableBlockContextProvider>,
        );

        expect(rendered.getByText("42")).toBeTruthy();
        expect(rendered.queryByText("Inactive content")).toBeNull();
    });

    it("links the preview of a cell's active block to the cell", () => {
        const TableBlock = createTableBlock({ cellBlocks: { text: TextCellBlock, number: NumberCellBlock } });

        const previewState = TableBlock.createPreviewState(
            createTableState({ attachedBlocks: [{ type: "number", props: { amount: 42 } }], activeType: "number" }),
            { parentUrl: "/table" } as BlockPreviewContext & BlockContext,
        );

        expect(previewState.rows[0].cellValues[0].value).toEqual({
            block: { type: "number", props: { amount: 42, adminMeta: { route: "/table#column:row" } } },
            adminMeta: { route: "/table#column:row" },
        });
    });

    it("links the preview of blocks nested in a cell's active block to the cell", () => {
        const TableBlock = createTableBlock({ cellBlocks: { composite: CompositeCellBlock, text: TextCellBlock } });

        const previewState = TableBlock.createPreviewState(
            createTableState({ attachedBlocks: [{ type: "composite", props: { text: { text: "Content" } } }], activeType: "composite" }),
            { parentUrl: "/table" } as BlockPreviewContext & BlockContext,
        );

        expect(previewState.rows[0]?.cellValues[0]?.value.block?.props.text.adminMeta.route).toBe("/table#column:row#text");
        expect(parseCellHash("#column:row#text")).toEqual({ columnId: "column", rowId: "row" });
    });
});
