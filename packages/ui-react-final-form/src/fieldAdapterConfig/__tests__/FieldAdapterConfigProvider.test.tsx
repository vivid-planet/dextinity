import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Mutator } from "final-form";
import type { ReactNode } from "react";
import { Form } from "react-final-form";
import { describe, expect, it } from "vitest";

import { InputField } from "../../inputField/InputField";
import { FieldAdapterConfigProvider, type FieldAdapterConfigProviderProps } from "../FieldAdapterConfigProvider";

const setWarning: Mutator = ([name, warning]: [string, ReactNode], state) => {
    const field = state.fields[name];
    field.data = { ...field.data, warning };
};

function warnLong(value: string | undefined) {
    return value != null && value.length > 10 ? "Longer than recommended" : undefined;
}

function renderForm(config: FieldAdapterConfigProviderProps = {}, initialValues: Record<string, unknown> = {}) {
    return render(
        <FieldAdapterConfigProvider {...config}>
            <Form onSubmit={() => undefined} initialValues={initialValues} mutators={{ setWarning }}>
                {({ handleSubmit, form }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <InputField name="title" label="Title" required warn={warnLong} />
                        <InputField name="slug" label="Slug" />
                        <button type="button" onClick={() => form.mutators.setWarning("slug", "Changes the URL")}>
                            Warn about slug
                        </button>
                        <button type="submit">Save</button>
                    </form>
                )}
            </Form>
        </FieldAdapterConfigProvider>,
    );
}

function fieldOf(label: string) {
    return screen.getByLabelText(label).closest("[data-state]");
}

describe("FieldAdapterConfigProvider", () => {
    it("shows errors once the field was touched by default", async () => {
        renderForm();
        expect(screen.queryByText("Required")).not.toBeInTheDocument();

        await userEvent.click(screen.getByLabelText("Title"));
        await userEvent.tab();

        expect(screen.getByText("Required")).toBeInTheDocument();
        expect(fieldOf("Title")).toHaveAttribute("data-state", "error");
    });

    it("shows errors right away with showErrors always", () => {
        renderForm({ showErrors: "always" });

        expect(screen.getByText("Required")).toBeInTheDocument();
        expect(screen.getByLabelText("Title")).toHaveAttribute("aria-invalid", "true");
    });

    it("shows a warning from warn as the warning state without marking the field invalid", async () => {
        renderForm({}, { title: "A very long title" });
        expect(screen.queryByText("Longer than recommended")).not.toBeInTheDocument();

        await userEvent.click(screen.getByLabelText("Title"));
        await userEvent.tab();

        expect(screen.getByText("Longer than recommended")).toBeInTheDocument();
        expect(fieldOf("Title")).toHaveAttribute("data-state", "warning");
        expect(screen.getByLabelText("Title")).not.toHaveAttribute("aria-invalid");
    });

    it("shows a warning set as meta.data.warning", async () => {
        renderForm({ showWarnings: "always" });

        await userEvent.click(screen.getByRole("button", { name: "Warn about slug" }));

        expect(screen.getByText("Changes the URL")).toBeInTheDocument();
        expect(fieldOf("Slug")).toHaveAttribute("data-state", "warning");
    });

    it("shows the error instead of the warning when the field has both", async () => {
        render(
            <FieldAdapterConfigProvider showErrors="always" showWarnings="always">
                <Form onSubmit={() => undefined} initialValues={{ title: "A very long title" }}>
                    {() => <InputField name="title" label="Title" validate={() => "Taken"} warn={warnLong} />}
                </Form>
            </FieldAdapterConfigProvider>,
        );

        expect(screen.getByText("Taken")).toBeInTheDocument();
        expect(screen.queryByText("Longer than recommended")).not.toBeInTheDocument();
    });

    it("inherits the settings a nested provider leaves out", () => {
        render(
            <FieldAdapterConfigProvider showErrors="always">
                <FieldAdapterConfigProvider showWarnings="always">
                    <Form onSubmit={() => undefined} initialValues={{ title: "A very long title" }}>
                        {() => (
                            <>
                                <InputField name="title" label="Title" warn={warnLong} />
                                <InputField name="slug" label="Slug" required />
                            </>
                        )}
                    </Form>
                </FieldAdapterConfigProvider>
            </FieldAdapterConfigProvider>,
        );

        expect(screen.getByText("Longer than recommended")).toBeInTheDocument();
        expect(screen.getByText("Required")).toBeInTheDocument();
    });
});
