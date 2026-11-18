import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { RadioGroup } from "../RadioGroup";

afterEach(cleanup);

const options = [
    { value: "full-time", label: "Full-time", description: "40 hours" },
    { value: "part-time", label: "Part-time" },
];

describe("RadioGroup", () => {
    it("emits the variant, orientation, and required state on the root", () => {
        const { container } = render(
            <Field label="Employment" layout="group" required>
                <RadioGroup options={options} value={null} onChange={vi.fn()} variant="card" orientation="horizontal" />
            </Field>,
        );

        const root = container.querySelector<HTMLElement>(".dextinityRadioGroup");
        expect([root?.dataset.variant, root?.dataset.orientation, root?.dataset.invalid, root?.dataset.required]).toStrictEqual([
            "card",
            "horizontal",
            undefined,
            "",
        ]);
        expect(screen.getByRole("radio", { name: "Full-time" }).className).toContain("dextinityRadioGroup__control");
    });

    it("follows the surrounding field and connects the descriptions", () => {
        render(
            <Field label="Employment" layout="group" readOnly state="error" validationMessage="Choose one.">
                <RadioGroup options={options} value="part-time" onChange={vi.fn()} aria-describedby="hint" />
            </Field>,
        );

        const group = screen.getByRole("radiogroup", { name: "Employment" });
        expect(group.getAttribute("aria-invalid")).toBe("true");
        expect(group.getAttribute("aria-readonly")).toBe("true");
        const [messageId, hintId] = (group.getAttribute("aria-describedby") ?? "").split(" ");
        expect(hintId).toBe("hint");
        expect(document.getElementById(messageId)?.textContent).toBe("Choose one.");
        expect(screen.getByRole("radio", { name: "Full-time" })).toHaveAccessibleDescription("40 hours");
        expect(screen.getByRole("radio", { name: "Part-time" }).getAttribute("aria-checked")).toBe("true");
    });

    it("takes its name from aria-label on its own", () => {
        render(<RadioGroup aria-label="Employment" options={options} value={null} onChange={vi.fn()} />);

        expect(screen.getByRole("radiogroup", { name: "Employment" })).toBeInTheDocument();
    });
});
