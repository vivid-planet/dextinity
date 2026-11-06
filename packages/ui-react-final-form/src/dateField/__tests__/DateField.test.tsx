import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "react-final-form";
import { describe, expect, it, vi } from "vitest";

import { focusOnError } from "../../focusOnError/focusOnError";
import { DateField, toDateValue } from "../DateField";

function renderForm(onSubmit: (values: Record<string, unknown>) => void, initialValues?: Record<string, unknown>) {
    return render(
        <Form onSubmit={onSubmit} initialValues={initialValues} decorators={[focusOnError]}>
            {({ handleSubmit }) => (
                <form onSubmit={handleSubmit} noValidate>
                    <DateField name="publishedOn" label="Published on" locale="de-AT" required requiredMessage="Enter a day" />
                    <button type="submit">Save</button>
                </form>
            )}
        </Form>,
    );
}

describe("toDateValue", () => {
    it("maps an empty form value to no day", () => {
        expect(toDateValue(undefined)).toBeNull();
        expect(toDateValue("")).toBeNull();
        expect(toDateValue(null)).toBeNull();
        expect(toDateValue("2026-11-06")).toBe("2026-11-06");
    });
});

describe("DateField", () => {
    it("shows the form value and submits a typed day as YYYY-MM-DD", async () => {
        const onSubmit = vi.fn();
        renderForm(onSubmit, { publishedOn: "2026-11-06" });
        const input = screen.getByRole("textbox", { name: "Published on" });

        expect(input).toHaveValue("06.11.2026");
        await userEvent.clear(input);
        await userEvent.type(input, "24.12.2026");
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(onSubmit).toHaveBeenCalledWith({ publishedOn: "2026-12-24" }, expect.anything(), expect.anything());
    });

    it("shows the required error and focuses the input on submit", async () => {
        renderForm(vi.fn());

        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(screen.getByText("Enter a day")).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Published on" })).toHaveFocus();
    });
});
