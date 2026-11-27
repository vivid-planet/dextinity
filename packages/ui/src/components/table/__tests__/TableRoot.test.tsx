import { act, cleanup, render, screen, within } from "@testing-library/react";
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
        const rootRef = createRef<HTMLDivElement>();
        const scrollerRef = createRef<HTMLDivElement>();
        const tableSlotRef = createRef<HTMLTableElement>();
        const { container } = renderTable({
            ref,
            className: "consumer-class",
            summary: "Open job ads",
            slotProps: {
                root: { id: "root-id", ref: rootRef },
                scroller: { className: "consumer-scroller", ref: scrollerRef },
                table: { className: "consumer-table", ref: tableSlotRef },
            },
        });

        const root = container.firstElementChild as HTMLElement;
        const table = screen.getByRole("table", { name: "Job ads" });
        expect(root.className).toContain("dextinityTableRoot");
        expect(root.className).toContain("consumer-class");
        expect(root.id).toBe("root-id");
        expect(rootRef.current).toBe(root);
        expect(root.dataset.overflowing).toBeUndefined();
        expect(ref.current).toBe(table);
        expect(tableSlotRef.current).toBe(table);
        expect(scrollerRef.current).toBe(table.parentElement);
        expect(table).toHaveAttribute("summary", "Open job ads");
        expect(table.className).toContain("dextinityTableRoot__table");
        expect(table.className).toContain("consumer-table");
        expect(table.parentElement?.className).toContain("dextinityTableRoot__scroller");
        expect(table.parentElement?.className).toContain("consumer-scroller");
        expect(table.parentElement?.parentElement?.className).toContain("dextinityTableRoot__scrollerFrame");
    });

    it("renders the toolbar and the sticky state", () => {
        const toolbarRef = createRef<HTMLDivElement>();
        const { container, rerender } = renderTable({
            toolbar: "24 job ads",
            stickyToolbar: true,
            slotProps: { toolbar: { className: "consumer-toolbar", ref: toolbarRef } },
        });

        const root = container.firstElementChild as HTMLElement;
        const toolbar = screen.getByText("24 job ads");
        expect(toolbar.className).toContain("dextinityTableRoot__toolbar");
        expect(toolbar.className).toContain("consumer-toolbar");
        expect(toolbarRef.current).toBe(toolbar);
        expect(root.dataset.stickyheader).toBe("");
        expect(root.dataset.stickytoolbar).toBe("");

        rerender(
            <TableRoot aria-label="Job ads" columns={columns} stickyHeader={false} stickyToolbar>
                {defaultRow}
            </TableRoot>,
        );
        expect(root.dataset.stickyheader).toBeUndefined();
        expect(root.dataset.stickytoolbar).toBeUndefined();
    });

    it("warns in development when the table has no name", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        renderTable({ "aria-label": undefined });

        expect(warn).toHaveBeenCalledWith(expect.stringContaining("aria-label"));
        warn.mockRestore();
    });

    it("links to the end of the table with a skip link named after the table", () => {
        const skipTargetRef = createRef<HTMLSpanElement>();
        const { container } = renderTable({ slotProps: { skipLink: { className: "consumer-skip-link" }, skipTarget: { ref: skipTargetRef } } });

        const skipLink = screen.getByRole("link", { name: "Skip table Job ads" });
        const skipTarget = container.querySelector(".dextinityTableRoot__skipTarget");
        expect(skipLink.className).toContain("dextinityTableRoot__skipLink");
        expect(skipLink.className).toContain("consumer-skip-link");
        expect(skipLink.getAttribute("href")).toBe(`#${skipTarget?.id}`);
        expect(skipTarget?.textContent).toBe("End of table Job ads");
        expect(skipTargetRef.current).toBe(skipTarget);
    });

    it("names the skip link after the elements that name the table, with the labels", () => {
        render(
            <>
                <h2 id="jobs-heading">Open jobs</h2>
                <TableRoot
                    aria-labelledby="jobs-heading"
                    columns={columns}
                    labels={{ skipTable: (tableName) => `Tabelle ${tableName} überspringen` }}
                >
                    <TableBody>{defaultRow}</TableBody>
                </TableRoot>
            </>,
        );

        expect(screen.getByRole("link", { name: "Tabelle Open jobs überspringen" })).toBeInTheDocument();
        expect(screen.getByText("End of table Open jobs")).toBeInTheDocument();
    });

    it("keeps the skip link's name in step with the elements that name the table", async () => {
        const renderWithHeading = (hasHeading: boolean) => (
            <>
                {hasHeading && <h2 id="jobs-heading">Open jobs (0)</h2>}
                <TableRoot aria-labelledby="jobs-heading" columns={columns}>
                    <TableBody>{defaultRow}</TableBody>
                </TableRoot>
            </>
        );
        const { rerender } = render(renderWithHeading(false));
        expect(screen.getByRole("link", { name: "Skip table" })).toBeInTheDocument();

        rerender(renderWithHeading(true));
        expect(screen.getByRole("link", { name: "Skip table Open jobs (0)" })).toBeInTheDocument();

        await act(async () => {
            screen.getByRole("heading").textContent = "Open jobs (24)";
        });
        expect(screen.getByRole("link", { name: "Skip table Open jobs (24)" })).toBeInTheDocument();
        expect(screen.getByText("End of table Open jobs (24)")).toBeInTheDocument();
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
