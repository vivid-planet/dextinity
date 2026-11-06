import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { CheckboxGroupField, toCheckboxGroupValue } from "./CheckboxGroupField";

const options = [
    {
        value: "main",
        label: "Main",
        children: [
            { value: "main-de", label: "German" },
            { value: "main-en", label: "English" },
        ],
    },
];

describe("CheckboxGroupField", () => {
    it("maps the field value to a list", () => {
        expect(toCheckboxGroupValue(undefined)).toEqual([]);
        expect(toCheckboxGroupValue(null)).toEqual([]);
        expect(toCheckboxGroupValue("main-de")).toEqual(["main-de"]);
        expect(toCheckboxGroupValue(["main-de"])).toEqual(["main-de"]);
    });

    it("requires a checked option and writes a group's options to the form", async () => {
        const onSubmit = vi.fn();
        function TestForm() {
            const { control, handleSubmit } = useForm<{ scopes: string[] }>({ defaultValues: { scopes: [] } });
            return (
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <CheckboxGroupField control={control} name="scopes" label="Scopes" options={options} required requiredMessage="Select a scope" />
                    <button type="submit">Save</button>
                </form>
            );
        }
        render(<TestForm />);

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await waitFor(() => expect(screen.getByRole("group", { name: "Scopes" })).toHaveAccessibleDescription("Select a scope"));
        expect(screen.getByRole("checkbox", { name: "Main" })).toHaveFocus();

        await userEvent.click(screen.getByRole("checkbox", { name: "Main" }));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ scopes: ["main-de", "main-en"] }, expect.anything()));
    });
});
