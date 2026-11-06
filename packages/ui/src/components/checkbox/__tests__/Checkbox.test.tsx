import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

    it("connects the validation message and the required state to the control", () => {
        const { container } = render(
            <Checkbox
                checked={false}
                onChange={vi.fn()}
                required
                state="error"
                validationMessage="Accept the terms to continue."
                aria-describedby="hint"
            >
                Accept terms
            </Checkbox>,
        );

        const root = container.firstElementChild as HTMLElement;
        expect([root.dataset.state, root.dataset.required]).toStrictEqual(["error", ""]);
        const control = screen.getByRole("checkbox", { name: "Accept terms" });
        expect([control.getAttribute("aria-invalid"), control.getAttribute("aria-required")]).toStrictEqual(["true", "true"]);
        const [hintId, messageId] = (control.getAttribute("aria-describedby") ?? "").split(" ");
        expect(hintId).toBe("hint");
        const message = document.getElementById(messageId);
        expect([message?.className, message?.textContent]).toStrictEqual(["dextinityCheckbox__message", "Accept the terms to continue."]);
        expect(screen.getByText("Accept terms").closest("label")?.className).toBe("dextinityCheckbox__row");
    });

    it("shows no message in the default state", () => {
        render(
            <Checkbox checked={false} onChange={vi.fn()} validationMessage="Accept the terms to continue.">
                Accept terms
            </Checkbox>,
        );

        const control = screen.getByRole("checkbox");
        expect([control.getAttribute("aria-invalid"), control.getAttribute("aria-describedby")]).toStrictEqual([null, null]);
        expect(screen.queryByText("Accept the terms to continue.")).toBeNull();
    });
});
