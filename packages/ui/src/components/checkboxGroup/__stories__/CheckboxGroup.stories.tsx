import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import checkboxGroupTokens from "../_tokens.scss?raw";
import { CheckboxGroup, type CheckboxGroupOption, type CheckboxGroupProps } from "../CheckboxGroup";

/** Keeps the story controlled: toggling updates the local value; changing the `value` control starts over from it. */
function ControlledCheckboxGroup(props: CheckboxGroupProps) {
    const [value, setValue] = useState(props.value);
    return (
        <CheckboxGroup
            {...props}
            value={value}
            onChange={(next) => {
                props.onChange(next);
                setValue(next);
            }}
        />
    );
}

const contentScopes: CheckboxGroupOption[] = [
    {
        value: "main",
        label: "Main",
        description: "example.com",
        children: [
            { value: "main-de", label: "German" },
            { value: "main-en", label: "English" },
            { value: "main-fr", label: "French" },
        ],
    },
    {
        value: "secondary",
        label: "Secondary",
        description: "example.at",
        children: [
            { value: "secondary-de", label: "German" },
            { value: "secondary-en", label: "English", disabled: true },
        ],
    },
];

const meta = {
    component: CheckboxGroup,
    title: "Building blocks/Selection & toggles/CheckboxGroup",
    decorators: [themeDecorator],
    parameters: { tokens: checkboxGroupTokens },
    render: (args) => <ControlledCheckboxGroup key={JSON.stringify(args.value)} {...args} />,
    args: {
        label: "Channels",
        options: [
            { value: "website", label: "Website" },
            { value: "newsletter", label: "Newsletter" },
            { value: "social", label: "Social media" },
        ],
        value: ["website"],
        onChange: fn(),
    },
    argTypes: {
        orientation: { control: "radio", options: ["vertical", "horizontal"] },
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof CheckboxGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 * - Always controlled: `value` + `onChange`, the values of the checked options in the options' order.
 * - For many options, a `Select` with `multiple`.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("checkbox", { name: "Newsletter" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(["website", "newsletter"]));
        await userEvent.click(canvas.getByRole("checkbox", { name: "Website" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(["newsletter"]));
        await expect(canvas.getByRole("group", { name: "Channels" })).toBeInTheDocument();
    },
};

export const Horizontal: Story = {
    args: { orientation: "horizontal" },
};

/**
 * "Select all" above the options selects or clears all of them.
 */
export const SelectAll: Story = {
    args: { selectAllLabel: "All channels" },
    play: async ({ args, canvas }) => {
        const selectAll = canvas.getByRole("checkbox", { name: "All channels" });
        await expect(selectAll).toHaveAttribute("aria-checked", "mixed");
        await userEvent.click(selectAll);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(["website", "newsletter", "social"]));
        await userEvent.click(selectAll);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith([]));
    },
};

/**
 * Options inside groups, e.g. the languages of each domain for content scopes. A group's checkbox selects or clears all its enabled
 * options and shows a partial selection; its own value is never part of `value`.
 */
export const Hierarchical: Story = {
    args: { label: "Content scopes", options: contentScopes, value: ["main-de"], selectAllLabel: "All scopes" },
    play: async ({ args, canvas }) => {
        const main = canvas.getByRole("checkbox", { name: /Main/ });
        await expect(main).toHaveAttribute("aria-checked", "mixed");
        await userEvent.click(main);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(["main-de", "main-en", "main-fr"]));
        await expect(main).toHaveAttribute("aria-checked", "true");
        await userEvent.click(canvas.getByRole("checkbox", { name: /Secondary/ }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(["main-de", "main-en", "main-fr", "secondary-de"]));
    },
};

/**
 * Without `selectableGroups`, a group's label is a heading above its options.
 */
export const Grouped: Story = {
    args: { label: "Content scopes", options: contentScopes, value: ["main-de"], selectableGroups: false },
};

export const HelperText: Story = {
    args: { helperText: "Where the job is published." },
};

export const Disabled: Story = {
    args: { disabled: true },
};

/**
 * **Rules**
 * - Say what is missing and how to fix it.
 */
export const Error: Story = {
    args: { value: [], required: true, state: "error", validationMessage: "Select at least one channel." },
    play: async ({ canvas }) => {
        const group = canvas.getByRole("group", { name: "Channels" });
        await expect(group).toHaveAccessibleDescription("Select at least one channel.");
        await expect(canvas.getByRole("checkbox", { name: "Website" })).toBeInvalid();
    },
};

export const Warning: Story = {
    args: { value: ["social"], state: "warning", validationMessage: "Social media posts need an image." },
};

export const Success: Story = {
    args: { state: "success", validationMessage: "Published on all selected channels." },
};
