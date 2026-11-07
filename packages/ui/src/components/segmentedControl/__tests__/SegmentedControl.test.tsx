import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "../SegmentedControl";

const options = [
    { value: "full", label: "Full-time" },
    { value: "part", label: "Part-time" },
];

afterEach(cleanup);

describe("SegmentedControl", () => {
    it("emits the size and disabled state on the root", () => {
        const { container } = render(
            <SegmentedControl aria-label="Employment" options={options} value="full" onChange={vi.fn()} size="small" disabled />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinitySegmentedControl");
        expect([root.dataset.size, root.dataset.disabled]).toStrictEqual(["small", ""]);
        expect(screen.getByRole("radiogroup", { name: "Employment" }).className).toContain("dextinitySegmentedControl__group");
    });

    it("marks the chosen option as checked", () => {
        render(<SegmentedControl aria-label="Employment" options={options} value="part" onChange={vi.fn()} />);

        expect(screen.getAllByRole("radio").map((option) => option.getAttribute("aria-checked"))).toStrictEqual(["false", "true"]);
        expect(screen.getByRole("radio", { name: "Part-time" }).className).toContain("dextinitySegmentedControl__option");
    });

    it("shows the chosen option and a menu of the options when they don't fit", () => {
        const resizeObserver = globalThis.ResizeObserver;
        globalThis.ResizeObserver = class {
            observe() {}
            disconnect() {}
            unobserve() {}
        };
        const offsetWidth = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(400);
        const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(200);
        try {
            const { container } = render(<SegmentedControl aria-label="Employment" options={options} value="part" onChange={vi.fn()} />);

            expect((container.firstElementChild as HTMLElement).dataset.collapsed).toBe("");
            const trigger = screen.getByRole("button", { name: "Employment Part-time" });
            expect(trigger.className).toContain("dextinitySegmentedControl__menuTrigger");
            expect(screen.queryByRole("radiogroup")).toBeNull();
        } finally {
            offsetWidth.mockRestore();
            clientWidth.mockRestore();
            globalThis.ResizeObserver = resizeObserver;
        }
    });

    it("keeps wrapping the options with overflow wrap", () => {
        const offsetWidth = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(400);
        try {
            const { container } = render(
                <SegmentedControl aria-label="Employment" options={options} value="part" onChange={vi.fn()} overflow="wrap" />,
            );

            expect((container.firstElementChild as HTMLElement).dataset.collapsed).toBeUndefined();
            expect(screen.getByRole("radiogroup", { name: "Employment" })).toBeTruthy();
        } finally {
            offsetWidth.mockRestore();
        }
    });

    it("connects the validation message to the group", () => {
        const { container } = render(
            <SegmentedControl
                aria-label="Employment"
                options={options}
                value="full"
                onChange={vi.fn()}
                state="error"
                validationMessage="Choose one."
            />,
        );

        expect((container.firstElementChild as HTMLElement).dataset.state).toBe("error");
        const group = screen.getByRole("radiogroup", { name: "Employment" });
        expect(group.getAttribute("aria-invalid")).toBe("true");
        const message = document.getElementById(group.getAttribute("aria-describedby") ?? "");
        expect([message?.className, message?.textContent]).toStrictEqual(["dextinitySegmentedControl__message", "Choose one."]);
    });
});
