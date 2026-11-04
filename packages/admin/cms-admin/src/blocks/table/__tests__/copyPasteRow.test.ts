import { userEvent } from "@testing-library/user-event";
import { cleanup, waitFor, within } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

afterEach(cleanup);

import { getPlainTextFromState, mockStates } from "../__mocks__/TableBlockData.mocks";
import { clickButtonOfRowAtIndex, renderTableBlock, waitForClipboardToHaveValue } from "./utils";

describe("TableBlock: Copy and paste a row", () => {
    beforeEach(() => {
        // Enable clipboard access in tests
        userEvent.setup();
    });

    it("should copy a certain row and paste it below another row", async () => {
        const initialBlockData = mockStates.default;
        const sourceRowIndex = 1;
        const targetRowIndex = 3;

        const waitForNewRowToBeInserted = async () => {
            await waitFor(() => {
                const rows = within(rowgroup).getAllByRole("row");
                expect(rows).toHaveLength(initialBlockData.rows.length + 1);
            });
        };

        const rendered = renderTableBlock(initialBlockData);
        const rowgroup = rendered.getByRole("rowgroup");

        clickButtonOfRowAtIndex(rendered, sourceRowIndex, /copy/i);
        await waitForClipboardToHaveValue();
        clickButtonOfRowAtIndex(rendered, targetRowIndex, /paste/i);
        await waitForNewRowToBeInserted();

        const rows = within(rowgroup).getAllByRole("row");
        const sourceRowElement = rows[sourceRowIndex];
        const sourceRowCells = within(sourceRowElement).getAllByRole("gridcell");

        const newlyInsertedRowIndex = targetRowIndex + 1;
        const newRowElement = rows[newlyInsertedRowIndex];
        const newRowCells = within(newRowElement).getAllByRole("gridcell");

        const sourceRowValues = initialBlockData.rows[sourceRowIndex].cellValues.map((cellValue) => getPlainTextFromState(cellValue.value));

        sourceRowValues.forEach((originalCellValueInSourceRow, index) => {
            const offsetForCellsWithActualContent = 1;
            const cellIndexInSourceRow = index + offsetForCellsWithActualContent;

            const currentCellValueInSourceRow = sourceRowCells[cellIndexInSourceRow].textContent;
            const currentCellValueInNewRow = newRowCells[cellIndexInSourceRow].textContent;

            expect(currentCellValueInSourceRow).toBe(originalCellValueInSourceRow);
            expect(currentCellValueInNewRow).toBe(originalCellValueInSourceRow);
        });
    });

    it("should show an error when pasting invalid data", async () => {
        const rendered = renderTableBlock(mockStates.default);

        await navigator.clipboard.writeText("some random invalid data");
        await waitForClipboardToHaveValue();

        clickButtonOfRowAtIndex(rendered, 0, /paste/i);

        const errorAlert = await waitFor(() => rendered.getByRole("alert"));
        expect(errorAlert).not.toBeNull();
        expect(errorAlert.textContent).toContain("Could not paste the clipboard data");
    });

    it("should show an error when pasting an invalid object", async () => {
        const rendered = renderTableBlock(mockStates.default);

        const someRandomObject = { foo: "bar", bar: "foo" };
        await navigator.clipboard.writeText(JSON.stringify(someRandomObject));
        await waitForClipboardToHaveValue();

        clickButtonOfRowAtIndex(rendered, 0, /paste/i);

        const errorAlert = await waitFor(() => rendered.getByRole("alert"));
        expect(errorAlert).not.toBeNull();
        expect(errorAlert.textContent).toContain("Could not paste the clipboard data");
    });

    it("should show an error when pasting an empty clipboard", async () => {
        const rendered = renderTableBlock(mockStates.default);

        clickButtonOfRowAtIndex(rendered, 0, /paste/i);

        const errorAlert = await waitFor(() => rendered.getByRole("alert"));
        expect(errorAlert).not.toBeNull();
        expect(errorAlert.textContent).toContain("Could not paste the clipboard data");
    });
});
