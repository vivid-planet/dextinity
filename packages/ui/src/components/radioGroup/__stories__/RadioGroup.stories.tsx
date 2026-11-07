import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { RadioGroup, type RadioGroupProps } from "../RadioGroup";
import radioGroupTokens from "../RadioGroup.tokens.scss?raw";

/** Keeps the story controlled: choosing updates the local value; changing the `value` control starts over from it. */
function ControlledRadioGroup(props: RadioGroupProps) {
    const [value, setValue] = useState(props.value);
    return (
        <RadioGroup
            {...props}
            value={value}
            onChange={(next) => {
                props.onChange(next);
                setValue(next);
            }}
        />
    );
}

const meta = {
    component: RadioGroup,
    title: "Building blocks/Selection & toggles/RadioGroup",
    decorators: [themeDecorator],
    parameters: { tokens: radioGroupTokens },
    render: (args) => <ControlledRadioGroup key={args.value} {...args} />,
    args: {
        label: "Employment",
        options: [
            { value: "full-time", label: "Full-time" },
            { value: "part-time", label: "Part-time" },
            { value: "freelance", label: "Freelance" },
        ],
        value: "full-time",
        onChange: fn(),
    },
    argTypes: {
        variant: { control: "radio", options: ["default", "card"] },
        orientation: { control: "radio", options: ["vertical", "horizontal"] },
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 * - Always controlled: `value` + `onChange`, `null` while nothing is chosen.
 * - For two to four options in a toolbar, use `SegmentedControl`; for many options, a `Select`.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("radio", { name: "Part-time" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("part-time"));
        await expect(canvas.getByRole("radio", { name: "Part-time" })).toHaveAttribute("aria-checked", "true");
        await expect(canvas.getByRole("radiogroup", { name: "Employment" })).toBeInTheDocument();
    },
};

/**
 * The arrow keys move the choice; Tab leaves the group.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("radio", { name: "Full-time" })).toHaveFocus();
        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("part-time"));
        await expect(canvas.getByRole("radio", { name: "Part-time" })).toHaveFocus();
    },
};

export const NothingChosen: Story = {
    args: { value: null },
};

export const Horizontal: Story = {
    args: { orientation: "horizontal" },
};

/**
 * Options with a description, e.g. the variants of a block.
 */
export const WithDescriptions: Story = {
    args: {
        label: "Teaser layout",
        value: "image-left",
        options: [
            { value: "image-left", label: "Image left", description: "The image takes a third of the width." },
            { value: "image-top", label: "Image on top", description: "For narrow columns." },
            { value: "text-only", label: "Text only", description: "Without an image." },
        ],
    },
};

/**
 * Bordered cards give options with a description more weight, e.g. when starting builds or choosing a page type.
 */
export const Card: Story = {
    args: { ...WithDescriptions.args, variant: "card" },
};

export const CardHorizontal: Story = {
    args: { ...WithDescriptions.args, variant: "card", orientation: "horizontal" },
};

export const HelperText: Story = {
    args: { helperText: "Shown as a filter on the job board." },
};

export const DisabledOption: Story = {
    args: {
        options: [
            { value: "full-time", label: "Full-time" },
            { value: "part-time", label: "Part-time" },
            { value: "freelance", label: "Freelance", disabled: true },
        ],
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("radio", { name: "Freelance" }));
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

export const Disabled: Story = {
    args: { disabled: true },
};

export const ReadOnly: Story = {
    args: { readOnly: true },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("radio", { name: "Part-time" }));
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

/**
 * Without a visible label, `aria-label` names the group.
 */
export const WithoutLabel: Story = {
    args: { label: undefined, "aria-label": "Employment" },
};

/**
 * **Rules**
 * - Say what is missing and how to fix it.
 */
export const Error: Story = {
    args: { value: null, required: true, state: "error", validationMessage: "Choose the type of employment." },
    play: async ({ canvas }) => {
        const group = canvas.getByRole("radiogroup", { name: "Employment" });
        await expect(group).toHaveAttribute("aria-invalid", "true");
        await expect(group).toHaveAccessibleDescription("Choose the type of employment.");
    },
};

export const Warning: Story = {
    args: { value: "freelance", state: "warning", validationMessage: "Freelance jobs aren't shown on the partner portals." },
};

export const Success: Story = {
    args: { state: "success", validationMessage: "Matches the job description." },
};
