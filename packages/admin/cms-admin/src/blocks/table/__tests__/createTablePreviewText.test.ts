import { describe, expect, it } from "vitest";

import type { TableBlockState } from "../../createTableBlock";
import { createTablePreviewText } from "../utils/createTablePreviewText";

const getCellTexts = (cellState: string) => [cellState];

const createState = (rows: string[][]): TableBlockState<string> => {
    const columns: TableBlockState<string>["columns"] = rows[0].map((_, columnIndex) => ({
        id: `column-${columnIndex}`,
        size: "standard",
        highlighted: false,
    }));

    return {
        columns,
        rows: rows.map((cells, rowIndex) => ({
            id: `row-${rowIndex}`,
            highlighted: false,
            cellValues: cells.map((value, columnIndex) => ({ columnId: columns[columnIndex].id, value })).reverse(),
        })),
    };
};

describe("createTablePreviewText", () => {
    it("lists the cell texts row by row in column order and skips empty cells", () => {
        const state = createState([
            ["Name", "Email", "Role"],
            ["Ada", "", "Admin"],
        ]);

        expect(createTablePreviewText(state, getCellTexts)).toBe("Name, Email, Role, Ada, Admin");
    });
});
