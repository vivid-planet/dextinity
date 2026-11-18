import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FilterBar } from "../FilterBar";

afterEach(cleanup);

describe("FilterBar", () => {
    it("renders the contract classes and marks an active search", () => {
        render(
            <FilterBar className="consumer-class" searchValue="design" onSearchChange={() => {}} resultCount={2}>
                <button type="button">All</button>
            </FilterBar>,
        );

        const root = screen.getByRole("search");
        expect(root.className).toContain("dextinityFilterBar");
        expect(root.className).toContain("consumer-class");
        expect(root).toHaveAttribute("data-searching");
        expect(screen.getByRole("searchbox").className).toContain("dextinityFilterBar__input");
        expect(screen.getByRole("group", { name: "Filters" }).className).toContain("dextinityFilterBar__filters");
        expect(screen.getByRole("status")).toHaveTextContent("2 results");
    });

    it("puts start before the search, in its contract part", () => {
        render(<FilterBar searchValue="" onSearchChange={() => {}} start={<input type="checkbox" aria-label="Select all" />} />);

        const start = screen.getByRole("checkbox", { name: "Select all" }).parentElement as HTMLElement;
        expect(start.className).toContain("dextinityFilterBar__start");
        expect(start.nextElementSibling?.contains(screen.getByRole("searchbox"))).toBe(true);
    });
});
