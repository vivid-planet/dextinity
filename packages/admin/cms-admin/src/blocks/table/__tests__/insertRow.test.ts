import { cleanup, within } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

import { getPlainTextFromState, mockStates } from "../__mocks__/TableBlockData.mocks";
import { clickButtonOfRowAtIndex, renderTableBlock } from "./utils";

afterEach(cleanup);

describe("TableBlock: Insert a new row", () => {
    it("should insert a new, empty row at the top of the table", async () => {
        const initialBlockData = mockStates.default;
        const rendered = renderTableBlock(initialBlockData);

        clickButtonOfRowAtIndex(rendered, 0, /add row above/i);

        const rowgroup = rendered.getByRole("rowgroup");
        const rows = within(rowgroup).getAllByRole("row");

        const numberOfRowsAfterInserting = initialBlockData.rows.length + 1;
        expect(rows).toHaveLength(numberOfRowsAfterInserting);

        rows.forEach((row, rowIndex) => {
            const cells = within(row).getAllByRole("gridcell");
            const cellsExcludingTheDragHandleAndActionsCells = cells.slice(1, cells.length - 1);

            cellsExcludingTheDragHandleAndActionsCells.forEach((cell, cellIndex) => {
                const isNewlyInsertedRow = rowIndex === 0;
                if (isNewlyInsertedRow) {
                    expect(cell.textContent).toBe("");
                } else {
                    const rowIndexBeforeInsertingNewRow = rowIndex - 1;
                    const cellValue = initialBlockData.rows[rowIndexBeforeInsertingNewRow].cellValues[cellIndex].value;
                    expect(cell.textContent).toBe(getPlainTextFromState(cellValue));
                }
            });
        });
    });
    it("should insert a new, empty row at the bottom of the table", async () => {
        const initialBlockData = mockStates.default;
        const rendered = renderTableBlock(initialBlockData);
        const targetRowIndex = initialBlockData.rows.length - 1;

        clickButtonOfRowAtIndex(rendered, targetRowIndex, /add row below/i);

        const rowgroup = rendered.getByRole("rowgroup");
        const rows = within(rowgroup).getAllByRole("row");

        const numberOfRowsAfterInserting = initialBlockData.rows.length + 1;
        expect(rows).toHaveLength(numberOfRowsAfterInserting);

        rows.forEach((row, rowIndex) => {
            const cells = within(row).getAllByRole("gridcell");
            const cellsExcludingTheDragHandleAndActionsCells = cells.slice(1, cells.length - 1);

            cellsExcludingTheDragHandleAndActionsCells.forEach((cell, cellIndex) => {
                const isNewlyInsertedRow = rowIndex === targetRowIndex + 1;
                if (isNewlyInsertedRow) {
                    expect(cell.textContent).toBe("");
                } else {
                    const cellValue = initialBlockData.rows[rowIndex].cellValues[cellIndex].value;
                    expect(cell.textContent).toBe(getPlainTextFromState(cellValue));
                }
            });
        });
    });
    it("should insert a new, empty row in the middle of the table", async () => {
        const initialBlockData = mockStates.default;
        const rendered = renderTableBlock(initialBlockData);
        const targetRowIndex = 2;

        clickButtonOfRowAtIndex(rendered, targetRowIndex, /add row below/i);

        const rowgroup = rendered.getByRole("rowgroup");
        const rows = within(rowgroup).getAllByRole("row");

        const numberOfRowsAfterInserting = initialBlockData.rows.length + 1;
        expect(rows).toHaveLength(numberOfRowsAfterInserting);

        rows.forEach((row, rowIndex) => {
            const cells = within(row).getAllByRole("gridcell");
            const cellsExcludingTheDragHandleAndActionsCells = cells.slice(1, cells.length - 1);

            cellsExcludingTheDragHandleAndActionsCells.forEach((cell, cellIndex) => {
                const isNewlyInsertedRow = rowIndex === targetRowIndex + 1;
                const isBeforeNewlyInsertedRow = rowIndex <= targetRowIndex;
                const isAfterNewlyInsertedRow = rowIndex > targetRowIndex + 1;

                if (isNewlyInsertedRow) {
                    expect(cell.textContent).toBe("");
                }

                if (isBeforeNewlyInsertedRow) {
                    const cellValue = initialBlockData.rows[rowIndex].cellValues[cellIndex].value;
                    expect(cell.textContent).toBe(getPlainTextFromState(cellValue));
                }

                if (isAfterNewlyInsertedRow) {
                    const cellValue = initialBlockData.rows[rowIndex - 1].cellValues[cellIndex].value;
                    expect(cell.textContent).toBe(getPlainTextFromState(cellValue));
                }
            });
        });
    });
});
