import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { NumberInput } from "../NumberInput";

afterEach(cleanup);

describe("NumberInput", () => {
    it("follows the surrounding field and shows the value for the locale", () => {
        render(
            <Field label="Price" suffix="€" required state="error" validationMessage="Too high.">
                <NumberInput value={1234.5} onChange={vi.fn()} decimals={2} locale="de-DE" />
            </Field>,
        );

        const input = screen.getByRole("textbox", { name: "Price" });
        expect(input).toHaveValue("1.234,50");
        expect(input).toHaveAccessibleDescription("Too high.");
        expect(input.getAttribute("aria-invalid")).toBe("true");
        expect(input).toBeRequired();
        expect(input.closest("[data-steppers]")).not.toBeNull();
        expect(screen.getByRole("button", { name: "Increase" })).toBeInTheDocument();
    });

    it("hides the steppers when the field is read-only", () => {
        render(
            <Field label="Price" readOnly>
                <NumberInput value={null} onChange={vi.fn()} labels={{ increment: "Plus" }} />
            </Field>,
        );

        expect(screen.queryByRole("button")).toBeNull();
        expect(screen.getByRole("textbox", { name: "Price" })).toHaveValue("");
    });

    it("takes its name from aria-label and all texts for assistive technology from labels on its own", () => {
        render(
            <NumberInput
                aria-label="Preis"
                value={1}
                onChange={vi.fn()}
                labels={{ increment: "Erhöhen", decrement: "Verringern", roleDescription: "Zahlenfeld" }}
            />,
        );

        expect(screen.getByRole("textbox", { name: "Preis" }).getAttribute("aria-roledescription")).toBe("Zahlenfeld");
        expect(screen.getByRole("button", { name: "Erhöhen" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Verringern" })).toBeInTheDocument();
    });
});
