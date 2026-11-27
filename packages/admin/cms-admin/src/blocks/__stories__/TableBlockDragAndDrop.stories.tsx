// eslint-disable-next-line no-restricted-imports
import { DataGridPro } from "@mui/x-data-grid-pro";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, fn, screen, waitFor } from "storybook/test";
import type { UserEvent } from "vitest/browser";

import { createRichTextBlock } from "../createRichTextBlock";
import { createTableBlock, type TableBlockState } from "../createTableBlock";
import { ExternalLinkBlock } from "../ExternalLinkBlock";

const RichTextBlock = createRichTextBlock({ link: ExternalLinkBlock });
const TableBlock = createTableBlock({ richText: RichTextBlock });

const columnIds = ["A", "B", "C"];
const rowIds = ["1", "2", "3"];

const createCellText = (text: string) => ({
    draftContent: {
        blocks: [{ key: "text", type: "unstyled", text, depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} }],
        entityMap: {},
    },
});

const tableWithThreeColumnsAndRows = TableBlock.input2State({
    columns: columnIds.map((columnId) => ({ id: columnId, size: "standard", highlighted: false })),
    rows: rowIds.map((rowId) => ({
        id: rowId,
        highlighted: false,
        cellValues: columnIds.map((columnId) => ({ columnId, value: createCellText(`${columnId}${rowId}`) })),
    })),
});

type StoryProps = {
    onStateChange: (state: TableBlockState) => void;
};

function TableBlockStory({ onStateChange }: StoryProps) {
    const [state, setState] = useState(tableWithThreeColumnsAndRows);

    useEffect(() => {
        onStateChange(state);
    }, [state, onStateChange]);

    return <TableBlock.AdminComponent state={state} updateState={setState} />;
}

const config: Meta<typeof TableBlockStory> = {
    component: TableBlockStory,
    title: "Debug/blocks/TableBlock/Drag and drop",
    // The play functions need "vitest/browser", which only works in the Vitest run
    tags: ["!autodocs", "!dev"],
    args: {
        onStateChange: fn(),
    },
    parameters: {
        dataGrid: { component: DataGridPro },
    },
};

export default config;

type Story = StoryObj<typeof config>;

export const DraggingTheLastRowAboveTheFirstMovesIt: Story = {
    play: async ({ args }) => {
        await screen.findByRole("gridcell", { name: "A1" }, { timeout: 5000 });

        await dragAndDrop(getRowDragHandle("3"), getRow("1"), { targetPosition: { x: 50, y: 2 } });

        await waitFor(() => expect(getRowOrderInGrid()).toEqual(["3", "1", "2"]));
        await waitFor(() => expect(getLastState(args.onStateChange).rows.map(({ id }) => id)).toEqual(["3", "1", "2"]));
    },
};

export const DraggingTheMiddleColumnOntoTheLastMovesIt: Story = {
    play: async ({ args }) => {
        await screen.findByRole("gridcell", { name: "A1" }, { timeout: 5000 });

        await dragAndDrop(getColumnDragHandle("B"), getColumnHeader("C"));

        await waitFor(() => expect(getColumnOrderInGrid()).toEqual(["A", "C", "B"]));
        await waitFor(() => expect(getLastState(args.onStateChange).columns.map(({ id }) => id)).toEqual(["A", "C", "B"]));
    },
};

export const ColumnDroppedOutsideTheGridKeepsItsPosition: Story = {
    play: async ({ args }) => {
        await screen.findByRole("gridcell", { name: "A1" }, { timeout: 5000 });

        // Moving along the header row reorders the columns while dragging, so the drop outside the grid has to undo it
        await dragAndDrop(getColumnDragHandle("A"), screen.getByRole("dialog"), {
            steps: 30,
            targetPosition: getRightEdgeOfTheDialogAtHeaderHeight(),
        });
        // The state update after the drag ends is applied in a later task
        await new Promise((resolve) => setTimeout(resolve));

        expect(getColumnOrderInGrid()).toEqual(["A", "B", "C"]);
        expect(getLastState(args.onStateChange).columns.map(({ id }) => id)).toEqual(["A", "B", "C"]);
    },
};

// Playwright performs a real native HTML5 drag, which storybook/test's userEvent can't trigger. Imported lazily because "vitest/browser" throws when the story is opened outside of Vitest.
async function dragAndDrop(source: HTMLElement, target: HTMLElement, options?: Parameters<UserEvent["dragAndDrop"]>[2]) {
    const { userEvent } = await import("vitest/browser");
    await userEvent.dragAndDrop(source, target, options);
}

function getRightEdgeOfTheDialogAtHeaderHeight() {
    const dialogBounds = screen.getByRole("dialog").getBoundingClientRect();
    const headerBounds = getColumnHeader("A").getBoundingClientRect();
    return { x: dialogBounds.width - 4, y: headerBounds.top + headerBounds.height / 2 - dialogBounds.top };
}

function getLastState(onStateChange: StoryProps["onStateChange"]) {
    const { calls } = (onStateChange as ReturnType<typeof fn>).mock;
    return calls[calls.length - 1][0] as TableBlockState;
}

function getRow(rowId: string) {
    const row = document.querySelector<HTMLElement>(`[role="row"][data-id="${rowId}"]`);
    if (!row) {
        throw new Error(`Row ${rowId} not found`);
    }
    return row;
}

function getRowDragHandle(rowId: string) {
    const handle = getRow(rowId).querySelector<HTMLElement>('[draggable="true"]');
    if (!handle) {
        throw new Error(`Drag handle of row ${rowId} not found`);
    }
    return handle;
}

function getColumnHeader(columnId: string) {
    const header = document.querySelector<HTMLElement>(`[role="columnheader"][data-field="${columnId}"]`);
    if (!header) {
        throw new Error(`Header of column ${columnId} not found`);
    }
    return header;
}

function getColumnDragHandle(columnId: string) {
    const handle = getColumnHeader(columnId).querySelector<HTMLElement>('[draggable="true"]');
    if (!handle) {
        throw new Error(`Drag handle of column ${columnId} not found`);
    }
    return handle;
}

function getRowOrderInGrid() {
    return Array.from(document.querySelectorAll<HTMLElement>('[role="row"][data-id]')).map((row) => row.dataset.id);
}

function getColumnOrderInGrid() {
    return Array.from(document.querySelectorAll<HTMLElement>('[role="columnheader"][data-field]'))
        .map((header) => header.dataset.field)
        .filter((field) => field && columnIds.includes(field));
}
