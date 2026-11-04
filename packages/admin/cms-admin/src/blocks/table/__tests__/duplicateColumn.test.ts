import { cleanup, within } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

afterEach(cleanup);

import { mockStates } from "../__mocks__/TableBlockData.mocks";
import { clickButtonOfColumnAtIndex, renderTableBlock } from "./utils";

describe("TableBlock: Duplicate a column", () => {
    it("should have a new column with the same values as the source column", async () => {
        const rendered = renderTableBlock(mockStates.default);
        const sourceColumnIndex = 2;

        const rowgroup = rendered.getByRole("rowgroup");
        const rows = within(rowgroup).getAllByRole("row");
        const originalNumberOfCellsInRow = within(rows[0]).getAllByRole("gridcell").length;

        const originalCellValuesPerRow = rows.map((rowElement) =>
            within(rowElement)
                .getAllByRole("gridcell")
                .map((cell) => cell.textContent),
        );

        clickButtonOfColumnAtIndex(rendered, sourceColumnIndex, /duplicate/i);

        const newCellValuesPerRow = rows.map((rowElement) =>
            within(rowElement)
                .getAllByRole("gridcell")
                .map((cell) => cell.textContent),
        );

        newCellValuesPerRow.forEach((newCellValues, rowIndex) => {
            expect(newCellValues).toHaveLength(originalNumberOfCellsInRow + 1);
            const indexOffsetForDragHandleCell = 1;
            const actualSourceColumnIndex = sourceColumnIndex + indexOffsetForDragHandleCell;

            newCellValues.forEach((newCellValue, cellIndex) => {
                const newCellIsBeforeDuplicatedColumn = cellIndex < actualSourceColumnIndex;
                const newCellIsDuplicationColumnSource = cellIndex === actualSourceColumnIndex;
                const newCellIsDuplicationColumnTarget = cellIndex === actualSourceColumnIndex + 1;
                const newCellIsAfterDuplicatedColumn = cellIndex > actualSourceColumnIndex + 1;

                const originalValueOfCell = originalCellValuesPerRow[rowIndex][cellIndex];
                const cellValueOfDuplicatedColumn = originalCellValuesPerRow[rowIndex][actualSourceColumnIndex];
                const originalValueOfCellToTheLeft = originalCellValuesPerRow[rowIndex][cellIndex - 1];

                if (newCellIsBeforeDuplicatedColumn || newCellIsDuplicationColumnSource) {
                    expect(newCellValue).toBe(originalValueOfCell);
                }

                if (newCellIsDuplicationColumnSource || newCellIsDuplicationColumnTarget) {
                    expect(newCellValue).toBe(cellValueOfDuplicatedColumn);
                }

                if (newCellIsAfterDuplicatedColumn) {
                    expect(newCellValue).toBe(originalValueOfCellToTheLeft);
                }
            });
        });
    });
});
