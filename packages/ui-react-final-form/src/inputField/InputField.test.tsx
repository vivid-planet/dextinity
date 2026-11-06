import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FORM_ERROR, type SubmissionErrors } from "final-form";
import { Form } from "react-final-form";
import { describe, expect, it, vi } from "vitest";

import { focusOnError } from "../focusOnError/focusOnError";
import { InputField } from "./InputField";

function renderForm(
    onSubmit: (values: Record<string, unknown>) => SubmissionErrors | void = () => undefined,
    initialValues?: Record<string, unknown>,
) {
    return render(
        <Form onSubmit={onSubmit} initialValues={initialValues} decorators={[focusOnError]}>
            {({ handleSubmit }) => (
                <form onSubmit={handleSubmit} noValidate>
                    <InputField name="title" label="Title" required />
                    <InputField name="slug" label="Slug" validate={(value) => (value?.includes(" ") ? "No spaces" : undefined)} />
                    <button type="submit">Save</button>
                </form>
            )}
        </Form>,
    );
}

describe("InputField", () => {
    it("shows the form value and writes changes back", async () => {
        const onSubmit = vi.fn();
        renderForm(onSubmit, { title: "Benefits" });

        expect(screen.getByLabelText("Title")).toHaveValue("Benefits");
        await userEvent.type(screen.getByLabelText("Title"), " page");
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(onSubmit).toHaveBeenCalledWith({ title: "Benefits page" }, expect.anything(), expect.anything());
    });

    it("shows a validation error only once the field was touched", async () => {
        renderForm();
        const slug = screen.getByLabelText("Slug");

        await userEvent.type(slug, "a b");
        expect(slug).not.toHaveAttribute("aria-invalid");
        expect(screen.queryByText("No spaces")).not.toBeInTheDocument();

        await userEvent.tab();
        expect(slug).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByText("No spaces")).toBeInTheDocument();
    });

    it("shows the required error and focuses the first invalid field on submit", async () => {
        renderForm();

        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(screen.getByText("Required")).toBeInTheDocument();
        expect(screen.getByLabelText("Title")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Title")).toHaveFocus();
    });

    it("shows a submit error until the field changes", async () => {
        renderForm(() => ({ title: "Taken", [FORM_ERROR]: "Not saved" }));

        await userEvent.type(screen.getByLabelText("Title"), "Benefits");
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        await waitFor(() => expect(screen.getByText("Taken")).toBeInTheDocument());
        expect(screen.getByLabelText("Title")).toHaveFocus();

        await userEvent.type(screen.getByLabelText("Title"), "!");
        expect(screen.queryByText("Taken")).not.toBeInTheDocument();
    });
});
