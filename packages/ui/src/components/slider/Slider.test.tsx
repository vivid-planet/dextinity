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
});
