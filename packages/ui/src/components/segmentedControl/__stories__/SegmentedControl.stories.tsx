import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { SegmentedControl, type SegmentedControlOption, type SegmentedControlProps } from "../SegmentedControl";
import segmentedControlTokens from "../SegmentedControl.tokens.scss?raw";

const employment: SegmentedControlOption[] = [
    { value: "full", label: "Full-time" },
    { value: "part", label: "Part-time" },
    { value: "freelance", label: "Freelance" },
];

const devices: SegmentedControlOption[] = [
    { value: "desktop", icon: <Icon name="device-desktop" />, "aria-label": "Desktop" },
    { value: "tablet", icon: <Icon name="device-tablet" />, "aria-label": "Tablet" },
    { value: "phone", icon: <Icon name="device-phone" />, "aria-label": "Phone" },
];

const views: SegmentedControlOption[] = [
    { value: "grid", label: "Icons", icon: <Icon name="grid" /> },
    { value: "list", label: "List", icon: <Icon name="list" /> },
    { value: "columns", label: "Columns", icon: <Icon name="columns-3" /> },
    { value: "gallery", label: "Gallery", icon: <Icon name="assets" />, disabled: true },
];

/** Keeps the story controlled: choosing updates the local value; the `value` arg sets the initial one. */
function ControlledSegmentedControl(props: SegmentedControlProps) {
    const [value, setValue] = useState(props.value);
    return (
        <SegmentedControl
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
    component: SegmentedControl,
    title: "Building blocks/Selection & toggles/SegmentedControl",
    decorators: [themeDecorator],
    parameters: { tokens: segmentedControlTokens },
    args: {
        "aria-label": "Employment",
        options: employment,
        value: "full",
        onChange: fn(),
    },
    argTypes: {
        size: { control: "radio", options: ["default", "small"] },
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        options: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledSegmentedControl {...args} />,
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Always controlled: `value` + `onChange`.
 * - Two to four options only; with more, use a `Select`.
 * - Name the group with `aria-label`.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Part-time" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("part"));
        await expect(canvas.getByRole("button", { name: "Part-time" })).toHaveAttribute("aria-pressed", "true");
        await userEvent.click(canvas.getByRole("button", { name: "Part-time" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(1));
    },
};

/**
 * Icon-only options need an `aria-label` each, which also shows as their tooltip.
 */
export const IconOnly: Story = {
    args: { "aria-label": "Device", options: devices, value: "desktop", size: "small" },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("button", { name: "Tablet" })).toBeInTheDocument();
    },
};

export const Small: Story = {
    args: { size: "small" },
};

/**
 * Options with an icon and a label; a single option can be disabled.
 */
export const WithIcons: Story = {
    args: { "aria-label": "View", options: views, value: "grid" },
};

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Freelance" }));
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

/**
 * Arrow keys move the focus between options; Enter or Space chooses the focused one.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("button", { name: "Full-time" })).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
        await expect(canvas.getByRole("button", { name: "Part-time" })).toHaveFocus();
        await userEvent.keyboard(" ");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("part"));
    },
};

/**
 * **Rules**
 * - Say what is missing and how to fix it.
 */
export const Error: Story = {
    args: { state: "error", validationMessage: "Choose the type of employment." },
    play: async ({ canvas }) => {
        const group = canvas.getByRole("group", { name: "Employment" });
        await expect(group).toHaveAttribute("aria-invalid", "true");
        await expect(group).toHaveAccessibleDescription("Choose the type of employment.");
    },
};

export const Warning: Story = {
    args: { state: "warning", validationMessage: "Freelance jobs are not shown on the career page." },
};

export const Success: Story = {
    args: { state: "success", validationMessage: "Matches the job ad." },
};
