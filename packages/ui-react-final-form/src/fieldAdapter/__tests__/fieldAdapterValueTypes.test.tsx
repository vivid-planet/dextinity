import { render, screen } from "@testing-library/react";
import { Form } from "react-final-form";
import { describe, expect, it } from "vitest";

import { ComboboxField } from "../../fields/comboboxField/ComboboxField";
import { InputField } from "../../fields/inputField/InputField";
import { PickerField } from "../../fields/pickerField/PickerField";
import { SelectField } from "../../fields/selectField/SelectField";

// `pnpm run lint:tsc` checks the @ts-expect-error lines: each must stay a type error, or the unused directive fails the build
function TypedFields() {
    return (
        <>
            <InputField<number>
                name="count"
                label="Count"
                parse={(value) => Number(value)}
                format={(value) => (value == null ? "" : String(value))}
                validate={(value) => (value < 0 ? "Not negative" : undefined)}
            />
            {/* @ts-expect-error format must return the control's value, a string */}
            <InputField<number> name="count" label="Count" format={(value) => value} />
            {/* @ts-expect-error parse receives the control's value, a string */}
            <InputField<number> name="count" label="Count" parse={(value: number) => value} />
            <SelectField<true> name="tags" label="Tags" options={[]} multiple validate={(value) => (value.length > 3 ? "Too many" : undefined)} />
            <SelectField<false, number>
                name="size"
                label="Size"
                options={[{ value: 10, label: "10" }]}
                validate={(value) => (value != null && value > 50 ? "Too big" : undefined)}
            />
            {/* @ts-expect-error the options' values must have the select's value type */}
            <SelectField<false, number> name="size" label="Size" options={[{ value: "10", label: "10" }]} />
            <ComboboxField<{ id: string }, true>
                name="categories"
                label="Categories"
                loadOptions={async () => []}
                getOptionLabel={(category) => category.id}
                multiple
                validate={(value) => (value.length === 0 ? "Choose one" : undefined)}
            />
            <PickerField<{ path: string }>
                name="target"
                label="Target"
                renderValue={(page) => page.path}
                validate={(value) => (value?.path === "/" ? "Not the home page" : undefined)}
            />
        </>
    );
}

describe("field adapter value types", () => {
    it("type parse, format and validate with the field's and the control's value", () => {
        render(
            <Form onSubmit={() => undefined} initialValues={{ count: 3, tags: [], categories: [] }}>
                {() => <TypedFields />}
            </Form>,
        );

        expect(screen.getAllByLabelText("Count")[0]).toHaveValue("3");
    });
});
