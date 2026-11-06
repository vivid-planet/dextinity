import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NumberInput } from "./NumberInput";

afterEach(cleanup);

describe("NumberInput", () => {
    it("connects the input to the label and the message, and shows the value for the locale", () => {
        const { container } = render(
            <NumberInput
                label="Price"
                value={1234.5}
                onChange={vi.fn()}
                decimals={2}
                locale="de-DE"
                suffix="€"
                state="error"
                validationMessage="Too high."
            />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityNumberInput");
        expect(root.dataset.steppers).toBe("");
        const input = screen.getByRole("textbox", { name: "Price" });
        expect(input).toHaveValue("1.234,50");
        expect(input).toHaveAccessibleDescription("Too high.");
        expect(input.getAttribute("aria-invalid")).toBe("true");
        expect(screen.getByRole("button", { name: "Increase" })).toBeInTheDocument();
    });

    it("hides the steppers when read-only", () => {
        const { container } = render(<NumberInput label="Price" value={null} onChange={vi.fn()} readOnly labels={{ increment: "Plus" }} />);

        expect((container.firstElementChild as HTMLElement).dataset.steppers).toBeUndefined();
        expect(screen.queryByRole("button")).toBeNull();
        expect(screen.getByRole("textbox", { name: "Price" })).toHaveValue("");
    });

    it("takes all texts for assistive technology from labels", () => {
        render(
            <NumberInput
                label="Preis"
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
