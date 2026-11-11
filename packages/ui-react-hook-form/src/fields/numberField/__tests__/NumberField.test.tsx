import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { NumberField, toNumberValue } from "../NumberField";

describe("NumberField", () => {
    it("maps a missing or non-numeric value to an empty field", () => {
        expect(toNumberValue(undefined)).toBeNull();
        expect(toNumberValue("")).toBeNull();
        expect(toNumberValue(Number.NaN)).toBeNull();
        expect(toNumberValue(0)).toBe(0);
    });

    it("writes a number to the form and validates it", async () => {
        const onSubmit = vi.fn();
        function TestForm() {
            const { control, handleSubmit } = useForm<{ price: number | null }>({ defaultValues: { price: null }, mode: "onTouched" });
            return (
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <NumberField
                        control={control}
                        name="price"
                        label="Price"
                        locale="en-US"
                        required
                        rules={{ validate: (value) => (typeof value === "number" && value > 100 ? "At most 100" : true) }}
                    />
                    <button type="submit">Save</button>
                </form>
            );
        }
        render(<TestForm />);
        const input = screen.getByRole("textbox", { name: "Price" });

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await waitFor(() => expect(input).toHaveAccessibleDescription("Required"));
        expect(input).toHaveFocus();

        await userEvent.type(input, "250");
        await userEvent.tab();
        await waitFor(() => expect(input).toHaveAccessibleDescription("At most 100"));

        await userEvent.clear(input);
        await userEvent.type(input, "42.5");
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ price: 42.5 }, expect.anything()));
    });
});
