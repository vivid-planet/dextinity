import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import fieldTokens from "../../field/Field.tokens.scss?raw";
import { NumberInput, type NumberInputProps } from "../NumberInput";
import numberInputTokens from "../NumberInput.tokens.scss?raw";

type NumberInputStoryArgs = NumberInputProps & FieldStoryArgs;

/** Keeps the story controlled: typing updates the local value; changing the `value` control starts over from it. */
function ControlledNumberInput(args: NumberInputStoryArgs) {
    const { field, control } = splitFieldArgs(args);
    const [value, setValue] = useState(control.value);
    return (
        <StoryField field={field}>
            <NumberInput
                {...control}
                value={value}
                onChange={(next) => {
                    control.onChange(next);
                    setValue(next);
                }}
            />
        </StoryField>
    );
}

const meta = {
    component: NumberInput,
    title: "Building blocks/Form fields/NumberInput",
    decorators: [themeDecorator],
    parameters: { tokens: `${numberInputTokens}\n${fieldTokens}` },
    render: (args) => <ControlledNumberInput key={args.value} {...args} />,
    args: {
        name: "quantity",
        label: "Quantity",
        value: 3,
        locale: "en-US",
        onChange: fn(),
    },
    argTypes: {
        ...fieldArgTypes,
        className: { control: false },
    },
} satisfies Meta<NumberInputStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Put it in a `Field` for the label, help, and validation message: `<Field label="Quantity"><NumberInput … /></Field>`.
 *
 * **Rules**
 * - Always controlled: `value` + `onChange`, `null` while the field is empty.
 * - Put the unit in the field's `suffix`, not in the label.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const input = canvas.getByRole("textbox", { name: "Quantity" });
        await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(4));
        await userEvent.clear(input);
        await userEvent.type(input, "12");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(12));
        await expect(input).toHaveValue("12");
    },
};

/**
 * The arrow keys change the value by `step`, Shift with an arrow key by `largeStep`.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("textbox", { name: "Quantity" }));
        await userEvent.keyboard("{ArrowUp}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(4));
        await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(-6));
    },
};

/**
 * A price with two decimal places and a unit, formatted for the locale.
 */
export const Price: Story = {
    args: { name: "price", label: "Price", value: 1249.9, decimals: 2, step: 0.5, min: 0, suffix: "€", locale: "de-AT" },
};

/**
 * `min` and `max` limit the value; the step buttons stop at the limits, and an entry outside is corrected when the field loses focus.
 */
export const MinMax: Story = {
    args: { label: "Columns", value: 4, min: 1, max: 4, helperText: "Between 1 and 4." },
    play: async ({ args, canvas }) => {
        await expect(canvas.getByRole("button", { name: "Increase" })).toBeDisabled();
        const input = canvas.getByRole("textbox", { name: "Columns" });
        await userEvent.clear(input);
        await userEvent.type(input, "9");
        await userEvent.tab();
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(4));
        await expect(input).toHaveValue("4");
    },
};

/**
 * Coordinates need many decimal places and allow negative values.
 */
export const Coordinate: Story = {
    args: { name: "latitude", label: "Latitude", value: 47.2692, step: 0.0001, format: { maximumFractionDigits: 6 }, min: -90, max: 90, suffix: "°" },
};

export const Percent: Story = {
    args: { name: "discount", label: "Discount", value: 0.15, step: 0.01, format: { style: "percent" } },
};

export const WithoutSteppers: Story = {
    args: { steppers: false },
};

export const Empty: Story = {
    args: { value: null, placeholder: "0" },
};

export const Disabled: Story = {
    args: { disabled: true },
};

export const ReadOnly: Story = {
    args: { readOnly: true },
};

export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "grid", gap: "var(--dextinity-space-4)", maxWidth: 320 }}>
            <ControlledNumberInput {...args} size="small" label="Small" />
            <ControlledNumberInput {...args} label="Default" />
            <ControlledNumberInput {...args} size="large" label="Large" />
        </div>
    ),
};

/**
 * **Rules**
 * - Say what is missing and how to fix it.
 */
export const Error: Story = {
    args: { value: null, required: true, state: "error", validationMessage: "Enter a quantity." },
    play: async ({ canvas }) => {
        const input = canvas.getByRole("textbox", { name: "Quantity" });
        await expect(input).toBeInvalid();
        await expect(input).toHaveAccessibleDescription("Enter a quantity.");
    },
};
