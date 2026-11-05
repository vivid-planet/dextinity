import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./SegmentedControl";

const options = [
    { value: "full", label: "Full-time" },
    { value: "part", label: "Part-time" },
];

afterEach(cleanup);

describe("SegmentedControl", () => {
    it("emits the size and disabled state on the root", () => {
        render(<SegmentedControl aria-label="Employment" options={options} value="full" onChange={vi.fn()} size="small" disabled />);

        const root = screen.getByRole("group", { name: "Employment" });
        expect(root.className).toContain("dextinitySegmentedControl");
        expect([root.dataset.size, root.dataset.disabled]).toStrictEqual(["small", ""]);
    });

    it("marks the chosen option as pressed", () => {
        render(<SegmentedControl aria-label="Employment" options={options} value="part" onChange={vi.fn()} />);

        expect(screen.getAllByRole("button").map((option) => option.getAttribute("aria-pressed"))).toStrictEqual(["false", "true"]);
        expect(screen.getByRole("button", { name: "Part-time" }).className).toContain("dextinitySegmentedControl__option");
    });
});
