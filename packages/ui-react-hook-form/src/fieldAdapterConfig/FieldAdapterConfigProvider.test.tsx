import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { FormProvider, useForm, type UseFormProps } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { InputField } from "../inputField/InputField";
import { FieldAdapterConfigProvider, type FieldAdapterConfigProviderProps } from "./FieldAdapterConfigProvider";

interface Values {
    title: string;
    slug: string;
}

function warnLong(value: string | undefined) {
    return value != null && value.length > 10 ? "Longer than recommended" : undefined;
}

function TestForm({
    onSubmit = () => undefined,
    children,
    ...formProps
}: PropsWithChildren<UseFormProps<Values> & { onSubmit?: (values: Values) => void }>) {
    const form = useForm<Values>({ defaultValues: { title: "", slug: "" }, ...formProps });
    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                {children ?? (
                    <>
                        <InputField<Values, "title"> name="title" label="Title" required warn={warnLong} />
                        <InputField<Values, "slug"> name="slug" label="Slug" />
                    </>
                )}
                <button type="submit">Save</button>
            </form>
        </FormProvider>
    );
}

function renderForm(config: FieldAdapterConfigProviderProps, formProps: UseFormProps<Values> & { onSubmit?: (values: Values) => void } = {}) {
    return render(
        <FieldAdapterConfigProvider {...config}>
            <TestForm {...formProps} />
        </FieldAdapterConfigProvider>,
    );
}

function fieldOf(label: string) {
    return screen.getByLabelText(label).closest("[data-state]");
}

describe("FieldAdapterConfigProvider", () => {
    it("shows errors once the field was touched by default", async () => {
        renderForm({}, { mode: "onTouched" });
        expect(screen.queryByText("Required")).not.toBeInTheDocument();

        await userEvent.click(screen.getByLabelText("Title"));
        await userEvent.tab();

        expect(await screen.findByText("Required")).toBeInTheDocument();
        expect(fieldOf("Title")).toHaveAttribute("data-state", "error");
    });

    it("shows errors as soon as React Hook Form has them with showErrors always", async () => {
        renderForm({ showErrors: "always" }, { mode: "all" });

        await userEvent.type(screen.getByLabelText("Title"), "a");
        await userEvent.clear(screen.getByLabelText("Title"));

        expect(await screen.findByText("Required")).toBeInTheDocument();
        expect(screen.getByLabelText("Title")).toHaveAttribute("aria-invalid", "true");
    });

    it("shows a warning from warn without blocking submitting", async () => {
        const onSubmit = vi.fn();
        renderForm({}, { defaultValues: { title: "A very long title", slug: "" }, onSubmit });
        expect(screen.queryByText("Longer than recommended")).not.toBeInTheDocument();

        await userEvent.click(screen.getByLabelText("Title"));
        await userEvent.tab();

        expect(screen.getByText("Longer than recommended")).toBeInTheDocument();
        expect(fieldOf("Title")).toHaveAttribute("data-state", "warning");
        expect(screen.getByLabelText("Title")).not.toHaveAttribute("aria-invalid");

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    });

    it("shows warnings right away with showWarnings always", () => {
        renderForm({ showWarnings: "always" }, { defaultValues: { title: "A very long title", slug: "" } });

        expect(screen.getByText("Longer than recommended")).toBeInTheDocument();
    });

    it("shows the error instead of the warning when the field has both", async () => {
        render(
            <FieldAdapterConfigProvider showErrors="always" showWarnings="always">
                <TestForm mode="all" defaultValues={{ title: "A very long title", slug: "" }}>
                    <InputField<Values, "title"> name="title" label="Title" rules={{ validate: () => "Taken" }} warn={warnLong} />
                </TestForm>
            </FieldAdapterConfigProvider>,
        );

        await userEvent.type(screen.getByLabelText("Title"), "!");

        expect(await screen.findByText("Taken")).toBeInTheDocument();
        expect(screen.queryByText("Longer than recommended")).not.toBeInTheDocument();
    });

    it("inherits the settings a nested provider leaves out", async () => {
        render(
            <FieldAdapterConfigProvider showErrors="always">
                <FieldAdapterConfigProvider showWarnings="always">
                    <TestForm mode="all" defaultValues={{ title: "A very long title", slug: "" }}>
                        <InputField<Values, "title"> name="title" label="Title" warn={warnLong} />
                        <InputField<Values, "slug"> name="slug" label="Slug" required />
                    </TestForm>
                </FieldAdapterConfigProvider>
            </FieldAdapterConfigProvider>,
        );

        await userEvent.type(screen.getByLabelText("Slug"), "a");
        await userEvent.clear(screen.getByLabelText("Slug"));

        expect(screen.getByText("Longer than recommended")).toBeInTheDocument();
        expect(await screen.findByText("Required")).toBeInTheDocument();
    });
});
