import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FilterChip } from "./FilterChip";

afterEach(cleanup);

describe("FilterChip", () => {
    it("emits the selected, disabled, and menu state on the root", () => {
        render(
            <FilterChip selected onClick={vi.fn()} hasMenu disabled>
                Author
            </FilterChip>,
        );

        const root = screen.getByRole("button", { name: "Author" });
        expect(root.className).toContain("dextinityFilterChip");
        expect([root.dataset.selected, root.dataset.hasmenu, root.dataset.disabled]).toStrictEqual(["", "", ""]);
        expect(root.getAttribute("aria-pressed")).toBe("true");
    });

    it("names the chip by its label and count", () => {
        render(
            <FilterChip selected={false} onClick={vi.fn()} status="published" count={8}>
                Published
            </FilterChip>,
        );

        const root = screen.getByRole("button", { name: "Published 8" });
        expect(root.getAttribute("aria-pressed")).toBe("false");
        expect(root.querySelector(".dextinityFilterChip__count")?.textContent).toBe("8");
    });
});
