import { userEvent } from "@testing-library/user-event";
import { cleanup, waitFor } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

import { createRteInput, mockStates } from "../__mocks__/TableBlockData.mocks";
import { clickButtonOfColumnAtIndex, getCellValuesPerColumn, renderTableBlock } from "./utils";

afterEach(cleanup);

describe("TableBlock: Paste a column with different values", () => {
    beforeEach(() => {
        // Enable clipboard access in tests
        userEvent.setup();
    });

    it("should paste a column with less values than rows in the table", async () => {
        const rendered = renderTableBlock(mockStates.default);
        const initialColumnHeaders = rendered.getAllByRole("columnheader");
        const originalCellValuesPerColumn = getCellValuesPerColumn(rendered);

        const waitForNewColumnToBeInserted = async () => {
            await waitFor(() => {
                const currentColumnHeaders = rendered.getAllByRole("columnheader");
                expect(currentColumnHeaders).toHaveLength(initialColumnHeaders.length + 1);
            });
        };

        const insertTexts = ["Value 1", "Value 2"];
        const insertData = {
            size: "standard",
            highlighted: false,
            cellValues: insertTexts.map(createRteInput),
        };

        await navigator.clipboard.writeText(JSON.stringify(insertData));
        clickButtonOfColumnAtIndex(rendered, 0, /paste/i);
        await waitForNewColumnToBeInserted();

        const newCellValuesPerColumn = getCellValuesPerColumn(rendered);

        newCellValuesPerColumn.forEach((newCellValues, columnIndex) => {
            const expectNumberOfRowsToNotHaveChanged = () => {
                expect(newCellValues).toHaveLength(originalCellValuesPerColumn[0].length);
            };

            const expectInsertedColumnToHaveCorrectValues = () => {
                const isInsertedColumn = columnIndex == 1;
                if (!isInsertedColumn) {
                    return;
                }

                newCellValues.forEach((newCellValue, index) => {
                    const cellWasIncludedInInsertValues = index < insertTexts.length;

                    if (cellWasIncludedInInsertValues) {
                        expect(newCellValue).toBe(insertTexts[index]);
                    } else {
                        expect(newCellValue).toBe("");
                    }
                });
            };

            expectNumberOfRowsToNotHaveChanged();
            expectInsertedColumnToHaveCorrectValues();
        });
    });

    it("should paste a column with more values than rows in the table", async () => {
        const rendered = renderTableBlock(mockStates.default);
        const initialColumnHeaders = rendered.getAllByRole("columnheader");
        const originalCellValuesPerColumn = getCellValuesPerColumn(rendered);
        const pasteTargetColumnIndex = 0;

        const waitForNewColumnToBeInserted = async () => {
            await waitFor(() => {
                const currentColumnHeaders = rendered.getAllByRole("columnheader");
                expect(currentColumnHeaders).toHaveLength(initialColumnHeaders.length + 1);
            });
        };

        const insertTexts = ["Value 1", "Value 2", "Value 3", "Value 4", "Value 5", "Value 6", "Value 7", "Value 8"];
        const insertData = {
            size: "standard",
            highlighted: false,
            cellValues: insertTexts.map(createRteInput),
        };

        await navigator.clipboard.writeText(JSON.stringify(insertData));
        clickButtonOfColumnAtIndex(rendered, pasteTargetColumnIndex, /paste/i);
        await waitForNewColumnToBeInserted();

        const newCellValuesPerColumn = getCellValuesPerColumn(rendered);

        newCellValuesPerColumn.forEach((newCellValues, columnIndex) => {
            expect(newCellValues).toHaveLength(insertTexts.length);
            const isPastedColumn = columnIndex === pasteTargetColumnIndex + 1;

            if (isPastedColumn) {
                expect(newCellValues).toEqual(insertTexts);
            } else {
                newCellValues.forEach((newCellValue, rowIndex) => {
                    const isNewlyAddedCell = rowIndex >= originalCellValuesPerColumn[0].length;
                    if (isNewlyAddedCell) {
                        expect(newCellValue).toBe("");
                    } else {
                        const columnIndexInOriginalData = columnIndex > pasteTargetColumnIndex ? columnIndex - 1 : columnIndex;
                        expect(newCellValue).toBe(originalCellValuesPerColumn[columnIndexInOriginalData][rowIndex]);
                    }
                });
            }
        });
    });
});
