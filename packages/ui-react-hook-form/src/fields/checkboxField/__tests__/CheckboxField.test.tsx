import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { CheckboxField, isCheckboxChecked, toggleCheckboxValue } from "../CheckboxField";

describe("CheckboxField", () => {
    it("maps a boolean field to checked", () => {
        expect(isCheckboxChecked(true, undefined)).toBe(true);
        expect(isCheckboxChecked(undefined, undefined)).toBe(false);
        expect(isCheckboxChecked("", undefined)).toBe(false);
        expect(toggleCheckboxValue(false, undefined, true)).toBe(true);
    });

    it("adds and removes its value in a list field", () => {
        expect(isCheckboxChecked(["news"], "news")).toBe(true);
        expect(isCheckboxChecked(["blog"], "news")).toBe(false);
        expect(toggleCheckboxValue(undefined, "news", true)).toEqual(["news"]);
        expect(toggleCheckboxValue(["blog", "news"], "news", false)).toEqual(["blog"]);
    });

    it("requires a required checkbox to be checked", async () => {
        const onSubmit = vi.fn();
        function TestForm() {
            const { control, handleSubmit } = useForm<{ terms: boolean }>();
            return (
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <CheckboxField control={control} name="terms" required requiredMessage="Accept the terms to continue">
                        I accept the terms
                    </CheckboxField>
                    <button type="submit">Save</button>
                </form>
            );
        }
        render(<TestForm />);

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await waitFor(() => expect(screen.getByText("Accept the terms to continue")).toBeInTheDocument());
        const checkbox = screen.getByRole("checkbox", { name: "I accept the terms" });
        expect(checkbox).toBeRequired();
        expect(checkbox).toBeInvalid();
        expect(checkbox).toHaveAccessibleDescription("Accept the terms to continue");
        expect(onSubmit).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole("checkbox"));
        await waitFor(() => expect(screen.queryByText("Accept the terms to continue")).not.toBeInTheDocument());
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ terms: true }, expect.anything()));
    });
});
