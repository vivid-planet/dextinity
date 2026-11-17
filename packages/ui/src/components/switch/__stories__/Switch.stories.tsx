import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, hasFieldArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Switch, type SwitchProps } from "../Switch";
import switchTokens from "../Switch.tokens.scss?raw";
import styles from "./Switch.stories.module.scss";

type SwitchStoryArgs = SwitchProps & Pick<FieldStoryArgs, "required" | "helperText" | "validationMessage" | "state">;

/**
 * Binds the value to its story arg, so the Controls panel drives it and a change on the canvas updates the arg. With a field arg, it
 * puts the switch in a `Field` with `layout="group"`.
 */
function ControlledSwitch({ storyId, ...args }: SwitchStoryArgs & { storyId: string }) {
    const { field, control } = splitFieldArgs(args, ["size"]);
    const [checked, setChecked] = useControlledArg(control, "checked", { id: storyId });
    const toggle = (
        <Switch
            {...control}
            checked={checked}
            onChange={(next) => {
                control.onChange(next);
                setChecked(next);
            }}
        />
    );
    return hasFieldArgs(field) ? (
        <StoryField field={field} layout="group">
            {toggle}
        </StoryField>
    ) : (
        toggle
    );
}

/** A switch of a story that shows several side by side, each with its own state; the `checked` prop sets the initial state. */
function StatefulSwitch(args: SwitchStoryArgs) {
    const { field, control } = splitFieldArgs(args, ["size"]);
    const [checked, setChecked] = useState(control.checked);
    const toggle = (
        <Switch
            {...control}
            checked={checked}
            onChange={(next) => {
                control.onChange(next);
                setChecked(next);
            }}
        />
    );
    return hasFieldArgs(field) ? (
        <StoryField field={field} layout="group">
            {toggle}
        </StoryField>
    ) : (
        toggle
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
        required: fieldArgTypes.required,
        helperText: fieldArgTypes.helperText,
        validationMessage: fieldArgTypes.validationMessage,
        state: fieldArgTypes.state,
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args, context) => <ControlledSwitch {...args} storyId={context.id} />,
} satisfies Meta<SwitchStoryArgs>;

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
    argTypes: { checked: { control: false } },
    render: (args) => (
        <div className={styles.states}>
            <StatefulSwitch {...args} children={undefined} aria-label="Off" />
            <StatefulSwitch {...args} children={undefined} aria-label="On" checked />
            <StatefulSwitch {...args} children={undefined} aria-label="Disabled" disabled />
            <StatefulSwitch {...args} children={undefined} aria-label="Disabled on" checked disabled />
        </div>
    ),
};

/**
 * Settings stacked in a list, separated by hairlines.
 */
export const SettingsList: Story = {
    argTypes: { checked: { control: false } },
    render: (args) => (
        <div className={styles.settings}>
            <StatefulSwitch {...args} description="The page stays reachable but doesn't appear in the navigation." />
            <StatefulSwitch {...args} checked description="Search engines may list this page.">
                Index in search engines
            </StatefulSwitch>
            <StatefulSwitch {...args} disabled description="Only administrators can change this setting.">
                Lock page
            </StatefulSwitch>
        </div>
    ),
};

/**
 * A switch that must be on, e.g. to accept terms, goes in a `Field` with `required` and `layout="group"`; without a field label, the star
 * follows the switch's text.
 */
export const Required: Story = {
    args: { required: true, children: "Accept the terms" },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("switch", { name: "Accept the terms" })).toHaveAttribute("aria-required", "true");
    },
};

/**
 * The field's message sits below the switch and describes it: `<Field layout="group" state="error" validationMessage="…"><Switch>…</Switch></Field>`.
 *
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
