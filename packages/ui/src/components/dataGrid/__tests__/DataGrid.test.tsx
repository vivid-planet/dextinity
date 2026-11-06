import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DataGrid, type DataGridColumn } from "../DataGrid";

afterEach(cleanup);

interface Row {
    id: string;
    name: string;
    count: number;
}

const rows: Row[] = [
    { id: "a", name: "Alpha", count: 1 },
    { id: "b", name: "Beta", count: 2 },
];

const columns: DataGridColumn<Row>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "count", header: "Count", align: "end", priority: "low" },
];

function getRowId(row: Row) {
    return row.id;
}

describe("DataGrid", () => {
    it("drops its own surface with the plain variant", () => {
        const { container } = render(<DataGrid aria-label="Items" columns={columns} rows={rows} getRowId={getRowId} variant="plain" />);

        expect((container.firstElementChild as HTMLElement).getAttribute("data-variant")).toBe("plain");
    });

    it("emits the root class and owner state", () => {
        const { container } = render(
            <DataGrid aria-label="Items" columns={columns} rows={rows} getRowId={getRowId} selectable onRowClick={() => {}} />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityDataGrid");
        expect(root.hasAttribute("data-selectable")).toBe(true);
        expect(root.hasAttribute("data-clickable")).toBe(true);
        expect(root.hasAttribute("data-loading")).toBe(false);
        expect(root.getAttribute("data-variant")).toBe("surface");
        expect(screen.getByRole("table", { name: "Items" }).className).toContain("dextinityDataGrid__table");
    });

    it("renders cells from the row by key, with the column's alignment and priority", () => {
        render(<DataGrid aria-label="Items" columns={columns} rows={rows} getRowId={getRowId} />);

        const cell = screen.getByRole("cell", { name: "2" });
        expect(cell.className).toContain("dextinityDataGrid__cell");
        expect([cell.dataset.align, cell.dataset.priority]).toStrictEqual(["end", "low"]);
    });

    it("marks selected rows and the sorted column", () => {
        render(
            <DataGrid
                aria-label="Items"
                columns={columns}
                rows={rows}
                getRowId={getRowId}
                selectable
                selectedIds={["b"]}
                sort={{ key: "name", direction: "desc" }}
            />,
        );

        expect(screen.getByRole("row", { name: /Beta/ }).hasAttribute("data-selected")).toBe(true);
        expect(screen.getByRole("row", { name: /Alpha/ }).hasAttribute("data-selected")).toBe(false);
        expect(screen.getByRole("columnheader", { name: "Name" }).getAttribute("aria-sort")).toBe("descending");
    });

    it("marks the table busy while loading, and empty without rows", () => {
        const { container, rerender } = render(<DataGrid aria-label="Items" columns={columns} rows={[]} getRowId={getRowId} loading />);
        expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("true");

        rerender(<DataGrid aria-label="Items" columns={columns} rows={[]} getRowId={getRowId} emptyState="Nothing here" />);
        expect((container.firstElementChild as HTMLElement).hasAttribute("data-empty")).toBe(true);
        expect(screen.getByText("Nothing here").className).toContain("dextinityDataGrid__emptyCell");
    });

    it("emits the owner state and part classes of editing, reordering, and expanding", () => {
        const { container } = render(
            <DataGrid
                aria-label="Items"
                columns={[{ ...columns[0], editable: true }, columns[1]]}
                rows={rows}
                getRowId={getRowId}
                onRowReorder={() => {}}
                renderRowDetail={(row) => `Details of ${row.name}`}
                expandedRowIds={["a"]}
            />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect([root.hasAttribute("data-editable"), root.hasAttribute("data-reorderable"), root.hasAttribute("data-expandable")]).toStrictEqual([
            true,
            true,
            true,
        ]);
        expect(screen.getByRole("grid", { name: "Items" })).toBeTruthy();
        const editableCell = screen.getByText("Alpha").closest("td") as HTMLElement;
        expect([editableCell.hasAttribute("data-editable"), editableCell.dataset.editor, editableCell.tabIndex]).toStrictEqual([true, "text", 0]);
        expect((screen.getByText("Beta").closest("td") as HTMLElement).tabIndex).toBe(-1);
        expect(screen.getByRole("button", { name: "Move Alpha" }).className).toContain("dextinityDataGrid__grip");
        expect(screen.getByRole("button", { name: "Expand Alpha" }).getAttribute("aria-expanded")).toBe("true");
        expect(screen.getByText("Details of Alpha").className).toContain("dextinityDataGrid__detailCell");
    });

    it("leaves out hidden columns and shows sub rows of expanded rows only", () => {
        render(
            <DataGrid
                aria-label="Items"
                columns={columns}
                rows={[{ id: "p", name: "Parent", count: 3, children: rows }]}
                getRowId={getRowId}
                getSubRows={(row: Row & { children?: Row[] }) => row.children}
                expandedRowIds={[]}
                columnVisibility={{ count: false }}
            />,
        );

        expect(screen.queryByRole("columnheader", { name: "Count" })).toBeNull();
        expect(screen.queryByText("Alpha")).toBeNull();
        expect(screen.getByRole("button", { name: "Expand Parent" }).getAttribute("aria-expanded")).toBe("false");
    });
});
