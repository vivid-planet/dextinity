import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderTipTapRichText, type TipTapNode } from "./TipTapRichTextRenderer";

const cell = (text: string, type: "tableCell" | "tableHeader" = "tableCell", attrs?: Record<string, unknown>): TipTapNode => ({
    type,
    attrs,
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

const table = (rows: TipTapNode[][]): TipTapNode => ({
    type: "doc",
    content: [{ type: "table", content: rows.map((cells) => ({ type: "tableRow", content: cells })) }],
});

const render = (content: TipTapNode) => renderToStaticMarkup(<>{renderTipTapRichText({ content })}</>);

describe("renderTipTapRichText tables", () => {
    it("renders a leading all-header row as thead and the rest as tbody", () => {
        const html = render(
            table([
                [cell("Name", "tableHeader"), cell("Role", "tableHeader")],
                [cell("Ada"), cell("Engineer")],
            ]),
        );

        expect(html).toBe(
            '<table><thead><tr><th scope="col"><p>Name</p></th><th scope="col"><p>Role</p></th></tr></thead>' +
                "<tbody><tr><td><p>Ada</p></td><td><p>Engineer</p></td></tr></tbody></table>",
        );
    });

    it("renders every row in tbody when there is no header row", () => {
        const html = render(table([[cell("a"), cell("b")]]));

        expect(html).toBe("<table><tbody><tr><td><p>a</p></td><td><p>b</p></td></tr></tbody></table>");
    });

    it("uses scope=row for a header cell in a mixed row", () => {
        const html = render(table([[cell("Name", "tableHeader"), cell("Ada")]]));

        expect(html).toContain('<th scope="row"><p>Name</p></th>');
    });

    it("renders colspan and rowspan only when they span more than one cell", () => {
        // HTML attribute names are case-insensitive, so React's camelCase output parses correctly.
        const html = render(table([[cell("wide", "tableCell", { colspan: 2, rowspan: 1 }), cell("tall", "tableCell", { colspan: 1, rowspan: 3 })]]));

        expect(html).toContain('<td colSpan="2"><p>wide</p></td>');
        expect(html).toContain('<td rowSpan="3"><p>tall</p></td>');
    });

    it("renders a colgroup when every column has a stored width", () => {
        const html = render(table([[cell("a", "tableCell", { colwidth: [120] }), cell("b", "tableCell", { colwidth: [240] })]]));

        expect(html).toContain('<colgroup><col style="width:120px"/><col style="width:240px"/></colgroup>');
    });

    it("omits the colgroup when a column has no stored width", () => {
        const html = render(table([[cell("a", "tableCell", { colwidth: [120] }), cell("b")]]));

        expect(html).not.toContain("<colgroup>");
    });
});
