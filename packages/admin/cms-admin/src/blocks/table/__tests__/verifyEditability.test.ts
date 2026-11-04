import { cleanup, within } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

import { mockStates } from "../__mocks__/TableBlockData.mocks";
import { clickButtonOfColumnAtIndex, clickButtonOfRowAtIndex, getCellsExcludingTheDragHandleAndActionsCells, renderTableBlock } from "./utils";

afterEach(cleanup);

describe("TableBlock: Verify the table is always editable, regardless of the number of rows or columns", () => {
    it("should have the ability to add new rows and columns when rendered with the initial data", async () => {
        const rendered = renderTableBlock(mockStates.default);

        const rowOptionsButtons = rendered.queryAllByLabelText(/row options/i);
        const columnOptionsButtons = rendered.queryAllByLabelText(/column options/i);

        expect(rowOptionsButtons.length).toBeGreaterThan(0);
        expect(columnOptionsButtons.length).toBeGreaterThan(0);
    });

    it("should have the ability to add new rows and columns when rendered with the empty data", async () => {
        const rendered = renderTableBlock(mockStates.empty);

        const rowOptionsButtons = rendered.queryAllByLabelText(/row options/i);
        const columnOptionsButtons = rendered.queryAllByLabelText(/column options/i);

        expect(rowOptionsButtons.length).toBeGreaterThan(0);
        expect(columnOptionsButtons.length).toBeGreaterThan(0);
    });

    it("should create an empty row when deleting the last row", async () => {
        const initialBlockData = mockStates.twoColumnsAndTwoRows;
        const rendered = renderTableBlock(initialBlockData);

        initialBlockData.rows.forEach(() => {
            // Always delete the top row
            clickButtonOfRowAtIndex(rendered, 0, /delete/i);
        });

        const rowgroup = rendered.getByRole("rowgroup");
        const newRow = within(rowgroup).getByRole("row");
        const dataCells = getCellsExcludingTheDragHandleAndActionsCells(newRow);

        expect(dataCells.length).toBeGreaterThan(0);
        dataCells.forEach((cell) => {
            expect(cell.textContent).toBe("");
        });
    });

    it("should create an empty column when deleting the last column", async () => {
        const initialBlockData = mockStates.twoColumnsAndTwoRows;
        const rendered = renderTableBlock(initialBlockData);

        initialBlockData.columns.forEach(() => {
            // Always delete the leftmost column
            clickButtonOfColumnAtIndex(rendered, 0, /delete/i);
        });

        const rowgroup = rendered.getByRole("rowgroup");
        const newRows = within(rowgroup).queryAllByRole("row");
        expect(newRows.length).toBeGreaterThan(0);

        newRows.forEach((newRow) => {
            const dataCells = getCellsExcludingTheDragHandleAndActionsCells(newRow);

            expect(dataCells.length).toBeGreaterThan(0);
            dataCells.forEach((cell) => {
                expect(cell.textContent).toBe("");
            });
        });
    });
});
