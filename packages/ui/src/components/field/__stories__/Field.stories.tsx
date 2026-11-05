import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import fieldTokens from "../_tokens.scss?raw";
import { Field, type FieldControlProps } from "../Field";
import styles from "./Field.stories.module.scss";

function TextControl({ initialValue = "", ...control }: FieldControlProps & { initialValue?: string }) {
    const [value, setValue] = useState(initialValue);
    return <input {...control} className={styles.control} value={value} onChange={(event) => setValue(event.target.value)} />;
}

function RangeControl(control: FieldControlProps) {
    const [value, setValue] = useState(40);
    return (
        <>
            <input
                {...control}
                type="range"
                min={0}
                max={100}
                className={styles.range}
                value={value}
                onChange={(event) => setValue(Number(event.target.value))}
            />
            <output className={styles.output} htmlFor={control.id}>
                {value}
            </output>
        </>
    );
}

const adornmentOptions = {
    Domain: "example.com",
    Unit: "€ / year",
    Search: <Icon name="search" />,
};

const meta = {
    component: Field,
    title: "Building blocks/Form fields/Field",
    decorators: [themeDecorator],
    parameters: { tokens: fieldTokens },
    args: {
        label: "Title",
        children: (control) => <TextControl {...control} initialValue="Senior UX Designer" />,
    },
    argTypes: {
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        size: { control: "radio", options: ["small", "default", "large"] },
        prefix: { control: "select", options: Object.keys(adornmentOptions), mapping: adornmentOptions },
        suffix: { control: "select", options: Object.keys(adornmentOptions), mapping: adornmentOptions },
        children: { control: false },
        actions: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The frame passes the props that connect a control to its label and message to the `children` function.
 *
 * **Rules**
 * - Keep the label visible; a placeholder is never the only label.
 * - Help sits below the field and stays visible.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        const control = canvas.getByRole("textbox", { name: "Title" });
        await userEvent.click(canvas.getByText("Title"));
        await expect(control).toHaveFocus();
    },
};

export const HelperText: Story = {
    args: {
        helperText: "Use gender-neutral wording.",
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("textbox")).toHaveAccessibleDescription("Use gender-neutral wording.");
    },
};

/**
 * A star after the label marks the field as required — never color alone.
 */
export const Required: Story = {
    args: {
        required: true,
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("textbox")).toBeRequired();
    },
};

/**
 * In the `error`, `warning`, and `success` states, the `validationMessage` replaces the help.
 *
 * **Rules**
 * - Say what is missing and how to fix it.
 * - Show the error at the field, not only after submitting.
 */
export const Error: Story = {
    args: {
        state: "error",
        helperText: "Use gender-neutral wording.",
        validationMessage: "Enter a title.",
        children: (control) => <TextControl {...control} />,
    },
    play: async ({ canvas }) => {
        const control = canvas.getByRole("textbox");
        await expect(control).toBeInvalid();
        await expect(control).toHaveAccessibleDescription("Enter a title.");
    },
};

export const Warning: Story = {
    args: {
        state: "warning",
        validationMessage: "Titles over 60 characters are cut off in search results.",
    },
};

export const Success: Story = {
    args: {
        state: "success",
        validationMessage: "The URL is available.",
    },
};

export const Small: Story = {
    args: {
        size: "small",
    },
};

export const Large: Story = {
    args: {
        size: "large",
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        children: (control) => <TextControl {...control} initialValue="JOB-041" />,
    },
};

export const ReadOnly: Story = {
    args: {
        readOnly: true,
        children: (control) => <TextControl {...control} initialValue="JOB-041" />,
    },
};

/**
 * A spinner replaces the suffix while `loading`.
 */
export const Loading: Story = {
    args: {
        loading: true,
        suffix: "€ / year",
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("textbox")).toHaveAttribute("aria-busy", "true");
    },
};

/**
 * A text prefix is separated by a line, an icon is not.
 */
export const PrefixAndSuffix: Story = {
    render: (args) => (
        <div className={styles.stack}>
            <Field {...args} label="URL" prefix="example.com">
                {(control) => <TextControl {...control} initialValue="/careers/open-positions" />}
            </Field>
            <Field {...args} label="Salary" suffix="€ gross / year">
                {(control) => <TextControl {...control} initialValue="58,000" />}
            </Field>
            <Field {...args} label="Search" prefix={<Icon name="search" />}>
                {(control) => <TextControl {...control} />}
            </Field>
        </div>
    ),
};

/**
 * Any control fits in the frame: here a range input with its value as output.
 */
export const CustomControl: Story = {
    args: {
        label: "Image quality",
        helperText: "Higher values make larger files.",
        children: (control) => <RangeControl {...control} />,
    },
};
