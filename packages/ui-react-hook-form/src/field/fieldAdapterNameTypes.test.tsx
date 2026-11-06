import { render } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { CheckboxField } from "../checkboxField/CheckboxField";
import { InputField } from "../inputField/InputField";
import { SegmentedControlField } from "../segmentedControlField/SegmentedControlField";
import { SelectField } from "../selectField/SelectField";

interface FormValues {
    title: string;
    seo: { description: string };
    category: string | null;
    published: boolean;
    layout: "list" | "grid";
}

// `pnpm run lint:tsc` checks the @ts-expect-error lines: each must stay a type error, or the unused directive fails the build
function TypedForm() {
    const { control } = useForm<FormValues>();
    return (
        <>
            <InputField control={control} name="seo.description" label="Description" />
            {/* @ts-expect-error a misspelled path isn't a field of the form values */}
            <InputField control={control} name="titel" label="Title" />
            {/* @ts-expect-error unknown path */}
            <SelectField control={control} name="seo.descriptio" label="Category" options={[]} />
            {/* @ts-expect-error unknown path */}
            <CheckboxField control={control} name="publish" />
            {/* @ts-expect-error unknown path */}
            <SegmentedControlField control={control} name="layouts" options={[]} />
        </>
    );
}

function ContextForm() {
    const form = useForm<FormValues>();
    return (
        <FormProvider {...form}>
            <InputField<FormValues> name="title" label="Title" />
            {/* @ts-expect-error an explicit form values type checks the path without `control` */}
            <InputField<FormValues> name="titel" label="Title" />
        </FormProvider>
    );
}

describe("field adapter names", () => {
    it("are checked against the form values", () => {
        expect(() => render(<TypedForm />)).not.toThrow();
        expect(() => render(<ContextForm />)).not.toThrow();
    });
});
