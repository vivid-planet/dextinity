import { cleanup, within } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

import { mockStates } from "../__mocks__/TableBlockData.mocks";
import { clickButtonOfColumnAtIndex, renderTableBlock } from "./utils";

afterEach(cleanup);

describe("TableBlock: Insert a new column", () => {
    it("should insert a new, empty column at the left side of the table", async () => {
        const rendered = renderTableBlock(mockStates.default);
        const rowgroup = rendered.getByRole("rowgroup");
        const rows = within(rowgroup).getAllByRole("row");
        const originalNumberOfCellsInRow = within(rows[0]).getAllByRole("gridcell").length;
        const targetColumnIndex = 0;

        const originalCellValuesPerRow = rows.map((rowElement) =>
            within(rowElement)
                .getAllByRole("gridcell")
                .map((cell) => cell.textContent),
        );

        clickButtonOfColumnAtIndex(rendered, targetColumnIndex, /insert column left/i);

        const newCellValuesPerRow = rows.map((rowElement) =>
            within(rowElement)
                .getAllByRole("gridcell")
                .map((cell) => cell.textContent),
        );

        newCellValuesPerRow.forEach((newCellValues, rowIndex) => {
            expect(newCellValues).toHaveLength(originalNumberOfCellsInRow + 1);
            const indexOffsetForDragHandleCell = 1;
            const actualTargetColumnIndex = targetColumnIndex + indexOffsetForDragHandleCell;

            newCellValues.forEach((newCellValue, cellIndex) => {
                const newCellIsAtNewlyInsertedColumn = cellIndex === actualTargetColumnIndex;
                const newCellIsAfterNewlyInsertedColumn = cellIndex > actualTargetColumnIndex;

                if (newCellIsAtNewlyInsertedColumn) {
                    expect(newCellValue).toBe("");
                }

                if (newCellIsAfterNewlyInsertedColumn) {
                    const originalValueOfCellToTheLeft = originalCellValuesPerRow[rowIndex][cellIndex - 1];
                    expect(newCellValue).toBe(originalValueOfCellToTheLeft);
                }
            });
        });
    });
    it("should insert a new, empty column at the right side of the table", async () => {
        const initialBlockData = mockStates.default;
        const rendered = renderTableBlock(initialBlockData);
        const rowgroup = rendered.getByRole("rowgroup");
        const rows = within(rowgroup).getAllByRole("row");
        const originalNumberOfCellsInRow = within(rows[0]).getAllByRole("gridcell").length;
        const targetColumnIndex = initialBlockData.columns.length - 1;

        const originalCellValuesPerRow = rows.map((rowElement) =>
            within(rowElement)
                .getAllByRole("gridcell")
                .map((cell) => cell.textContent),
        );

        clickButtonOfColumnAtIndex(rendered, targetColumnIndex, /insert column right/i);

        const newCellValuesPerRow = rows.map((rowElement) =>
            within(rowElement)
                .getAllByRole("gridcell")
                .map((cell) => cell.textContent),
        );

        newCellValuesPerRow.forEach((newCellValues, rowIndex) => {
            expect(newCellValues).toHaveLength(originalNumberOfCellsInRow + 1);
            const indexOffsetForDragHandleCell = 1;
            const actualTargetColumnIndex = targetColumnIndex + indexOffsetForDragHandleCell;

            newCellValues.forEach((newCellValue, cellIndex) => {
                const newCellIsAtNewlyInsertedColumn = cellIndex === actualTargetColumnIndex + 1;
                const newCellIsBeforeNewlyInsertedColumn = cellIndex <= actualTargetColumnIndex;

                if (newCellIsAtNewlyInsertedColumn) {
                    expect(newCellValue).toBe("");
                }

                if (newCellIsBeforeNewlyInsertedColumn) {
                    const originalValueOfCell = originalCellValuesPerRow[rowIndex][cellIndex];
                    expect(newCellValue).toBe(originalValueOfCell);
                }
            });
        });
    });
    it("should insert a new, empty column in the middle of the table", async () => {
        const rendered = renderTableBlock(mockStates.default);
        const rowgroup = rendered.getByRole("rowgroup");
        const rows = within(rowgroup).getAllByRole("row");
        const originalNumberOfCellsInRow = within(rows[0]).getAllByRole("gridcell").length;
        const targetColumnIndex = 2;

        const originalCellValuesPerRow = rows.map((rowElement) =>
            within(rowElement)
                .getAllByRole("gridcell")
                .map((cell) => cell.textContent),
        );

        clickButtonOfColumnAtIndex(rendered, targetColumnIndex, /insert column right/i);

        const newCellValuesPerRow = rows.map((rowElement) =>
            within(rowElement)
                .getAllByRole("gridcell")
                .map((cell) => cell.textContent),
        );

        newCellValuesPerRow.forEach((newCellValues, rowIndex) => {
            expect(newCellValues).toHaveLength(originalNumberOfCellsInRow + 1);
            const indexOffsetForDragHandleCell = 1;
            const actualTargetColumnIndex = targetColumnIndex + indexOffsetForDragHandleCell;

            newCellValues.forEach((newCellValue, cellIndex) => {
                const newCellIsAtNewlyInsertedColumn = cellIndex === actualTargetColumnIndex + 1;
                const newCellIsBeforeNewlyInsertedColumn = cellIndex <= actualTargetColumnIndex;
                const newCellIsAfterNewlyInsertedColumn = cellIndex > actualTargetColumnIndex + 1;

                if (newCellIsAtNewlyInsertedColumn) {
                    expect(newCellValue).toBe("");
                }

                if (newCellIsBeforeNewlyInsertedColumn) {
                    const originalValueOfCell = originalCellValuesPerRow[rowIndex][cellIndex];
                    expect(newCellValue).toBe(originalValueOfCell);
                }

                if (newCellIsAfterNewlyInsertedColumn) {
                    const originalValueOfCellToTheLeft = originalCellValuesPerRow[rowIndex][cellIndex - 1];
                    expect(newCellValue).toBe(originalValueOfCellToTheLeft);
                }
            });
        });
    });
});
