import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "react-final-form";
import { describe, expect, it, vi } from "vitest";

import { focusOnError } from "../focusOnError/focusOnError";
import { NumberField, toNumberValue } from "./NumberField";

describe("NumberField", () => {
    it("maps a missing or non-numeric value to an empty field", () => {
        expect(toNumberValue(undefined)).toBeNull();
        expect(toNumberValue("")).toBeNull();
        expect(toNumberValue(Number.NaN)).toBeNull();
        expect(toNumberValue(0)).toBe(0);
    });

    it("writes a number to the form and validates it", async () => {
        const onSubmit = vi.fn();
        render(
            <Form onSubmit={onSubmit} decorators={[focusOnError]}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <NumberField
                            name="price"
                            label="Price"
                            locale="en-US"
                            required
                            validate={(value) => (typeof value === "number" && value > 100 ? "At most 100" : undefined)}
                        />
                        <button type="submit">Save</button>
                    </form>
                )}
            </Form>,
        );
        const input = screen.getByRole("textbox", { name: "Price" });

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(input).toHaveAccessibleDescription("Required");
        expect(input).toHaveFocus();

        await userEvent.type(input, "250");
        await userEvent.tab();
        expect(input).toHaveAccessibleDescription("At most 100");

        await userEvent.clear(input);
        await userEvent.type(input, "42.5");
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(onSubmit).toHaveBeenCalledWith({ price: 42.5 }, expect.anything(), expect.anything());
    });
});
