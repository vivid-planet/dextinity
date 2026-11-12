import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { SegmentedControl, type SegmentedControlOption, type SegmentedControlProps } from "../SegmentedControl";
import segmentedControlTokens from "../SegmentedControl.tokens.scss?raw";
import styles from "./SegmentedControl.stories.module.scss";

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
        await userEvent.click(canvas.getByRole("radio", { name: "Part-time" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("part"));
        await expect(canvas.getByRole("radio", { name: "Part-time" })).toHaveAttribute("aria-checked", "true");
        await userEvent.click(canvas.getByRole("radio", { name: "Part-time" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(1));
    },
};

/**
 * Icon-only options need an `aria-label` each, which also shows as their tooltip.
 */
export const IconOnly: Story = {
    args: { "aria-label": "Device", options: devices, value: "desktop", size: "small" },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("radio", { name: "Tablet" })).toBeInTheDocument();
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
        await userEvent.click(canvas.getByRole("radio", { name: "Freelance" }));
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

/**
 * The options are a radio group: Tab reaches the chosen option, the arrow keys move to the next one and choose it.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("radio", { name: "Full-time" })).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
        await expect(canvas.getByRole("radio", { name: "Part-time" })).toHaveFocus();
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
        const group = canvas.getByRole("radiogroup", { name: "Employment" });
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

/**
 * When the options don't fit in one row, the control shows the chosen option with a menu of all options; they come back once there is room.
 * With `overflow="wrap"`, the options wrap onto more rows instead.
 */
export const Overflow: Story = {
    parameters: { popupRoom: { side: "below", minHeight: "220px" } },
    args: { "aria-label": "View", options: views, value: "list" },
    render: (args) => (
        <div className={styles.narrow}>
            <ControlledSegmentedControl {...args} />
        </div>
    ),
    play: async ({ args, canvas }) => {
        const trigger = await canvas.findByRole("button", { name: "View List" });
        await expect(canvas.queryByRole("radiogroup")).toBeNull();
        await userEvent.click(trigger);
        await expect(await screen.findByRole("menuitemradio", { name: "List" })).toHaveAttribute("aria-checked", "true");
        await expect(screen.getByRole("menuitemradio", { name: "Gallery" })).toHaveAttribute("aria-disabled", "true");
        await userEvent.click(screen.getByRole("menuitemradio", { name: "Columns" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("columns"));
        await waitFor(() => expect(canvas.getByRole("button", { name: "View Columns" })).toBeInTheDocument());
    },
};

export const OverflowWrap: Story = {
    args: { "aria-label": "View", options: views, value: "list", overflow: "wrap" },
    render: (args) => (
        <div className={styles.narrow}>
            <ControlledSegmentedControl {...args} />
        </div>
    ),
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    },
};
