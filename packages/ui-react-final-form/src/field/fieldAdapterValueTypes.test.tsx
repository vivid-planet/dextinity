import { render, screen } from "@testing-library/react";
import { Form } from "react-final-form";
import { describe, expect, it } from "vitest";

import { InputField } from "../inputField/InputField";
import { SelectField } from "../selectField/SelectField";

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
        </>
    );
}

describe("field adapter value types", () => {
    it("type parse, format and validate with the field's and the control's value", () => {
        render(
            <Form onSubmit={() => undefined} initialValues={{ count: 3, tags: [] }}>
                {() => <TypedFields />}
            </Form>,
        );

        expect(screen.getAllByLabelText("Count")[0]).toHaveValue("3");
    });
});
