import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { FocalPointPicker } from "../FocalPointPicker";

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

    it("follows the surrounding field", () => {
        const { container } = render(
            <Field label="Focal point" layout="group" disabled state="error" validationMessage="Set the point on the face.">
                <FocalPointPicker src="a.jpg" value={{ x: 0.5, y: 0.5 }} onChange={vi.fn()} />
            </Field>,
        );

        const root = container.querySelector<HTMLElement>(".dextinityFocalPointPicker");
        expect([root?.dataset.invalid, root?.dataset.disabled]).toStrictEqual(["", ""]);
        expect(screen.getByRole("group", { name: "Focal point" })).toBe(root);
        const marker = screen.getByRole("slider");
        expect(marker.getAttribute("aria-invalid")).toBe("true");
        expect(marker).toHaveAccessibleDescription("Set the point on the face.");
        expect(marker.getAttribute("aria-disabled")).toBe("true");
    });

    it("names its group by aria-label on its own", () => {
        render(<FocalPointPicker aria-label="Focal point" src="a.jpg" value={{ x: 0.5, y: 0.5 }} onChange={vi.fn()} />);

        expect(screen.getByRole("group", { name: "Focal point" })).toBeInTheDocument();
    });

    it("follows the read-only state of the surrounding field and ignores moves", () => {
        const onChange = vi.fn();
        const { container } = render(
            <Field label="Focal point" layout="group" readOnly required>
                <FocalPointPicker src="a.jpg" value={{ x: 0.5, y: 0.5 }} onChange={onChange} />
            </Field>,
        );

        expect(container.querySelector<HTMLElement>(".dextinityFocalPointPicker")?.dataset.readonly).toBe("");
        const marker = screen.getByRole("slider");
        expect(marker).toHaveAttribute("aria-readonly", "true");
        expect(marker).toHaveAttribute("tabindex", "0");
        expect(marker).not.toHaveAttribute("aria-required");
        expect(marker).toHaveAccessibleDescription("Required");
        fireEvent.keyDown(marker, { key: "ArrowRight" });
        expect(onChange).not.toHaveBeenCalled();
    });
});
