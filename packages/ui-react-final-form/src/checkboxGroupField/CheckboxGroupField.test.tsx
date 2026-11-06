import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "react-final-form";
import { describe, expect, it, vi } from "vitest";

import { focusOnError } from "../focusOnError/focusOnError";
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
        expect(toCheckboxGroupValue("")).toEqual([]);
        expect(toCheckboxGroupValue("main-de")).toEqual(["main-de"]);
        expect(toCheckboxGroupValue(["main-de"])).toEqual(["main-de"]);
    });

    it("requires a checked option and writes a group's options to the form", async () => {
        const onSubmit = vi.fn();
        render(
            <Form onSubmit={onSubmit} decorators={[focusOnError]}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <CheckboxGroupField name="scopes" label="Scopes" options={options} required requiredMessage="Select a scope" />
                        <button type="submit">Save</button>
                    </form>
                )}
            </Form>,
        );

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(screen.getByRole("group", { name: "Scopes" })).toHaveAccessibleDescription("Select a scope");
        expect(screen.getByRole("checkbox", { name: "Main" })).toHaveFocus();

        await userEvent.click(screen.getByRole("checkbox", { name: "Main" }));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(onSubmit).toHaveBeenCalledWith({ scopes: ["main-de", "main-en"] }, expect.anything(), expect.anything());
    });

    it("shows the required error only once focus leaves the group", async () => {
        render(
            <Form onSubmit={vi.fn()}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <CheckboxGroupField name="scopes" label="Scopes" options={options} required requiredMessage="Select a scope" />
                        <button type="submit">Save</button>
                    </form>
                )}
            </Form>,
        );
        const group = screen.getByRole("group", { name: "Scopes" });

        screen.getByRole("checkbox", { name: "Main" }).focus();
        await userEvent.tab();
        expect(screen.getByRole("checkbox", { name: "German" })).toHaveFocus();
        expect(group).not.toHaveAccessibleDescription("Select a scope");

        await userEvent.tab();
        await userEvent.tab();
        expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
        expect(group).toHaveAccessibleDescription("Select a scope");
    });
});
