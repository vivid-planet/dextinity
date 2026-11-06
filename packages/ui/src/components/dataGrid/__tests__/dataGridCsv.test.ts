import { describe, expect, it } from "vitest";

import type { DataGridColumn } from "../DataGrid";
import { getDataGridCsv } from "../dataGridCsv";

interface Row {
    id: string;
    name: string;
    count: number | null;
    status: string;
    children?: Row[];
}

const columns: DataGridColumn<Row>[] = [
    { key: "name", header: "Name" },
    { key: "count", header: "Count" },
    { key: "status", header: "Status", editor: { type: "select", options: [{ value: "draft", label: "Draft" }] } },
];

describe("getDataGridCsv", () => {
    it("exports the shown columns with headers, the option labels of select editors, and empty values", () => {
        const csv = getDataGridCsv({
            columns,
            rows: [
                { id: "a", name: "Alpha", count: 1, status: "draft" },
                { id: "b", name: "Beta", count: null, status: "live" },
            ],
            columnVisibility: { count: false },
        });

        expect(csv).toBe("Name,Status\r\nAlpha,Draft\r\nBeta,live");
    });

    it("quotes separators, quotes, and line breaks, and keeps formula-like text as text", () => {
        const csv = getDataGridCsv({
            columns: columns.slice(0, 2),
            rows: [
                { id: "a", name: 'Say "hi", then go', count: -2, status: "" },
                { id: "b", name: "=SUM(A1)\nnext", count: 3, status: "" },
            ],
        });

        expect(csv.split("\r\n")).toStrictEqual(["Name,Count", '"Say ""hi"", then go",-2', '"\'=SUM(A1)\nnext",3']);
    });

    it("uses the column's export value, the separator, and exports sub rows below their parent", () => {
        const csv = getDataGridCsv({
            columns: [{ ...columns[0], exportValue: (row) => row.name.toUpperCase() }, columns[1]],
            rows: [{ id: "a", name: "Alpha", count: 1.5, status: "", children: [{ id: "b", name: "Beta", count: 2, status: "" }] }],
            getSubRows: (row) => row.children,
            separator: ";",
        });

        expect(csv).toBe("Name;Count\r\nALPHA;1.5\r\nBETA;2");
    });
});
