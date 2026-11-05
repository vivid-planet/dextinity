import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Pagination } from "./Pagination";

afterEach(cleanup);

function noop() {}

function visiblePages() {
    return screen.getAllByRole("button", { name: /^Page / }).map((button) => button.textContent);
}

describe("Pagination", () => {
    it("emits the root class with the page and page count", () => {
        render(<Pagination page={2} pageSize={10} total={47} onPageChange={noop} />);

        const root = screen.getByRole("navigation", { name: "Pagination" });
        expect(root.className).toContain("dextinityPagination");
        expect([root.dataset.page, root.dataset.pagecount]).toStrictEqual(["2", "5"]);
    });

    it("shows the first, last, and neighboring pages, collapsing the rest", () => {
        render(<Pagination page={10} pageSize={10} total={200} onPageChange={noop} />);

        expect(visiblePages()).toStrictEqual(["1", "9", "10", "11", "20"]);
        expect(screen.getByRole("button", { name: "Page 10" }).getAttribute("aria-current")).toBe("page");
    });

    it("fills a gap of a single page instead of collapsing it", () => {
        render(<Pagination page={4} pageSize={10} total={70} onPageChange={noop} />);

        expect(visiblePages()).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
    });

    it("shows an empty range without entries", () => {
        render(<Pagination page={1} pageSize={10} total={0} onPageChange={noop} />);

        expect(screen.getByText("0–0 of 0")).toBeTruthy();
    });
});
