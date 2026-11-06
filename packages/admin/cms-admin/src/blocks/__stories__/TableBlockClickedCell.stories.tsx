import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MemoryRouter } from "react-router";
import { expect, screen, waitFor } from "storybook/test";

import { createRichTextBlock } from "../createRichTextBlock";
import { createTableBlock } from "../createTableBlock";
import { ExternalLinkBlock } from "../ExternalLinkBlock";

const RichTextBlock = createRichTextBlock({ link: ExternalLinkBlock });
const TableBlock = createTableBlock({ richText: RichTextBlock });

const columnNames = ["A", "B", "C", "D", "E", "F", "G", "H"];
const rowNumbers = Array.from({ length: 30 }, (_, index) => index + 1);

const createCellText = (text: string) => ({
    draftContent: {
        blocks: [{ key: "text", type: "unstyled", text, depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} }],
        entityMap: {},
    },
});

const tableLargerThanTheDialog = TableBlock.input2State({
    columns: columnNames.map((columnName) => ({ id: columnName, size: "standard", highlighted: false })),
    rows: rowNumbers.map((rowNumber) => ({
        id: `${rowNumber}`,
        highlighted: false,
        cellValues: columnNames.map((columnName) => ({ columnId: columnName, value: createCellText(`${columnName}${rowNumber}`) })),
    })),
});

function TableBlockOpenedFromCellH25InThePreview() {
    const [state, setState] = useState(tableLargerThanTheDialog);

    return (
        <MemoryRouter initialEntries={["/table#H:25"]}>
            <TableBlock.AdminComponent state={state} updateState={setState} />
        </MemoryRouter>
    );
}

const config: Meta<typeof TableBlockOpenedFromCellH25InThePreview> = {
    component: TableBlockOpenedFromCellH25InThePreview,
    title: "Debug/blocks/TableBlock/Clicked cell",
    tags: ["!autodocs"],
};

export default config;

type Story = StoryObj<typeof config>;

export const ScrollsToAndHighlightsTheClickedCell: Story = {
    play: async () => {
        await waitFor(
            () => {
                const cell = screen.getByRole("cell", { name: "H25" });
                const cellBounds = cell.getBoundingClientRect();
                const visibleBounds = getVisibleArea(cell).getBoundingClientRect();
                expect(cellBounds.top).toBeGreaterThanOrEqual(visibleBounds.top);
                expect(cellBounds.bottom).toBeLessThanOrEqual(visibleBounds.bottom);
                expect(cellBounds.left).toBeGreaterThanOrEqual(visibleBounds.left);
                expect(cellBounds.right).toBeLessThanOrEqual(visibleBounds.right);
            },
            { timeout: 10000 },
        );

        await waitFor(() => expect(getHighlightOpacity(screen.getByRole("cell", { name: "H25" }))).toBe("1"), { timeout: 10000 });
    },
};

function getVisibleArea(cell: HTMLElement) {
    let visibleArea = cell.parentElement;
    while (visibleArea) {
        if (getComputedStyle(visibleArea).overflowY === "auto") {
            return visibleArea;
        }
        visibleArea = visibleArea.parentElement;
    }
    throw new Error("The cell is not inside a scroll area");
}

function getHighlightOpacity(cell: HTMLElement) {
    const cellValue = cell.querySelector("[data-table-cell-key]");
    if (!cellValue) {
        throw new Error("The cell has no value");
    }
    return getComputedStyle(cellValue, "::after").opacity;
}
