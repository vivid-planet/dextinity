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
        const { container } = render(
            <SegmentedControl aria-label="Employment" options={options} value="full" onChange={vi.fn()} size="small" disabled />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinitySegmentedControl");
        expect([root.dataset.size, root.dataset.disabled]).toStrictEqual(["small", ""]);
        expect(screen.getByRole("group", { name: "Employment" }).className).toContain("dextinitySegmentedControl__group");
    });

    it("marks the chosen option as pressed", () => {
        render(<SegmentedControl aria-label="Employment" options={options} value="part" onChange={vi.fn()} />);

        expect(screen.getAllByRole("button").map((option) => option.getAttribute("aria-pressed"))).toStrictEqual(["false", "true"]);
        expect(screen.getByRole("button", { name: "Part-time" }).className).toContain("dextinitySegmentedControl__option");
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
        const group = screen.getByRole("group", { name: "Employment" });
        expect(group.getAttribute("aria-invalid")).toBe("true");
        const message = document.getElementById(group.getAttribute("aria-describedby") ?? "");
        expect([message?.className, message?.textContent]).toStrictEqual(["dextinitySegmentedControl__message", "Choose one."]);
    });
});
