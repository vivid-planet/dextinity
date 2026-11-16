import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, hasFieldArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { recordArgsUpdates, updateStoryArgs, useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Checkbox, type CheckboxProps } from "../Checkbox";
import checkboxTokens from "../Checkbox.tokens.scss?raw";
import styles from "./Checkbox.stories.module.scss";

type CheckboxStoryArgs = CheckboxProps & Pick<FieldStoryArgs, "required" | "helperText" | "validationMessage" | "state">;

/**
 * Binds the checkbox to the `checked` arg in both directions. With a field arg, it puts the checkbox in a `Field` with `layout="group"`.
 */
function ControlledCheckbox({ storyId, ...args }: CheckboxStoryArgs & { storyId: string }) {
    const { field, control } = splitFieldArgs(args);
    const [checked, setChecked] = useControlledArg(control, "checked", { id: storyId });
    const checkbox = (
        <Checkbox
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
            {checkbox}
        </StoryField>
    ) : (
        checkbox
    );
}

/** A checkbox of a story that shows several side by side, each with its own state; the `checked` prop sets the initial state. */
function StatefulCheckbox(args: CheckboxStoryArgs) {
    const { field, control } = splitFieldArgs(args);
    const [checked, setChecked] = useState(control.checked);
    const checkbox = (
        <Checkbox
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
            {checkbox}
        </StoryField>
    ) : (
        checkbox
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
        required: fieldArgTypes.required,
        helperText: fieldArgTypes.helperText,
        validationMessage: fieldArgTypes.validationMessage,
        state: fieldArgTypes.state,
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args, context) => <ControlledCheckbox {...args} storyId={context.id} />,
} satisfies Meta<CheckboxStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Always controlled: `checked` + `onChange`.
 * - Checkbox for selecting items, switch for turning a setting on or off.
 */
export const Default: Story = {
    play: async ({ args, canvas, id, abortSignal }) => {
        const updatedArgs = recordArgsUpdates({ id, abortSignal });
        const control = canvas.getByRole("checkbox", { name: "Show in navigation" });
        await userEvent.click(control);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(true));
        await expect(control).toHaveAttribute("aria-checked", "true");
        await waitFor(() => expect(updatedArgs).toEqual({ checked: true }));
        await userEvent.click(canvas.getByText("Show in navigation"));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(updatedArgs).toEqual({ checked: false }));
        await expect(control).toHaveAttribute("aria-checked", "false");
        updateStoryArgs(id, { checked: true });
        await waitFor(() => expect(control).toHaveAttribute("aria-checked", "true"));
        await expect(args.onChange).toHaveBeenCalledTimes(2);
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
    argTypes: { checked: { control: false }, indeterminate: { control: false } },
    render: (args) => (
        <div className={styles.row}>
            <StatefulCheckbox {...args}>Empty</StatefulCheckbox>
            <StatefulCheckbox {...args} checked>
                Checked
            </StatefulCheckbox>
            <StatefulCheckbox {...args} indeterminate>
                Partial
            </StatefulCheckbox>
            <StatefulCheckbox {...args} disabled>
                Disabled
            </StatefulCheckbox>
            <StatefulCheckbox {...args} checked disabled>
                Disabled checked
            </StatefulCheckbox>
        </div>
    ),
};

/**
 * "Select all" over a list: checked when all items are, indeterminate when some are.
 */
export const SelectAll: Story = {
    parameters: { controls: { disable: true } },
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
 * A checkbox that must be checked, e.g. to accept terms, goes in a `Field` with `required` and `layout="group"`; without a field label,
 * the star follows the checkbox's text.
 */
export const Required: Story = {
    args: { required: true, children: "I accept the terms" },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("checkbox", { name: "I accept the terms" })).toBeRequired();
    },
};

/**
 * The field's message sits below the checkbox and describes it: `<Field layout="group" state="error" validationMessage="…"><Checkbox>…</Checkbox></Field>`.
 *
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
