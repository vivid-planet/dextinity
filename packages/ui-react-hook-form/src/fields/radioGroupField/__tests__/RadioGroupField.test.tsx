import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { RadioGroupField, toRadioGroupValue } from "../RadioGroupField";

const options = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
];

describe("RadioGroupField", () => {
    it("maps an empty field to no choice", () => {
        expect(toRadioGroupValue(undefined)).toBeNull();
        expect(toRadioGroupValue(null)).toBeNull();
        expect(toRadioGroupValue("part-time")).toBe("part-time");
    });

    it("writes the choice to the form and focuses the group on a required error", async () => {
        const onSubmit = vi.fn();
        function TestForm() {
            const { control, handleSubmit } = useForm<{ employment: string | null }>({ defaultValues: { employment: null } });
            return (
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <RadioGroupField control={control} name="employment" label="Employment" options={options} required requiredMessage="Choose one" />
                    <button type="submit">Save</button>
                </form>
            );
        }
        render(<TestForm />);

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await waitFor(() => expect(screen.getByRole("radiogroup", { name: "Employment" })).toHaveAccessibleDescription("Choose one"));
        expect(screen.getByRole("radio", { name: "Full-time" })).toHaveFocus();

        await userEvent.click(screen.getByRole("radio", { name: "Part-time" }));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ employment: "part-time" }, expect.anything()));
    });
});
