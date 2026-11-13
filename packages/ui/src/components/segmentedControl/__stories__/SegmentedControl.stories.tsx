import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, hasFieldArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
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
    { value: "gallery", label: "Gallery", icon: <Icon name="images" />, disabled: true },
];

type SegmentedControlStoryArgs = SegmentedControlProps & Pick<FieldStoryArgs, "label" | "helperText" | "validationMessage" | "state">;

/**
 * Keeps the story controlled: choosing updates the local value; the `value` arg sets the initial one. With a field arg, it puts the
 * control in a `Field` with `layout="group"`.
 */
function ControlledSegmentedControl(args: SegmentedControlStoryArgs) {
    const { field, control } = splitFieldArgs(args, ["size"]);
    const [value, setValue] = useState(control.value);
    const segmentedControl = (
        <SegmentedControl
            {...control}
            value={value}
            onChange={(next) => {
                control.onChange(next);
                setValue(next);
            }}
        />
    );
    return hasFieldArgs(field) ? (
        <StoryField field={field} layout="group">
            {segmentedControl}
        </StoryField>
    ) : (
        segmentedControl
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
        label: fieldArgTypes.label,
        helperText: fieldArgTypes.helperText,
        validationMessage: fieldArgTypes.validationMessage,
        state: fieldArgTypes.state,
        options: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledSegmentedControl {...args} />,
} satisfies Meta<SegmentedControlStoryArgs>;

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
 * In a form, a `Field` with `layout="group"` adds the label and the message: `<Field label="Employment" layout="group" state="error"
 * validationMessage="…"><SegmentedControl … /></Field>`.
 *
 * **Rules**
 * - Say what is missing and how to fix it.
 */
export const Error: Story = {
    args: { "aria-label": undefined, label: "Employment", state: "error", validationMessage: "Choose the type of employment." },
    play: async ({ canvas }) => {
        const group = canvas.getByRole("radiogroup", { name: "Employment" });
        await expect(group).toHaveAttribute("aria-invalid", "true");
        await expect(group).toHaveAccessibleDescription("Choose the type of employment.");
    },
};

export const Warning: Story = {
    args: { "aria-label": undefined, label: "Employment", state: "warning", validationMessage: "Freelance jobs are not shown on the career page." },
};

export const Success: Story = {
    args: { "aria-label": undefined, label: "Employment", state: "success", validationMessage: "Matches the job ad." },
};

/**
 * When the options don't fit in one row, the control shows the chosen option with a menu of all options; they come back once there is room.
 * With `overflow="wrap"`, the options wrap onto more rows instead.
 */
export const Overflow: Story = {
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
