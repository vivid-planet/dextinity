import { render } from "@testing-library/react";
import type { FormApi } from "final-form";
import { act, type ReactNode } from "react";
import { Form } from "react-final-form";
import { describe, expect, it } from "vitest";

import { ComboboxField } from "../../comboboxField/ComboboxField";
import { SelectField } from "../../selectField/SelectField";
import { defaultOptionKey, defaultValueKey, isEqualByKey } from "../isEqualByKey";

interface Category {
    id: string;
    title: string;
}

function renderForm(initialValues: Record<string, unknown> | undefined, field: ReactNode) {
    let formApi: FormApi<Record<string, unknown>> | undefined;
    render(
        <Form<Record<string, unknown>> onSubmit={() => {}} initialValues={initialValues}>
            {({ form }) => {
                formApi = form;
                return <form>{field}</form>;
            }}
        </Form>,
    );
    if (formApi === undefined) {
        throw new Error("The form didn't render");
    }
    return formApi;
}

describe("isEqualByKey", () => {
    it("compares values by key and treats every empty value alike", () => {
        const isEqual = isEqualByKey(defaultOptionKey);
        expect(isEqual({ id: "1", title: "A" }, { id: "1", title: "A (renamed)" })).toBe(true);
        expect(isEqual({ id: "1" }, { id: "2" })).toBe(false);
        expect(isEqual([{ id: "1" }], [{ id: "1" }])).toBe(true);
        expect(isEqual([{ id: "1" }, { id: "2" }], [{ id: "2" }, { id: "1" }])).toBe(false);
        expect(isEqual(undefined, [])).toBe(true);
        expect(isEqual(undefined, null)).toBe(true);
        expect(isEqual(null, { id: "1" })).toBe(false);
    });

    it("gives values the keys the ui components give them", () => {
        expect(defaultValueKey("news")).toBe("news");
        expect(defaultValueKey(5)).toBe("5");
        expect(defaultValueKey({ id: 1 })).toBe('{"id":1}');
        expect(defaultOptionKey({ id: 1 })).toBe("1");
    });
});

describe("dirty check of the select adapters", () => {
    it("keeps a ComboboxField pristine when the same option is chosen again as a new object", () => {
        const form = renderForm(
            { category: { id: "1", title: "Tents" } },
            <ComboboxField<Category> name="category" label="Category" loadOptions={async () => []} getOptionLabel={(category) => category.title} />,
        );

        act(() => form.change("category", { id: "1", title: "Tents" }));
        expect(form.getState().dirty).toBe(false);
        act(() => form.change("category", { id: "2", title: "Camping" }));
        expect(form.getState().dirty).toBe(true);
    });

    it("keeps a multiple SelectField pristine when the same values come back as a new list", () => {
        const options = [
            { value: "news", label: "News" },
            { value: "blog", label: "Blog" },
        ];
        const form = renderForm({ tags: ["news"] }, <SelectField<true> name="tags" label="Tags" options={options} multiple />);

        act(() => form.change("tags", ["news", "blog"]));
        expect(form.getState().dirty).toBe(true);
        act(() => form.change("tags", ["news"]));
        expect(form.getState().dirty).toBe(false);
    });

    it("keeps a SelectField without initial value pristine when emptied", () => {
        const form = renderForm(undefined, <SelectField<true> name="tags" label="Tags" options={[{ value: "news", label: "News" }]} multiple />);

        act(() => form.change("tags", []));
        expect(form.getState().dirty).toBe(false);
    });
});
