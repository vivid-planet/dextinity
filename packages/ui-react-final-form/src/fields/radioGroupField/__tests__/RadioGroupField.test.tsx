import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "react-final-form";
import { describe, expect, it, vi } from "vitest";

import { focusOnError } from "../../../focusOnError/focusOnError";
import { RadioGroupField, toRadioGroupValue } from "../RadioGroupField";

const options = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
];

describe("RadioGroupField", () => {
    it("maps an empty field to no choice", () => {
        expect(toRadioGroupValue(undefined)).toBeNull();
        expect(toRadioGroupValue("")).toBeNull();
        expect(toRadioGroupValue("part-time")).toBe("part-time");
    });

    it("writes the choice to the form and focuses the group on a required error", async () => {
        const onSubmit = vi.fn();
        render(
            <Form onSubmit={onSubmit} decorators={[focusOnError]}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <RadioGroupField name="employment" label="Employment" options={options} required requiredMessage="Choose one" />
                        <button type="submit">Save</button>
                    </form>
                )}
            </Form>,
        );

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(screen.getByRole("radiogroup", { name: "Employment" })).toHaveAccessibleDescription("Choose one");
        expect(screen.getByRole("radio", { name: "Full-time" })).toHaveFocus();

        await userEvent.click(screen.getByRole("radio", { name: "Part-time" }));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(onSubmit).toHaveBeenCalledWith({ employment: "part-time" }, expect.anything(), expect.anything());
    });
});
