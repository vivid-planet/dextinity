import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RadioGroup } from "../RadioGroup";

afterEach(cleanup);

const options = [
    { value: "full-time", label: "Full-time", description: "40 hours" },
    { value: "part-time", label: "Part-time" },
];

describe("RadioGroup", () => {
    it("emits the variant, orientation, and state on the root", () => {
        const { container } = render(
            <RadioGroup label="Employment" options={options} value={null} onChange={vi.fn()} variant="card" orientation="horizontal" required />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityRadioGroup");
        expect([root.dataset.variant, root.dataset.orientation, root.dataset.state, root.dataset.required]).toStrictEqual([
            "card",
            "horizontal",
            "default",
            "",
        ]);
        expect(screen.getByRole("radio", { name: "Full-time" }).className).toContain("dextinityRadioGroup__control");
    });

    it("names the group by its label and connects the message and the descriptions", () => {
        render(
            <RadioGroup
                label="Employment"
                options={options}
                value="part-time"
                onChange={vi.fn()}
                state="error"
                validationMessage="Choose one."
                aria-describedby="hint"
            />,
        );

        const group = screen.getByRole("radiogroup", { name: "Employment" });
        expect(group.getAttribute("aria-invalid")).toBe("true");
        const [hintId, messageId] = (group.getAttribute("aria-describedby") ?? "").split(" ");
        expect(hintId).toBe("hint");
        expect(document.getElementById(messageId)?.className).toBe("dextinityRadioGroup__message");
        expect(screen.getByRole("radio", { name: "Full-time" })).toHaveAccessibleDescription("40 hours");
        expect(screen.getByRole("radio", { name: "Part-time" }).getAttribute("aria-checked")).toBe("true");
    });

    it("shows the help until a validation message replaces it", () => {
        const { rerender } = render(<RadioGroup aria-label="Employment" options={options} value={null} onChange={vi.fn()} helperText="Help" />);
        expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription("Help");

        rerender(
            <RadioGroup
                aria-label="Employment"
                options={options}
                value={null}
                onChange={vi.fn()}
                helperText="Help"
                state="error"
                validationMessage="Choose one."
            />,
        );
        expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription("Choose one.");
        expect(screen.queryByText("Help")).toBeNull();
    });
});
