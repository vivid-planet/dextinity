import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { Textarea } from "../Textarea";

afterEach(cleanup);

describe("Textarea", () => {
    it("marks auto-resizing on the textarea", () => {
        render(<Textarea name="intro" aria-label="Intro" value="" onChange={vi.fn()} />);

        const textarea = screen.getByRole("textbox", { name: "Intro" });
        expect(textarea.className).toContain("dextinityTextarea__control");
        expect(textarea.dataset.autoresize).toBe("");
    });

    it("omits the auto-resize attribute when the user resizes the field", () => {
        render(<Textarea name="intro" aria-label="Intro" value="" onChange={vi.fn()} autoResize={false} />);

        expect(screen.getByRole("textbox").hasAttribute("data-autoresize")).toBe(false);
    });

    it("follows the surrounding field", () => {
        render(
            <Field label="Intro" required disabled state="error" validationMessage="Write an intro.">
                <Textarea name="intro" value="" onChange={vi.fn()} />
            </Field>,
        );

        const textarea = screen.getByRole("textbox", { name: "Intro" });
        expect(textarea).toHaveAccessibleDescription("Write an intro.");
        expect(textarea).toBeRequired();
        expect(textarea).toBeDisabled();
        expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("shows its count at the field's label", () => {
        render(
            <Field label="Teaser">
                <Textarea name="teaser" value="Hello" maxLength={80} showCount onChange={vi.fn()} />
            </Field>,
        );

        expect(screen.getByText("5 / 80")).toBeInTheDocument();
    });
});
