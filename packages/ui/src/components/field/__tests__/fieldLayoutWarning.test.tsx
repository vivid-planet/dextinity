import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";

import { Checkbox } from "../../checkbox/Checkbox";
import { RadioGroup } from "../../radioGroup/RadioGroup";
import { Select } from "../../select/Select";
import { Field } from "../Field";

const options = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
];

let warn: MockInstance<typeof console.warn>;

beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
    cleanup();
    warn.mockRestore();
});

describe("Field layout warnings", () => {
    it("warns about a group control in a field without layout group", () => {
        render(
            <Field label="Choice">
                <RadioGroup options={options} value="a" onChange={vi.fn()} />
            </Field>,
        );

        expect(warn).toHaveBeenCalledWith('RadioGroup: put it in a <Field layout="group">. The surrounding Field has layout="inline".');
    });

    it("warns about a box control in a group field", () => {
        render(
            <Field label="Choice" layout="group">
                <Select name="choice" options={options} value="a" onChange={vi.fn()} />
            </Field>,
        );

        expect(warn).toHaveBeenCalledWith('Select: put it in a <Field layout="inline">. The surrounding Field has layout="group".');
    });

    it("warns about a field label next to a checkbox that its text names", () => {
        render(
            <Field label="Terms" layout="group">
                <Checkbox checked={false} onChange={vi.fn()}>
                    I accept the terms
                </Checkbox>
            </Field>,
        );

        expect(warn).toHaveBeenCalledWith(
            "Checkbox: its text names it, so the label of the surrounding Field names nothing. Leave out the Field's label.",
        );
    });

    it("stays quiet for controls in fitting fields", () => {
        render(
            <>
                <Field label="Choice" layout="group">
                    <RadioGroup options={options} value="a" onChange={vi.fn()} />
                </Field>
                <Field label="Choice">
                    <Select name="choice" options={options} value="a" onChange={vi.fn()} />
                </Field>
                <Field layout="group" state="error" validationMessage="Accept the terms.">
                    <Checkbox checked={false} onChange={vi.fn()}>
                        I accept the terms
                    </Checkbox>
                </Field>
            </>,
        );

        expect(warn).not.toHaveBeenCalled();
    });
});
