import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { Slider } from "../Slider";

afterEach(cleanup);

describe("Slider", () => {
    it("emits the root class and the disabled state", () => {
        const { container } = render(<Slider aria-label="Icon size" value={40} onChange={vi.fn()} disabled />);

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinitySlider");
        expect(root.dataset.disabled).toBe("");
    });

    it("names the slider and exposes its range", () => {
        render(<Slider aria-label="Icon size" value={118} min={84} max={220} onChange={vi.fn()} />);

        const slider = screen.getByRole("slider", { name: "Icon size" });
        expect([slider.getAttribute("aria-valuenow"), slider.getAttribute("min"), slider.getAttribute("max")]).toStrictEqual(["118", "84", "220"]);
    });

    it("follows the surrounding field", () => {
        const { container } = render(
            <Field label="Icon size" layout="group" disabled state="error" validationMessage="Pick at least 50.">
                <Slider value={40} onChange={vi.fn()} />
            </Field>,
        );

        const root = container.querySelector<HTMLElement>(".dextinitySlider");
        expect([root?.dataset.invalid, root?.dataset.disabled]).toStrictEqual(["", ""]);
        expect(screen.getByRole("group", { name: "Icon size" })).toBe(root);
        const slider = screen.getByRole("slider", { name: "Icon size" });
        expect(slider.getAttribute("aria-invalid")).toBe("true");
        expect(slider).toHaveAccessibleDescription("Pick at least 50.");
        expect(slider).toBeDisabled();
    });

    it("follows the read-only state of the surrounding field and ignores changes", () => {
        const onChange = vi.fn();
        const { container } = render(
            <Field label="Icon size" layout="group" readOnly>
                <Slider value={40} onChange={onChange} />
            </Field>,
        );

        expect(container.querySelector<HTMLElement>(".dextinitySlider")?.dataset.readonly).toBe("");
        const slider = screen.getByRole("slider", { name: "Icon size" });
        expect(slider).toHaveAttribute("aria-readonly", "true");
        expect(slider).not.toBeDisabled();
        fireEvent.keyDown(slider, { key: "ArrowRight" });
        expect(onChange).not.toHaveBeenCalled();
    });

    it("describes the slider as required in a required field", () => {
        render(
            <Field label="Icon size" layout="group" required>
                <Slider value={40} onChange={vi.fn()} />
            </Field>,
        );

        const slider = screen.getByRole("slider", { name: "Icon size" });
        expect(slider).toHaveAccessibleDescription("Required");
        expect(slider).not.toHaveAttribute("aria-required");
    });
});
