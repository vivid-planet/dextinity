import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef, type RefAttributes } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TableBody } from "../TableBody";
import { TableCell } from "../TableCell";
import { TableHeader } from "../TableHeader";
import { TableHeaderCell } from "../TableHeaderCell";
import { TableRoot, type TableRootProps } from "../TableRoot";
import { TableRow } from "../TableRow";

afterEach(cleanup);

const columns: TableRootProps["columns"] = [{ id: "title" }, { id: "applicants", width: 120, align: "end" }, { id: "status", width: 160 }];

const defaultRow = (
    <TableRow>
        <TableCell columnId="title">Senior UX Designer</TableCell>
    </TableRow>
);

function renderTable(props: Partial<TableRootProps & RefAttributes<HTMLTableElement>> = {}, body = defaultRow) {
    return render(
        <TableRoot aria-label="Job ads" columns={columns} {...props}>
            <TableHeader className="consumer-header" slotProps={{ row: { className: "consumer-header-row" } }}>
                <TableHeaderCell columnId="title" className="consumer-header-cell">
                    Title
                </TableHeaderCell>
                <TableHeaderCell columnId="applicants">Applicants</TableHeaderCell>
                <TableHeaderCell columnId="status">Status</TableHeaderCell>
            </TableHeader>
            <TableBody className="consumer-body">{body}</TableBody>
        </TableRoot>,
    );
}

describe("TableRoot", () => {
    it("renders the contract classes and passes the table props and ref to the table", () => {
        const ref = createRef<HTMLTableElement>();
        const scrollerRef = createRef<HTMLDivElement>();
        const tableSlotRef = createRef<HTMLTableElement>();
        const { container } = renderTable({
            ref,
            className: "consumer-class",
            summary: "Open job ads",
            slotProps: {
                root: { id: "root-id" },
                scroller: { className: "consumer-scroller", ref: scrollerRef },
                table: { className: "consumer-table", ref: tableSlotRef },
            },
        });

        const root = container.firstElementChild as HTMLElement;
        const table = screen.getByRole("table", { name: "Job ads" });
        expect(root.className).toContain("dextinityTableRoot");
        expect(root.className).toContain("consumer-class");
        expect(root.id).toBe("root-id");
        expect(ref.current).toBe(table);
        expect(tableSlotRef.current).toBe(table);
        expect(scrollerRef.current).toBe(table.parentElement);
        expect(table).toHaveAttribute("summary", "Open job ads");
        expect(table.className).toContain("dextinityTableRoot__table");
        expect(table.className).toContain("consumer-table");
        expect(table.parentElement?.className).toContain("dextinityTableRoot__scroller");
        expect(table.parentElement?.className).toContain("consumer-scroller");
    });

    it("warns in development when the table has no name", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        renderTable({ "aria-label": undefined });

        expect(warn).toHaveBeenCalledWith(expect.stringContaining("aria-label"));
        warn.mockRestore();
    });
});

describe("Table parts", () => {
    it("render the contract classes and align the cells with their column", () => {
        renderTable(
            {},
            <TableRow className="consumer-row">
                <TableCell columnId="title" className="consumer-cell">
                    Senior UX Designer
                </TableCell>
                <TableCell columnId="applicants">12</TableCell>
                <TableCell columnId="status">Published</TableCell>
            </TableRow>,
        );

        const header = screen.getByRole("columnheader", { name: "Title" });
        const applicantsHeader = screen.getByRole("columnheader", { name: "Applicants" });
        const row = screen.getByRole("row", { name: /Senior UX Designer/ });
        const cell = screen.getByRole("cell", { name: "Senior UX Designer" });
        expect(header.className).toContain("dextinityTableHeaderCell");
        expect(header.className).toContain("consumer-header-cell");
        expect(header).toHaveAttribute("scope", "col");
        expect([header.dataset.align, applicantsHeader.dataset.align]).toStrictEqual(["start", "end"]);
        expect(header.parentElement?.className).toContain("dextinityTableHeader__row");
        expect(header.parentElement?.className).toContain("consumer-header-row");
        expect(header.parentElement?.parentElement?.className).toContain("dextinityTableHeader");
        expect(header.parentElement?.parentElement?.className).toContain("consumer-header");
        expect(row.className).toContain("dextinityTableRow");
        expect(row.className).toContain("consumer-row");
        expect(row.parentElement?.className).toContain("dextinityTableBody");
        expect(row.parentElement?.className).toContain("consumer-body");
        expect(cell.className).toContain("dextinityTableCell");
        expect(cell.className).toContain("consumer-cell");
        expect([cell.dataset.align, screen.getByRole("cell", { name: "12" }).dataset.align]).toStrictEqual(["start", "end"]);
    });

    it("warn in development when a cell names no column of the table", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        renderTable(
            {},
            <TableRow>
                <TableCell columnId="missing">Senior UX Designer</TableCell>
            </TableRow>,
        );

        expect(within(screen.getByRole("row", { name: /Senior/ })).getByRole("cell").dataset.align).toBe("start");
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('"missing"'));
        warn.mockRestore();
    });
});
