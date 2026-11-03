import { cleanup, within } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

afterEach(cleanup);

import { mockStates } from "../__mocks__/TableBlockData.mocks";
import {
    clickButtonOfRowAtIndex,
    getBodyRowgroup,
    getCellsExcludingTheDragHandleAndActionsCells,
    openRowOptionsAtIndex,
    renderTableBlock,
} from "./utils";

const getCellValuesPerRow = (rowgroup: HTMLElement) =>
    within(rowgroup)
        .getAllByRole("row")
        .map((row) => getCellsExcludingTheDragHandleAndActionsCells(row).map((cell) => cell.textContent));

describe("TableBlock: Move a row", () => {
    it("should swap a row with the row below when moving it down", async () => {
        const rendered = renderTableBlock(mockStates.default);
        const rowgroup = getBodyRowgroup(rendered);
        const [firstRowBefore, secondRowBefore, ...otherRowsBefore] = getCellValuesPerRow(rowgroup);

        clickButtonOfRowAtIndex(rendered, 0, /move down/i);

        expect(getCellValuesPerRow(rowgroup)).toEqual([secondRowBefore, firstRowBefore, ...otherRowsBefore]);
    });

    it("should swap a row with the row above when moving it up", async () => {
        const rendered = renderTableBlock(mockStates.default);
        const rowgroup = getBodyRowgroup(rendered);
        const [firstRowBefore, secondRowBefore, ...otherRowsBefore] = getCellValuesPerRow(rowgroup);

        clickButtonOfRowAtIndex(rendered, 1, /move up/i);

        expect(getCellValuesPerRow(rowgroup)).toEqual([secondRowBefore, firstRowBefore, ...otherRowsBefore]);
    });

    it('should disable "Move up" for the first row', async () => {
        const rendered = renderTableBlock(mockStates.default);

        openRowOptionsAtIndex(rendered, 0);

        expect(rendered.getByRole("menuitem", { name: /move up/i }).getAttribute("aria-disabled")).toBe("true");
    });

    it('should disable "Move down" for the last row', async () => {
        const rendered = renderTableBlock(mockStates.default);
        const lastRowIndex = mockStates.default.rows.length - 1;

        openRowOptionsAtIndex(rendered, lastRowIndex);

        expect(rendered.getByRole("menuitem", { name: /move down/i }).getAttribute("aria-disabled")).toBe("true");
    });
});
