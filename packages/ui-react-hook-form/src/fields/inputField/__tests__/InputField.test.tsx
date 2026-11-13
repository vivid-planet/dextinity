import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { InputField } from "../InputField";

interface FormValues {
    title: string;
    slug: string;
}

interface TestFormProps {
    onSubmit?: (values: FormValues, setError: (name: keyof FormValues, message: string) => void) => void | Promise<void>;
    defaultValues?: Partial<FormValues>;
}

function TestForm({ onSubmit = () => undefined, defaultValues }: TestFormProps) {
    const { control, handleSubmit, setError } = useForm<FormValues>({ defaultValues, mode: "onTouched" });
    return (
        <form
            onSubmit={handleSubmit((values) =>
                onSubmit(values, (name, message) => setError(name, { type: "server", message }, { shouldFocus: true })),
            )}
            noValidate
        >
            <InputField control={control} name="title" label="Title" required />
            <InputField
                control={control}
                name="slug"
                label="Slug"
                rules={{ validate: (value) => (value?.includes(" ") ? "No spaces" : undefined) }}
            />
            <button type="submit">Save</button>
        </form>
    );
}

describe("InputField", () => {
    it("shows the form value and writes changes back", async () => {
        const onSubmit = vi.fn();
        render(<TestForm onSubmit={onSubmit} defaultValues={{ title: "Benefits" }} />);

        expect(screen.getByLabelText("Title")).toHaveValue("Benefits");
        await userEvent.type(screen.getByLabelText("Title"), " page");
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ title: "Benefits page" }, expect.anything()));
    });

    it("shows a validation error only once the field was touched", async () => {
        render(<TestForm />);
        const slug = screen.getByLabelText("Slug");

        await userEvent.type(slug, "a b");
        expect(slug).not.toHaveAttribute("aria-invalid");
        expect(screen.queryByText("No spaces")).not.toBeInTheDocument();

        await userEvent.tab();
        await waitFor(() => expect(slug).toHaveAttribute("aria-invalid", "true"));
        expect(screen.getByText("No spaces")).toBeInTheDocument();
    });

    it("shows the required error and focuses the first invalid field on submit", async () => {
        render(<TestForm />);

        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        await waitFor(() => expect(screen.getByText("Required", { ignore: "[hidden]" })).toBeInTheDocument());
        expect(screen.getByLabelText("Title")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Title")).toHaveFocus();
    });

    it("shows a submit error until the field changes", async () => {
        render(<TestForm onSubmit={(values, setError) => setError("title", "Taken")} />);

        await userEvent.type(screen.getByLabelText("Title"), "Benefits");
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        await waitFor(() => expect(screen.getByText("Taken")).toBeInTheDocument());
        expect(screen.getByLabelText("Title")).toHaveFocus();

        await userEvent.type(screen.getByLabelText("Title"), "!");
        await waitFor(() => expect(screen.queryByText("Taken")).not.toBeInTheDocument());
    });

    it("marks a field invalid for a rule without a message", async () => {
        function MaxLengthForm() {
            const { control } = useForm<{ code: string }>({ defaultValues: { code: "" }, mode: "onTouched" });
            return <InputField control={control} name="code" label="Code" rules={{ maxLength: 3 }} />;
        }
        render(<MaxLengthForm />);
        const code = screen.getByLabelText("Code");

        await userEvent.type(code, "ABCD");
        await userEvent.tab();

        await waitFor(() => expect(code).toHaveAttribute("aria-invalid", "true"));
    });

    it("takes the control from the surrounding FormProvider", () => {
        function ContextForm() {
            const form = useForm({ defaultValues: { title: "From context" } });
            return (
                <FormProvider {...form}>
                    <InputField name="title" label="Title" />
                </FormProvider>
            );
        }
        render(<ContextForm />);

        expect(screen.getByLabelText("Title")).toHaveValue("From context");
    });
});
