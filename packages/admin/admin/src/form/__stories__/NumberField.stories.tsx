import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Alert } from "../../alert/Alert";
import { FinalForm } from "../../FinalForm";
import { NumberField } from "../../form/fields/NumberField";

type Story = StoryObj<typeof NumberField>;
const config: Meta<typeof NumberField> = {
    component: NumberField,
    title: "components/form/NumberField",
};
export default config;

interface FormValues {
    value?: number | null;
}

export const Default: Story = {
    render: () => (
        <FinalForm<FormValues>
            mode="edit"
            onSubmit={() => {
                // not handled
            }}
            subscription={{ values: true }}
        >
            {({ values }) => (
                <>
                    <NumberField name="value" label="Number Field" fullWidth variant="horizontal" />

                    <Alert title="FormState">
                        <pre>{JSON.stringify(values, null, 2)}</pre>
                    </Alert>
                </>
            )}
        </FinalForm>
    ),
};

const renderFormWithDirtyState = (initialValues: FormValues) => (
    <FinalForm<FormValues>
        mode="edit"
        initialValues={initialValues}
        onSubmit={() => {
            // not handled
        }}
        subscription={{ values: true, dirty: true, pristine: true }}
    >
        {({ values, dirty, pristine }) => (
            <>
                <NumberField name="value" label="Number Field" fullWidth variant="horizontal" />

                <Alert title="FormState">
                    <pre data-testid="form-state">{`dirty: ${dirty}\npristine: ${pristine}\nvalue: ${JSON.stringify(values.value)}`}</pre>
                </Alert>
            </>
        )}
    </FinalForm>
);

/**
 * Regression test: an initial `null` value must not dirty the form on mount.
 *
 * The mount-time value-sync used to call `input.onChange(undefined)`, silently normalising
 * `null` → `undefined` and breaking dirty tracking before the user touched anything.
 */
export const InitialValueNull: Story = {
    tags: ["test"],
    render: () => renderFormWithDirtyState({ value: null }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const formState = await canvas.findByTestId("form-state");

        await expect(formState).toHaveTextContent("dirty: false");
        await expect(formState).toHaveTextContent("pristine: true");
        await expect(formState).toHaveTextContent("value: null");
    },
};

/**
 * Regression test: an initial `undefined` value must not dirty the form on mount.
 */
export const InitialValueUndefined: Story = {
    tags: ["test"],
    render: () => renderFormWithDirtyState({ value: undefined }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const formState = await canvas.findByTestId("form-state");

        await expect(formState).toHaveTextContent("dirty: false");
        await expect(formState).toHaveTextContent("pristine: true");
    },
};

/**
 * A number initial value renders as a locale-formatted display string.
 */
export const InitialValueNumber: Story = {
    tags: ["test"],
    render: () => renderFormWithDirtyState({ value: 1234 }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole<HTMLInputElement>("textbox");

        await expect(input).toHaveValue("1,234");

        const formState = await canvas.findByTestId("form-state");
        await expect(formState).toHaveTextContent("dirty: false");
        await expect(formState).toHaveTextContent("pristine: true");
    },
};
