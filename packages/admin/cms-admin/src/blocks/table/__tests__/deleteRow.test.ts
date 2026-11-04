import { cleanup, within } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

afterEach(cleanup);

import { mockStates } from "../__mocks__/TableBlockData.mocks";
import { clickButtonOfRowAtIndex, renderTableBlock } from "./utils";

describe("TableBlock: Delete row", () => {
    it("should delete a certain row", async () => {
        const targetRowIndex = 2;

        const rendered = renderTableBlock(mockStates.default);
        const rowgroup = rendered.getByRole("rowgroup");
        const rowsBeforeDeleting = within(rowgroup).getAllByRole("row");

        clickButtonOfRowAtIndex(rendered, targetRowIndex, /delete/i);

        const rowsAfterDeleting = within(rowgroup).getAllByRole("row");
        expect(rowsAfterDeleting).toHaveLength(rowsBeforeDeleting.length - 1);

        const valuesOfRowBelowRowToBeDeleted = within(rowsBeforeDeleting[targetRowIndex + 1])
            .getAllByRole("gridcell")
            .map((cell) => cell.textContent);
        const valuesOfRowAtIndexOfDeletedRow = within(rowsAfterDeleting[targetRowIndex])
            .getAllByRole("gridcell")
            .map((cell) => cell.textContent);
        expect(valuesOfRowAtIndexOfDeletedRow).toEqual(valuesOfRowBelowRowToBeDeleted);
    });
});
