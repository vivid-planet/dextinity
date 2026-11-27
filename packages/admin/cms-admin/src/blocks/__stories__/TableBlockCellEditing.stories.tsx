// eslint-disable-next-line no-restricted-imports
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, waitFor, within } from "storybook/test";

import { createRichTextBlock } from "../createRichTextBlock";
import { createTableBlock } from "../createTableBlock";
import { ExternalLinkBlock } from "../ExternalLinkBlock";

const RichTextBlock = createRichTextBlock({ link: ExternalLinkBlock });
const TableBlock = createTableBlock({ richText: RichTextBlock });

const columnNames = ["A", "B"];
const rowNumbers = [1, 2, 3];

const createCellText = (text: string) => ({
    draftContent: {
        blocks: [{ key: "text", type: "unstyled", text, depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} }],
        entityMap: {},
    },
});

const table = TableBlock.input2State({
    columns: columnNames.map((columnName) => ({ id: columnName, size: "standard", highlighted: false })),
    rows: rowNumbers.map((rowNumber) => ({
        id: `${rowNumber}`,
        highlighted: false,
        cellValues: columnNames.map((columnName) => ({ columnId: columnName, value: createCellText(`${columnName}${rowNumber}`) })),
    })),
});

function TableBlockStory() {
    const [state, setState] = useState(table);

    return <TableBlock.AdminComponent state={state} updateState={setState} />;
}

const config: Meta<typeof TableBlockStory> = {
    component: TableBlockStory,
    title: "Debug/blocks/TableBlock/Cell editing",
    tags: ["!autodocs"],
    parameters: {
        dataGrid: { component: DataGridPro },
    },
};

export default config;

type Story = StoryObj<typeof config>;

type UserEvent = Parameters<NonNullable<Story["play"]>>[0]["userEvent"];

const findCell = (name: string) => screen.findByRole("gridcell", { name }, { timeout: 5000 });

const openCellEditor = async (userEvent: UserEvent, cellName: string) => {
    await userEvent.dblClick(await findCell(cellName));
    const cellEditor = await screen.findByRole("tooltip");
    const textbox = within(cellEditor).getByRole("textbox");
    await waitFor(() => expect(textbox).toHaveFocus());
    return { cellEditor, textbox };
};

const getDialog = () => screen.getByRole("dialog");

const expectDialogToStayOpen = () => {
    // The dialog stays visible during its closing transition, but MUI's Fade sets its opacity to 0 as soon as it starts closing.
    expect(getDialog().parentElement?.style.opacity).toBe("1");
};

export const EditorOpensAtTheEditedCell: Story = {
    play: async ({ userEvent }) => {
        const cell = await findCell("B2");
        await userEvent.dblClick(cell);
        const cellEditor = await screen.findByRole("tooltip");

        await waitFor(() => {
            const cellBounds = cell.getBoundingClientRect();
            const editorBounds = cellEditor.getBoundingClientRect();
            expect(editorBounds.top).toBeGreaterThanOrEqual(cellBounds.top);
            expect(editorBounds.top).toBeLessThan(cellBounds.bottom);
            expect(editorBounds.left).toBeGreaterThanOrEqual(cellBounds.left);
            expect(editorBounds.left).toBeLessThan(cellBounds.left + 20);
        });
    },
};

export const EnterAddsAParagraphAndKeepsTheEditorOpen: Story = {
    // The play function needs "vitest/browser", which only works in the Vitest run
    tags: ["!dev"],
    play: async ({ userEvent }) => {
        const { cellEditor, textbox } = await openCellEditor(userEvent, "B2");

        // storybook/test's userEvent inserts a raw line break into the DOM instead of letting Draft.js split the block
        const { userEvent: browserUserEvent } = await import("vitest/browser");
        await browserUserEvent.keyboard("{Enter}second line");

        await waitFor(() => expect(textbox.querySelectorAll("[data-block]")).toHaveLength(2));
        expect(cellEditor).toBeInTheDocument();
        expect(textbox).toHaveFocus();
    },
};

export const EscapeClosesTheEditorButNotTheDialog: Story = {
    play: async ({ userEvent }) => {
        await openCellEditor(userEvent, "B2");

        await userEvent.keyboard("{Escape}");

        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
        expectDialogToStayOpen();
    },
};

export const ClickingOutsideTheEditorSavesTheChangeAndKeepsTheDialogOpen: Story = {
    play: async ({ userEvent }) => {
        await openCellEditor(userEvent, "B2");

        await userEvent.keyboard(" changed");
        await userEvent.click(within(getDialog()).getByRole("heading", { name: "Table" }));

        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
        expectDialogToStayOpen();
        await waitFor(() => expect(screen.getByRole("gridcell", { name: "B2 changed" })).toBeInTheDocument());
    },
};
