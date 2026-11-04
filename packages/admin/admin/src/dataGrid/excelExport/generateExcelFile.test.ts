import { describe, expect, it } from "vitest";

import type { GridColDef } from "../GridColDef";
import { generateExcelFile } from "./generateExcelFile";

type TestRow = {
    id: string;
    group?: {
        id: string;
        description: string;
    };
};

describe("generateExcelFile", () => {
    it("exports the singleSelect label when no valueFormatter is configured", () => {
        const columns: Array<GridColDef<TestRow>> = [
            {
                field: "group",
                headerName: "Group",
                type: "singleSelect",
                valueOptions: [{ value: "group-id", label: "Group label" }],
                valueGetter: (_value, row) => row.group?.id,
            },
        ];

        const workbook = generateExcelFile(columns, [{ id: "row-1", group: { id: "group-id", description: "Group label" } }], {
            worksheetName: "Groups",
        });

        const worksheet = workbook.getWorksheet("Groups");

        expect(worksheet).toBeDefined();
        expect(worksheet?.getRow(2).getCell(1).value).toBe("Group label");
    });

    it("keeps using valueFormatter for singleSelect columns when provided", () => {
        const columns: Array<GridColDef<TestRow>> = [
            {
                field: "group",
                headerName: "Group",
                type: "singleSelect",
                valueOptions: [{ value: "group-id", label: "Group label" }],
                valueGetter: (_value, row) => row.group?.id,
                valueFormatter: (value) => `Formatted ${value}`,
            },
        ];

        const workbook = generateExcelFile(columns, [{ id: "row-1", group: { id: "group-id", description: "Group label" } }], {
            worksheetName: "Groups",
        });

        const worksheet = workbook.getWorksheet("Groups");

        expect(worksheet).toBeDefined();
        expect(worksheet?.getRow(2).getCell(1).value).toBe("Formatted group-id");
    });
});
