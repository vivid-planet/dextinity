import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { FilterChip } from "../FilterChip";

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
            <FilterChip selected={false} onClick={vi.fn()} startAdornment={<StatusIndicator status="published" decorative />} count={8}>
                Published
            </FilterChip>,
        );

        const root = screen.getByRole("button", { name: "Published 8" });
        expect(root.getAttribute("aria-pressed")).toBe("false");
        expect(root.querySelector(".dextinityFilterChip__count")?.textContent).toBe("8");
    });

    it("renders the adornments around the label, before the count and the chevron", () => {
        render(
            <FilterChip
                selected={false}
                onClick={vi.fn()}
                startAdornment={<span>start</span>}
                endAdornment={<span>end</span>}
                count={3}
                hasMenu
                slotProps={{ startAdornment: { id: "start" }, endAdornment: { id: "end" } }}
            >
                Label
            </FilterChip>,
        );

        const root = screen.getByRole("button");
        expect(Array.from(root.children, (child) => child.className)).toStrictEqual([
            "dextinityFilterChip__startAdornment",
            "dextinityFilterChip__label",
            "dextinityFilterChip__endAdornment",
            "dextinityFilterChip__count",
            "dextinityFilterChip__menuIcon",
        ]);
        expect([root.children[0]?.id, root.children[2]?.id, root.textContent]).toStrictEqual(["start", "end", "startLabelend3"]);
    });

    it("renders no adornment wrappers without adornments", () => {
        render(
            <FilterChip selected={false} onClick={vi.fn()} startAdornment={false} endAdornment={null}>
                Label
            </FilterChip>,
        );

        expect(screen.getByRole("button").children).toHaveLength(1);
    });
});
