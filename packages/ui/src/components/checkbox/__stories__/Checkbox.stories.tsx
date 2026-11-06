import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import checkboxTokens from "../_tokens.scss?raw";
import { Checkbox, type CheckboxProps } from "../Checkbox";
import styles from "./Checkbox.stories.module.scss";

/** Keeps the story controlled: toggling updates the local state; the `checked` arg sets the initial state. */
function ControlledCheckbox(props: CheckboxProps) {
    const [checked, setChecked] = useState(props.checked);
    return (
        <Checkbox
            {...props}
            checked={checked}
            onChange={(next) => {
                props.onChange(next);
                setChecked(next);
            }}
        />
    );
}

const pages = ["Home", "Jobs", "About us"];

/** "Select all" derives `checked` and `indeterminate` from the selected items. */
function SelectAllList(props: Pick<CheckboxProps, "onChange">) {
    const [selected, setSelected] = useState<string[]>(["Jobs"]);
    const allSelected = selected.length === pages.length;
    return (
        <div className={styles.list}>
            <Checkbox
                checked={allSelected}
                indeterminate={selected.length > 0 && !allSelected}
                onChange={(next) => {
                    props.onChange(next);
                    setSelected(next ? pages : []);
                }}
            >
                Select all
            </Checkbox>
            <div className={styles.nested}>
                {pages.map((page) => (
                    <Checkbox
                        key={page}
                        checked={selected.includes(page)}
                        onChange={(next) => setSelected((current) => (next ? [...current, page] : current.filter((item) => item !== page)))}
                    >
                        {page}
                    </Checkbox>
                ))}
            </div>
        </div>
    );
}

const meta = {
    component: Checkbox,
    title: "Building blocks/Selection & toggles/Checkbox",
    decorators: [themeDecorator],
    parameters: { tokens: checkboxTokens },
    args: {
        children: "Show in navigation",
        checked: false,
        onChange: fn(),
    },
    argTypes: {
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledCheckbox {...args} />,
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Always controlled: `checked` + `onChange`.
 * - Checkbox for selecting items, switch for turning a setting on or off.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const control = canvas.getByRole("checkbox", { name: "Show in navigation" });
        await userEvent.click(control);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(true));
        await expect(control).toHaveAttribute("aria-checked", "true");
        await userEvent.click(canvas.getByText("Show in navigation"));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(2));
    },
};

export const Checked: Story = {
    args: { checked: true },
};

/**
 * A partial selection, e.g. "Select all" when only some items are selected.
 */
export const Indeterminate: Story = {
    args: { indeterminate: true, children: "Select all" },
};

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("checkbox"));
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

/**
 * Without a visible label, e.g. in a table row, `aria-label` names the checkbox.
 */
export const WithoutLabel: Story = {
    args: { children: undefined, "aria-label": "Select row" },
};

/**
 * Space toggles the focused checkbox.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("checkbox")).toHaveFocus();
        await userEvent.keyboard(" ");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(true));
    },
};

/**
 * The states side by side: empty, checked, partial, disabled.
 */
export const States: Story = {
    render: (args) => (
        <div className={styles.row}>
            <ControlledCheckbox {...args}>Empty</ControlledCheckbox>
            <ControlledCheckbox {...args} checked>
                Checked
            </ControlledCheckbox>
            <ControlledCheckbox {...args} indeterminate>
                Partial
            </ControlledCheckbox>
            <ControlledCheckbox {...args} disabled>
                Disabled
            </ControlledCheckbox>
            <ControlledCheckbox {...args} checked disabled>
                Disabled checked
            </ControlledCheckbox>
        </div>
    ),
};

/**
 * "Select all" over a list: checked when all items are, indeterminate when some are.
 */
export const SelectAll: Story = {
    render: (args) => <SelectAllList onChange={args.onChange} />,
    play: async ({ canvas }) => {
        const selectAll = canvas.getByRole("checkbox", { name: "Select all" });
        await expect(selectAll).toHaveAttribute("aria-checked", "mixed");
        await userEvent.click(selectAll);
        await expect(selectAll).toHaveAttribute("aria-checked", "true");
        await expect(canvas.getByRole("checkbox", { name: "Home" })).toHaveAttribute("aria-checked", "true");
    },
};

/**
 * A checkbox that must be checked, e.g. to accept terms, shows a star after the label.
 */
export const Required: Story = {
    args: { required: true, children: "I accept the terms" },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("checkbox", { name: "I accept the terms" })).toBeRequired();
    },
};

/**
 * **Rules**
 * - Say what is missing and how to fix it.
 */
export const Error: Story = {
    args: { required: true, children: "I accept the terms", state: "error", validationMessage: "Accept the terms to continue." },
    play: async ({ canvas }) => {
        const control = canvas.getByRole("checkbox");
        await expect(control).toBeInvalid();
        await expect(control).toHaveAccessibleDescription("Accept the terms to continue.");
    },
};

export const Warning: Story = {
    args: { children: "Notify subscribers", state: "warning", validationMessage: "This sends an email to 2,400 subscribers." },
};

export const Success: Story = {
    args: { checked: true, children: "Index in search engines", state: "success", validationMessage: "The page is in the sitemap." },
};
