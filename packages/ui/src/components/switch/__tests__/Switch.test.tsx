import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { Switch } from "../Switch";

afterEach(cleanup);

describe("Switch", () => {
    it("emits the size, checked, and disabled state on the root", () => {
        const { container } = render(
            <Switch checked onChange={vi.fn()} size="small" disabled>
                Hide in menu
            </Switch>,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinitySwitch");
        expect([root.dataset.size, root.dataset.checked, root.dataset.disabled]).toStrictEqual(["small", "", ""]);
    });

    it("names the switch by its label and describes it by the description", () => {
        render(
            <Switch checked={false} onChange={vi.fn()} description="The page stays reachable.">
                Hide in menu
            </Switch>,
        );

        const control = screen.getByRole("switch", { name: "Hide in menu" });
        expect(control.className).toContain("dextinitySwitch__control");
        expect(document.getElementById(control.getAttribute("aria-describedby") ?? "")?.textContent).toBe("The page stays reachable.");
    });

    it("takes its accessible name from aria-label without a visible label", () => {
        render(<Switch checked={false} onChange={vi.fn()} aria-label="Hide in menu" />);

        expect(screen.getByRole("switch", { name: "Hide in menu" })).toBeTruthy();
    });

    it("follows the surrounding field and keeps its own text as its name", () => {
        const { container } = render(
            <Field layout="group" required state="error" validationMessage="Visitors won't find the page.">
                <Switch checked={false} onChange={vi.fn()} description="Hides the page.">
                    Hide in menu
                </Switch>
            </Field>,
        );

        const root = container.querySelector<HTMLElement>(".dextinitySwitch");
        expect([root?.dataset.invalid, root?.dataset.required]).toStrictEqual(["", ""]);
        const control = screen.getByRole("switch", { name: "Hide in menu" });
        expect([control.getAttribute("aria-invalid"), control.getAttribute("aria-required")]).toStrictEqual(["true", "true"]);
        const descriptions = (control.getAttribute("aria-describedby") ?? "").split(" ").map((id) => document.getElementById(id));
        expect(descriptions.map((element) => element?.textContent)).toStrictEqual(["Hides the page.", "Visitors won't find the page."]);
    });

    it("takes the field's disabled state", () => {
        render(
            <Field label="Visibility" layout="group" disabled>
                <Switch checked={false} onChange={vi.fn()}>
                    Hide in menu
                </Switch>
            </Field>,
        );

        expect(screen.getByRole("switch", { name: "Hide in menu" })).toHaveAttribute("aria-disabled", "true");
    });
});
