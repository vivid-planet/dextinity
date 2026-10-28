import { gridClasses } from "@mui/x-data-grid";
import { useState } from "react";
import { fireEvent, render, type RenderResult, waitFor, within } from "test-utils";
import { expect } from "vitest";

import type { TableBlockState } from "../../createTableBlock";
import { MockRichTextBlock } from "../__mocks__/TableBlockData.mocks";
import { TableBlockContextProvider } from "../TableBlockContext";
import { TableBlockGrid } from "../TableBlockGrid";

export const renderTableBlock = (initialState: TableBlockState) => {
    const Component = () => {
        const [state, setState] = useState<TableBlockState>(initialState);
        return (
            <TableBlockContextProvider RichTextBlock={MockRichTextBlock}>
                <TableBlockGrid state={state} updateState={setState} />
            </TableBlockContextProvider>
        );
    };
    return render(<Component />);
};

export const openRowOptionsAtIndex = (rendered: RenderResult, index: number) => {
    fireEvent.click(rendered.getAllByLabelText(/row options/i)[index]);
};

export const clickButtonOfRowAtIndex = (rendered: RenderResult, index: number, buttonNameRegex: RegExp) => {
    openRowOptionsAtIndex(rendered, index);

    const button = rendered.getByRole("menuitem", { name: buttonNameRegex });
    fireEvent.click(button);
};

export const openColumnOptionsAtIndex = (rendered: RenderResult, index: number) => {
    fireEvent.click(rendered.getAllByLabelText(/column options/i)[index]);
};

export const clickButtonOfColumnAtIndex = (rendered: RenderResult, index: number, buttonNameRegex: RegExp) => {
    openColumnOptionsAtIndex(rendered, index);

    const button = rendered.getByRole("menuitem", { name: buttonNameRegex });
    fireEvent.click(button);
};

export const getBodyRowgroup = (rendered: RenderResult) => {
    const bodyRowgroup = rendered.getAllByRole("rowgroup").find((rowgroup) => !rowgroup.classList.contains(gridClasses.columnHeaders));
    if (!bodyRowgroup) {
        throw new Error("The body rowgroup of the data grid was not found");
    }
    return bodyRowgroup;
};

export const waitForClipboardToHaveValue = async () => {
    await waitFor(async () => {
        await expect(navigator.clipboard.readText()).resolves.not.toBe("");
    });
};

export const getCellValuesPerColumn = (rendered: RenderResult) => {
    const rowgroup = getBodyRowgroup(rendered);
    const rows = within(rowgroup).getAllByRole("row");

    const rowCells = rows.map((row) => within(row).getAllByRole("gridcell"));
    const firstRowCells = rowCells[0];
    const cellValuesPerColumn: string[][] = [];

    firstRowCells.forEach((_, cellIndex) => {
        const isDragHandleCell = cellIndex === 0;
        const isActionsCell = cellIndex === firstRowCells.length - 1;
        if (isDragHandleCell || isActionsCell) {
            return;
        }

        const cellValuesOfColumn: string[] = [];

        rowCells.forEach((rowCells) => {
            cellValuesOfColumn.push(rowCells[cellIndex].textContent);
        });

        cellValuesPerColumn.push(cellValuesOfColumn);
    });

    return cellValuesPerColumn;
};

export const getCellsExcludingTheDragHandleAndActionsCells = (rowElement: HTMLElement): HTMLElement[] => {
    return within(rowElement).queryAllByRole("gridcell").slice(1, -1);
};
