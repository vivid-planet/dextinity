import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { createRteState, getPlainTextFromState, MockRichTextBlock, mockStates } from "../__mocks__/TableBlockData.mocks";
import { insertRowDataAtIndex, type RowInsertData } from "../utils/row";

const insertDataWithTwoValues: RowInsertData = {
    highlighted: false,
    cellValues: [createRteState("Two Values - Value 1"), createRteState("Two Values - Value 2")],
};

const insertDataWithFourValues: RowInsertData = {
    highlighted: false,
    cellValues: [
        createRteState("Four Values - Value 1"),
        createRteState("Four Values - Value 2"),
        createRteState("Four Values - Value 3"),
        createRteState("Four Values - Value 4"),
    ],
};

const insertDataWithSixValues: RowInsertData = {
    highlighted: false,
    cellValues: [
        createRteState("Six Values - Value 1"),
        createRteState("Six Values - Value 2"),
        createRteState("Six Values - Value 3"),
        createRteState("Six Values - Value 4"),
        createRteState("Six Values - Value 5"),
        createRteState("Six Values - Value 6"),
    ],
};

describe("insertRowDataAtIndex", () => {
    it("should insert a row with the specified id at index 0", () => {
        const newRowId = uuid();
        const targetIndex = 0;
        const newState = insertRowDataAtIndex(mockStates.default, insertDataWithFourValues, targetIndex, MockRichTextBlock, newRowId);

        const insertedRow = newState.rows[targetIndex];
        expect(insertedRow.id).toBe(newRowId);

        const insertedRowCellValues = insertedRow?.cellValues.map((cellValue) => getPlainTextFromState(cellValue.value));
        expect(insertedRowCellValues).toEqual(["Four Values - Value 1", "Four Values - Value 2", "Four Values - Value 3", "Four Values - Value 4"]);
    });

    it("should insert a row with the specified id at index 2", () => {
        const newRowId = uuid();
        const targetIndex = 2;
        const newState = insertRowDataAtIndex(mockStates.default, insertDataWithFourValues, targetIndex, MockRichTextBlock, newRowId);

        const insertedRow = newState.rows[targetIndex];
        expect(insertedRow.id).toBe(newRowId);

        const insertedRowCellValues = insertedRow?.cellValues.map((cellValue) => getPlainTextFromState(cellValue.value));
        expect(insertedRowCellValues).toEqual(["Four Values - Value 1", "Four Values - Value 2", "Four Values - Value 3", "Four Values - Value 4"]);
    });

    it("should create empty cell-values for columns that don't have a corresponding value in the row's insert-data", () => {
        const newRowId = uuid();
        const targetIndex = 0;

        const initialBlockData = mockStates.default;
        const newState = insertRowDataAtIndex(initialBlockData, insertDataWithTwoValues, targetIndex, MockRichTextBlock, newRowId);
        const insertedRow = newState.rows[targetIndex];

        expect(getPlainTextFromState(insertedRow.cellValues[0].value)).toBe("Two Values - Value 1");
        expect(getPlainTextFromState(insertedRow.cellValues[1].value)).toBe("Two Values - Value 2");
        expect(getPlainTextFromState(insertedRow.cellValues[2].value)).toBe("");
        expect(getPlainTextFromState(insertedRow.cellValues[3].value)).toBe("");

        initialBlockData.columns.forEach((column, index) => {
            expect(insertedRow.cellValues[index].columnId).toBe(column.id);
        });
    });

    it("should increase the number of columns when inserting a row with more values than the existing number of columns", () => {
        const newRowId = uuid();
        const targetIndex = 0;
        const newState = insertRowDataAtIndex(mockStates.default, insertDataWithSixValues, targetIndex, MockRichTextBlock, newRowId);

        expect(newState.columns.length).toBe(insertDataWithSixValues.cellValues.length);
    });

    it("should add empty cell-values to all existing rows when new columns are created due to the insert-data having more values than the existing number of columns", () => {
        const newRowId = uuid();
        const targetIndex = 0;
        const newState = insertRowDataAtIndex(mockStates.default, insertDataWithSixValues, targetIndex, MockRichTextBlock, newRowId);

        newState.rows.forEach((row) => {
            if (row.id === newRowId) {
                return;
            }

            expect(getPlainTextFromState(row.cellValues[4].value)).toBe("");
            expect(getPlainTextFromState(row.cellValues[5].value)).toBe("");
        });
    });
});
