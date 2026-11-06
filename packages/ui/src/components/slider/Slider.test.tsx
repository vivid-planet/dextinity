import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Slider } from "./Slider";

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

    it("names the slider by its visible label", () => {
        render(<Slider label="Icon size" value={40} onChange={vi.fn()} />);

        expect(screen.getByRole("slider", { name: "Icon size" })).toBeTruthy();
        expect(screen.getByText("Icon size").className).toBe("dextinitySlider__label");
    });

    it("connects the validation message to the slider", () => {
        const { container } = render(<Slider label="Icon size" value={40} onChange={vi.fn()} state="error" validationMessage="Pick at least 50." />);

        expect((container.firstElementChild as HTMLElement).dataset.state).toBe("error");
        const slider = screen.getByRole("slider");
        expect(slider.getAttribute("aria-invalid")).toBe("true");
        const message = document.getElementById(slider.getAttribute("aria-describedby") ?? "");
        expect([message?.className, message?.textContent]).toStrictEqual(["dextinitySlider__message", "Pick at least 50."]);
    });
});
