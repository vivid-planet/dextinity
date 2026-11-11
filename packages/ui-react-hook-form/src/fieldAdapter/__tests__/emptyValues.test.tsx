import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useFieldArray, useForm, useFormState } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { CheckboxField } from "../../fields/checkboxField/CheckboxField";
import { InputField } from "../../fields/inputField/InputField";
import { TextareaField } from "../../fields/textareaField/TextareaField";

function DirtyState() {
    const { isDirty } = useFormState();
    return <output>{isDirty ? "dirty" : "pristine"}</output>;
}

function TestForm({ defaultValues, onSubmit = () => undefined }: { defaultValues: Record<string, unknown>; onSubmit?: (values: unknown) => void }) {
    const form = useForm({ defaultValues });
    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <InputField name="title" label="Title" />
                <TextareaField name="description" label="Description" />
                <DirtyState />
                <button type="submit">Save</button>
            </form>
        </FormProvider>
    );
}

describe("emptied text fields", () => {
    it.each([
        ["an empty string", { title: "", description: "" }],
        ["null", { title: null, description: null }],
    ])("stay pristine after typing and clearing when the default value is %s", async (_, defaultValues) => {
        render(<TestForm defaultValues={defaultValues} />);

        await userEvent.type(screen.getByLabelText("Title"), "Benefits");
        await userEvent.type(screen.getByLabelText("Description"), "Text");
        expect(screen.getByRole("status")).toHaveTextContent("dirty");

        await userEvent.clear(screen.getByLabelText("Title"));
        await userEvent.clear(screen.getByLabelText("Description"));
        expect(screen.getByRole("status")).toHaveTextContent("pristine");
    });

    it("submit the blank default value of a cleared field", async () => {
        const onSubmit = vi.fn();
        render(<TestForm defaultValues={{ title: null, description: "" }} onSubmit={onSubmit} />);

        await userEvent.type(screen.getByLabelText("Title"), "a");
        await userEvent.clear(screen.getByLabelText("Title"));
        await userEvent.type(screen.getByLabelText("Description"), "a");
        await userEvent.clear(screen.getByLabelText("Description"));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(onSubmit).toHaveBeenCalledWith({ title: null, description: "" }, expect.anything());
    });

    it("become dirty when cleared from a text", async () => {
        const onSubmit = vi.fn();
        render(<TestForm defaultValues={{ title: "Benefits" }} onSubmit={onSubmit} />);

        await userEvent.clear(screen.getByLabelText("Title"));
        expect(screen.getByRole("status")).toHaveTextContent("dirty");
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: "" }), expect.anything());
    });
});

describe("fields without a default value", () => {
    function FormWithoutDefaults({ onSubmit = () => undefined }: { onSubmit?: (values: unknown) => void }) {
        const form = useForm<{ title: string; description?: string; featured?: boolean }>({ defaultValues: { title: "Benefits" } });
        return (
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <InputField name="title" label="Title" />
                    <InputField name="description" label="Description" />
                    <CheckboxField name="featured">Featured</CheckboxField>
                    <DirtyState />
                    <button type="submit">Save</button>
                </form>
            </FormProvider>
        );
    }

    it("stay pristine after typing and clearing", async () => {
        const onSubmit = vi.fn();
        render(<FormWithoutDefaults onSubmit={onSubmit} />);

        await userEvent.type(screen.getByLabelText("Description"), "Text");
        expect(screen.getByRole("status")).toHaveTextContent("dirty");
        await userEvent.clear(screen.getByLabelText("Description"));
        expect(screen.getByRole("status")).toHaveTextContent("pristine");

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(onSubmit).toHaveBeenCalledWith({ title: "Benefits", description: undefined }, expect.anything());
    });

    it("stay pristine after checking and unchecking", async () => {
        render(<FormWithoutDefaults />);

        await userEvent.click(screen.getByRole("checkbox", { name: "Featured" }));
        expect(screen.getByRole("status")).toHaveTextContent("dirty");
        await userEvent.click(screen.getByRole("checkbox", { name: "Featured" }));
        expect(screen.getByRole("status")).toHaveTextContent("pristine");
    });

    it("keep the form pristine while they are untouched", async () => {
        render(<FormWithoutDefaults />);

        await userEvent.type(screen.getByLabelText("Title"), "!");
        expect(screen.getByRole("status")).toHaveTextContent("dirty");
        await userEvent.type(screen.getByLabelText("Title"), "{Backspace}");
        expect(screen.getByRole("status")).toHaveTextContent("pristine");
    });

    it("leave no default values behind for a field array row that was added and removed", async () => {
        type Values = { items: Array<{ title: string; note?: string }> };
        function Rows() {
            const { fields, append, remove } = useFieldArray<Values>({ name: "items" });
            return (
                <>
                    {fields.map((item, index) => (
                        <div key={item.id}>
                            <InputField name={`items.${index}.note`} label={`Note ${index}`} />
                            <button type="button" onClick={() => remove(index)}>
                                Remove {index}
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => append({ title: "" })}>
                        Add
                    </button>
                </>
            );
        }
        function FormWithFieldArray() {
            const form = useForm<Values>({ defaultValues: { items: [] } });
            return (
                <FormProvider {...form}>
                    <Rows />
                    <DirtyState />
                </FormProvider>
            );
        }
        render(<FormWithFieldArray />);

        await userEvent.click(screen.getByRole("button", { name: "Add" }));
        expect(screen.getByRole("status")).toHaveTextContent("dirty");
        await userEvent.click(screen.getByRole("button", { name: "Remove 0" }));
        expect(screen.getByRole("status")).toHaveTextContent("pristine");
    });
});
