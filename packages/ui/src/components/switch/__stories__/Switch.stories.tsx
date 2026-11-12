import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Switch, type SwitchProps } from "../Switch";
import switchTokens from "../Switch.tokens.scss?raw";
import styles from "./Switch.stories.module.scss";

/** Keeps the story controlled: toggling updates the local state; the `checked` arg sets the initial state. */
function ControlledSwitch(props: SwitchProps) {
    const [checked, setChecked] = useState(props.checked);
    return (
        <Switch
            {...props}
            checked={checked}
            onChange={(next) => {
                props.onChange(next);
                setChecked(next);
            }}
        />
    );
}

const meta = {
    component: Switch,
    title: "Building blocks/Selection & toggles/Switch",
    decorators: [themeDecorator],
    parameters: { tokens: switchTokens },
    args: {
        children: "Hide in menu",
        checked: false,
        onChange: fn(),
    },
    argTypes: {
        size: { control: "radio", options: ["default", "small"] },
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledSwitch {...args} />,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Always controlled: `checked` + `onChange`.
 * - Switch for on/off, checkbox for selecting items.
 * - Don't use a switch that only takes effect after a confirmation without saying so.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const control = canvas.getByRole("switch", { name: "Hide in menu" });
        await userEvent.click(control);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(true));
        await expect(control).toHaveAttribute("aria-checked", "true");
        await userEvent.click(canvas.getByText("Hide in menu"));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(2));
    },
};

export const Checked: Story = {
    args: { checked: true },
};

/**
 * A setting row: the label and a second line on the start side, the switch on the end side.
 */
export const WithDescription: Story = {
    args: { description: "The page stays reachable but doesn't appear in the navigation." },
};

/**
 * Say why the switch can't be changed in `description`.
 */
export const Disabled: Story = {
    args: { disabled: true, description: "Only administrators can change this setting." },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("switch"));
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

export const Small: Story = {
    args: { size: "small" },
};

/**
 * Without a visible label, e.g. in a table cell or a toolbar, `aria-label` names the switch.
 */
export const WithoutLabel: Story = {
    args: { children: undefined, "aria-label": "Hide in menu" },
};

/**
 * Space toggles the focused switch.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("switch")).toHaveFocus();
        await userEvent.keyboard(" ");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(true));
    },
};

/**
 * The states side by side: off, on, disabled off, disabled on.
 */
export const States: Story = {
    render: (args) => (
        <div className={styles.states}>
            <ControlledSwitch {...args} children={undefined} aria-label="Off" />
            <ControlledSwitch {...args} children={undefined} aria-label="On" checked />
            <ControlledSwitch {...args} children={undefined} aria-label="Disabled" disabled />
            <ControlledSwitch {...args} children={undefined} aria-label="Disabled on" checked disabled />
        </div>
    ),
};

/**
 * Settings stacked in a list, separated by hairlines.
 */
export const SettingsList: Story = {
    render: (args) => (
        <div className={styles.settings}>
            <ControlledSwitch {...args} description="The page stays reachable but doesn't appear in the navigation." />
            <ControlledSwitch {...args} checked description="Search engines may list this page.">
                Index in search engines
            </ControlledSwitch>
            <ControlledSwitch {...args} disabled description="Only administrators can change this setting.">
                Lock page
            </ControlledSwitch>
        </div>
    ),
};

/**
 * A switch that must be on, e.g. to accept terms, shows a star after the label.
 */
export const Required: Story = {
    args: { required: true, children: "Accept the terms" },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("switch", { name: "Accept the terms" })).toHaveAttribute("aria-required", "true");
    },
};

/**
 * **Rules**
 * - Say what is missing and how to fix it.
 */
export const Error: Story = {
    args: { required: true, children: "Accept the terms", state: "error", validationMessage: "Accept the terms to publish." },
    play: async ({ canvas }) => {
        const control = canvas.getByRole("switch");
        await expect(control).toBeInvalid();
        await expect(control).toHaveAccessibleDescription("Accept the terms to publish.");
    },
};

export const Warning: Story = {
    args: { checked: true, state: "warning", validationMessage: "Visitors can only reach the page by its URL." },
};

export const Success: Story = {
    args: { checked: true, children: "Index in search engines", state: "success", validationMessage: "The page is in the sitemap." },
};
