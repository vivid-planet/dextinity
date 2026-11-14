import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { Checkbox } from "../Checkbox";

afterEach(cleanup);

describe("Checkbox", () => {
    it("emits the checked, indeterminate, and disabled state on the root", () => {
        const { container } = render(
            <Checkbox checked onChange={vi.fn()} indeterminate disabled>
                Select all
            </Checkbox>,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityCheckbox");
        expect([root.dataset.checked, root.dataset.indeterminate, root.dataset.disabled]).toStrictEqual(["", "", ""]);
    });

    it("reports a partial selection as mixed", () => {
        render(<Checkbox checked={false} onChange={vi.fn()} indeterminate aria-label="Select all" />);

        const control = screen.getByRole("checkbox", { name: "Select all" });
        expect(control.getAttribute("aria-checked")).toBe("mixed");
        expect(control.className).toContain("dextinityCheckbox__control");
    });

    it("follows the surrounding field and keeps its own text as its name", () => {
        const { container } = render(
            <Field layout="group" required disabled state="error" validationMessage="Accept the terms to continue.">
                <Checkbox checked={false} onChange={vi.fn()} aria-describedby="hint">
                    Accept terms
                </Checkbox>
            </Field>,
        );

        const root = container.querySelector<HTMLElement>(".dextinityCheckbox");
        expect([root?.dataset.invalid, root?.dataset.required]).toStrictEqual(["", ""]);
        const control = screen.getByRole("checkbox", { name: "Accept terms" });
        expect([control.getAttribute("aria-invalid"), control.getAttribute("aria-required")]).toStrictEqual(["true", "true"]);
        expect(control).toHaveAttribute("aria-disabled", "true");
        const [messageId, hintId] = (control.getAttribute("aria-describedby") ?? "").split(" ");
        expect(hintId).toBe("hint");
        expect(document.getElementById(messageId)?.textContent).toBe("Accept the terms to continue.");
        expect(screen.getByText("Accept terms").closest("label")?.className).toBe("dextinityCheckbox__row");
    });

    it("takes the field's label as its name only without its own text", () => {
        render(
            <Field label="Newsletter" layout="group">
                <Checkbox checked={false} onChange={vi.fn()} />
            </Field>,
        );

        expect(screen.getByRole("checkbox", { name: "Newsletter" })).toBeInTheDocument();
    });

    it("shows the error line on its own with aria-invalid", () => {
        const { container } = render(<Checkbox checked={false} onChange={vi.fn()} aria-label="Accept terms" aria-invalid />);

        expect((container.firstElementChild as HTMLElement).dataset.invalid).toBe("");
        expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    });
});
