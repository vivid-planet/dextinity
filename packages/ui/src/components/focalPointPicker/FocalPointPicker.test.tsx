import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FocalPointPicker } from "./FocalPointPicker";

afterEach(cleanup);

describe("FocalPointPicker", () => {
    it("emits auto and disabled as data attributes", () => {
        const { container } = render(<FocalPointPicker src="a.jpg" value={{ x: 0.5, y: 0.5 }} onChange={vi.fn()} auto disabled />);
        const root = container.firstElementChild as HTMLElement;

        expect(root.className).toContain("dextinityFocalPointPicker");
        expect([root.dataset.auto, root.dataset.disabled]).toStrictEqual(["", ""]);
    });

    it("places the point and centers every preview crop on it", () => {
        const { container } = render(<FocalPointPicker src="a.jpg" value={{ x: 0.25, y: 0.75 }} onChange={vi.fn()} ratios={["16:9", "1:1"]} />);

        const marker = screen.getByRole("slider");
        expect([marker.style.insetInlineStart, marker.style.insetBlockStart]).toStrictEqual(["25%", "75%"]);
        const previews = Array.from(container.querySelectorAll<HTMLImageElement>(".dextinityFocalPointPicker__previewImage"));
        expect(previews.map((image) => image.style.objectPosition)).toStrictEqual(["25% 75%", "25% 75%"]);
    });

    it("connects the validation message to the point", () => {
        const { container } = render(
            <FocalPointPicker
                src="a.jpg"
                value={{ x: 0.5, y: 0.5 }}
                onChange={vi.fn()}
                state="error"
                validationMessage="Set the point on the face."
            />,
        );

        expect((container.firstElementChild as HTMLElement).dataset.state).toBe("error");
        const marker = screen.getByRole("slider");
        expect(marker.getAttribute("aria-invalid")).toBe("true");
        const message = document.getElementById(marker.getAttribute("aria-describedby") ?? "");
        expect([message?.className, message?.textContent]).toStrictEqual(["dextinityFocalPointPicker__message", "Set the point on the face."]);
    });
});
