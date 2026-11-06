import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import fieldTokens from "../../field/_tokens.scss?raw";
import { Icon } from "../../icon/Icon";
import { Kbd } from "../../kbd/Kbd";
import inputTokens from "../_tokens.scss?raw";
import { Input, type InputProps } from "../Input";
import styles from "./Input.stories.module.scss";

/** Keeps the story controlled: typing updates the local value; changing the `value` control starts over from it. */
function ControlledInput(props: InputProps) {
    const [value, setValue] = useState(props.value);
    return (
        <Input
            {...props}
            value={value}
            onChange={(event) => {
                props.onChange(event);
                setValue(event.target.value);
            }}
        />
    );
}

const adornmentOptions = {
    Domain: "example.com",
    Unit: "€ gross / year",
    Search: <Icon name="search" />,
};

const meta = {
    component: Input,
    title: "Building blocks/Form fields/Input",
    decorators: [themeDecorator],
    parameters: { tokens: `${inputTokens}\n${fieldTokens}` },
    render: (args) => <ControlledInput key={args.value} {...args} />,
    args: {
        name: "title",
        label: "Title",
        value: "Senior UX Designer",
        onChange: fn(),
    },
    argTypes: {
        type: { control: "select", options: ["text", "email", "password", "number", "search", "tel", "url"] },
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        size: { control: "radio", options: ["small", "default", "large"] },
        prefix: { control: "select", options: Object.keys(adornmentOptions), mapping: adornmentOptions },
        suffix: { control: "select", options: Object.keys(adornmentOptions), mapping: adornmentOptions },
        actions: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 * - Always controlled: `value` + `onChange`, no `defaultValue`.
 * - Keep the label visible; a placeholder is never the only label.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const input = canvas.getByRole("textbox", { name: "Title" });
        await userEvent.type(input, "!");
        await waitFor(() => expect(args.onChange).toHaveBeenCalled());
        await expect(input).toHaveValue("Senior UX Designer!");
    },
};

export const HelperText: Story = {
    args: {
        helperText: "Use gender-neutral wording, e.g. with a colon.",
    },
};

export const Required: Story = {
    args: {
        required: true,
    },
};

/**
 * The count sits at the label. With `maxLength`, it shows the limit.
 */
export const Count: Story = {
    args: {
        name: "metaTitle",
        label: "Meta title",
        value: "Open positions · Example Inc.",
        maxLength: 60,
        showCount: true,
        helperText: "Recommended: up to 60 characters.",
    },
    play: async ({ canvas }) => {
        await userEvent.type(canvas.getByRole("textbox"), "!");
        await expect(canvas.getByText("30 / 60")).toBeVisible();
    },
};

export const Placeholder: Story = {
    args: {
        value: "",
        placeholder: "e.g. Senior UX Designer",
    },
};

/**
 * Text before the value, e.g. a domain, separated by a line.
 */
export const Prefix: Story = {
    args: {
        name: "path",
        label: "URL",
        prefix: "example.com",
        value: "/careers/open-positions",
    },
};

/**
 * A unit after the value.
 */
export const Suffix: Story = {
    args: {
        name: "salary",
        label: "Salary",
        suffix: "€ gross / year",
        value: "58,000",
        inputMode: "numeric",
    },
};

export const Search: Story = {
    args: {
        name: "query",
        label: "Search",
        type: "search",
        value: "",
        placeholder: "Search job ads",
        prefix: <Icon name="search" />,
        suffix: <Kbd>/</Kbd>,
    },
};

/**
 * **Rules**
 * - Say what is missing and how to fix it.
 * - Show the error at the field; on save, move focus to the first field with an error.
 */
export const Error: Story = {
    args: {
        required: true,
        value: "",
        placeholder: "Title",
        state: "error",
        validationMessage: "Enter a title.",
    },
    play: async ({ canvas }) => {
        const input = canvas.getByRole("textbox");
        await expect(input).toBeInvalid();
        await expect(input).toHaveAccessibleDescription("Enter a title.");
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
        name: "slug",
        label: "URL slug",
        value: "senior-ux-designer",
        state: "success",
        validationMessage: "The URL is available.",
    },
};

export const Disabled: Story = {
    args: {
        name: "jobId",
        label: "Job ID",
        value: "JOB-041",
        disabled: true,
    },
    play: async ({ args, canvas }) => {
        await userEvent.type(canvas.getByRole("textbox"), "x");
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

export const ReadOnly: Story = {
    args: {
        name: "jobId",
        label: "Job ID",
        value: "JOB-041",
        readOnly: true,
    },
};

/**
 * A spinner replaces the suffix, e.g. while a suggestion loads.
 */
export const Loading: Story = {
    args: {
        loading: true,
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

/**
 * Fields in a two-column form grid, as on an edit page.
 */
export const FormGrid: Story = {
    render: () => (
        <div className={styles.grid}>
            <Input name="title" label="Title" required value="Senior UX Designer" helperText="Use gender-neutral wording." onChange={fn()} />
            <Input
                name="metaTitle"
                label="Meta title"
                value="Open positions · Example Inc."
                maxLength={160}
                showCount
                helperText="Recommended: up to 60 characters."
                onChange={fn()}
            />
            <Input name="path" label="URL" prefix="example.com" value="/careers/open-positions" onChange={fn()} />
            <Input name="salary" label="Salary" suffix="€ gross / year" value="58,000" onChange={fn()} />
        </div>
    ),
};
