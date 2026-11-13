import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Checkbox } from "../../checkbox/Checkbox";
import { DatePicker } from "../../datePicker/DatePicker";
import { Icon } from "../../icon/Icon";
import { Input } from "../../input/Input";
import { RadioGroup } from "../../radioGroup/RadioGroup";
import { Select } from "../../select/Select";
import { Toolbar } from "../../toolbar/Toolbar";
import { ToolbarButton } from "../../toolbar/ToolbarButton";
import { Field, type FieldControlProps } from "../Field";
import fieldTokens from "../Field.tokens.scss?raw";
import styles from "./Field.stories.module.scss";

function TextInput({ name = "title", initialValue = "" }: { name?: string; initialValue?: string }) {
    const [value, setValue] = useState(initialValue);
    return <Input name={name} value={value} onChange={(event) => setValue(event.target.value)} />;
}

function RangeControl(control: FieldControlProps) {
    const [value, setValue] = useState(40);
    return (
        <>
            <input
                {...control}
                type="range"
                min={0}
                max={100}
                className={styles.range}
                value={value}
                onChange={(event) => setValue(Number(event.target.value))}
            />
            <output className={styles.output} htmlFor={control.id}>
                {value}
            </output>
        </>
    );
}

/** Stands in for a third-party editor, e.g. TipTap's `EditorContent`: a toolbar above an editable area. */
function EditorControl(control: FieldControlProps) {
    const [bold, setBold] = useState(false);
    return (
        <>
            <Toolbar aria-label="Formatting" className={styles.editorToolbar} disabled={control.disabled || control.readOnly}>
                <ToolbarButton aria-label="Bold" shortcut="⌘B" pressed={bold} keepFocus onClick={() => setBold(!bold)}>
                    <Icon name="bold" />
                </ToolbarButton>
                <ToolbarButton aria-label="Link" shortcut="⌘K" keepFocus>
                    <Icon name="link-diagonal" />
                </ToolbarButton>
            </Toolbar>
            <div
                id={control.id}
                role="textbox"
                aria-multiline
                aria-labelledby={control["aria-labelledby"]}
                aria-describedby={control["aria-describedby"]}
                aria-invalid={control["aria-invalid"]}
                contentEditable={!control.disabled && !control.readOnly}
                suppressContentEditableWarning
                tabIndex={0}
                className={styles.editor}
            >
                Our team grows: we are looking for a Senior UX Designer in Vienna.
            </div>
        </>
    );
}

const adornmentOptions = {
    Domain: "example.com",
    Unit: "€ / year",
    Search: <Icon name="search" />,
};

const meta = {
    component: Field,
    title: "Building blocks/Form fields/Field",
    decorators: [themeDecorator],
    parameters: { tokens: fieldTokens },
    args: {
        label: "Title",
        children: <TextInput initialValue="Senior UX Designer" />,
    },
    argTypes: {
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        size: { control: "radio", options: ["small", "default", "large"] },
        layout: { control: "radio", options: ["inline", "stacked", "group"] },
        prefix: { control: "select", options: Object.keys(adornmentOptions), mapping: adornmentOptions },
        suffix: { control: "select", options: Object.keys(adornmentOptions), mapping: adornmentOptions },
        children: { control: false },
        actions: { control: false },
        labels: { control: false },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * An `Input` in the frame makes a complete text field: it takes the label, message, and state from the field. Every other control works
 * the same way, e.g. `Select`, `DatePicker`, or `Textarea`: the controls have no label, help, or validation props of their own. A custom
 * control gets the props that connect it to its label and message from the `children` function.
 *
 * **Rules**
 * - Keep the label visible; a placeholder is never the only label.
 * - Help sits below the field and stays visible.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        const control = canvas.getByRole("textbox", { name: "Title" });
        await userEvent.click(canvas.getByText("Title"));
        await expect(control).toHaveFocus();
    },
};

export const HelperText: Story = {
    args: {
        helperText: "Use gender-neutral wording.",
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("textbox")).toHaveAccessibleDescription("Use gender-neutral wording.");
    },
};

/**
 * `helpText` adds an info button right after the label. Hover, keyboard focus, or a tap shows the text in a tooltip, and it describes
 * the control and the button for assistive technology. The button is named "More information"; translate it with `labels.helpText`, and
 * change its icon with `slots.helpIcon` or `slotProps.helpIcon`.
 *
 * **helpText or helperText?**
 * - `helpText` is background most users don't need, e.g. where a value is used. It stays hidden until asked for.
 * - `helperText` is what everyone needs to fill in the field, e.g. the expected format. It is always visible below the field.
 */
export const HelpText: Story = {
    args: {
        label: "Meta title",
        helpText: "Shown in search results and when the page is shared.",
        helperText: "Up to 60 characters.",
    },
    play: async ({ canvas }) => {
        const control = canvas.getByRole("textbox", { name: "Meta title" });
        await expect(control).toHaveAccessibleDescription("Shown in search results and when the page is shared. Up to 60 characters.");
        const button = canvas.getByRole("button", { name: "More information" });
        await expect(button).toHaveAccessibleDescription("Shown in search results and when the page is shared.");
        await userEvent.click(button);
        await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("Shown in search results and when the page is shared."));
        await userEvent.keyboard("{Escape}");
    },
};

/**
 * Every control takes the field's id, label, message, and state: a `Select`, a `DatePicker`, and so on. Group controls, e.g. `RadioGroup`,
 * `CheckboxGroup`, `Slider`, or `FileUpload`, draw their own frame: `layout="group"` leaves out the box, and the label names the control's
 * group. A single `Checkbox` or `Switch` keeps its text as its name; a field without `label` adds just the message.
 */
export const AnyControl: Story = {
    render: () => (
        <div className={styles.stack}>
            <Field label="Location" helperText="Where the job is based." required>
                <Select
                    name="location"
                    value="vienna"
                    onChange={() => undefined}
                    options={[
                        { value: "vienna", label: "Vienna" },
                        { value: "graz", label: "Graz" },
                    ]}
                />
            </Field>
            <Field label="Start date" state="error" validationMessage="Choose a day in the future.">
                <DatePicker name="startDate" value="2026-01-12" onChange={() => undefined} locale="en-GB" />
            </Field>
            <Field label="Employment" layout="group" helpText="Part-time is up to 30 hours a week.">
                <RadioGroup
                    value="full-time"
                    onChange={() => undefined}
                    options={[
                        { value: "full-time", label: "Full-time" },
                        { value: "part-time", label: "Part-time" },
                    ]}
                    orientation="horizontal"
                />
            </Field>
            <Field layout="group" required state="error" validationMessage="Accept the terms to continue.">
                <Checkbox checked={false} onChange={() => undefined}>
                    I accept the terms
                </Checkbox>
            </Field>
        </div>
    ),
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("combobox", { name: "Location Vienna" })).toHaveAccessibleDescription("Where the job is based.");
        await expect(canvas.getByRole("textbox", { name: "Start date" })).toHaveAccessibleDescription("Choose a day in the future.");
        await expect(canvas.getByRole("radiogroup", { name: "Employment" })).toHaveAccessibleDescription("Part-time is up to 30 hours a week.");
        await expect(canvas.getByRole("checkbox", { name: "I accept the terms" })).toHaveAccessibleDescription("Accept the terms to continue.");
    },
};

/**
 * A star after the label marks the field as required — never color alone.
 */
export const Required: Story = {
    args: {
        required: true,
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("textbox")).toBeRequired();
    },
};

/**
 * In the `error`, `warning`, and `success` states, the `validationMessage` replaces the help.
 *
 * **Rules**
 * - Say what is missing and how to fix it.
 * - Show the error at the field, not only after submitting.
 */
export const Error: Story = {
    args: {
        state: "error",
        helperText: "Use gender-neutral wording.",
        validationMessage: "Enter a title.",
        children: <TextInput />,
    },
    play: async ({ canvas }) => {
        const control = canvas.getByRole("textbox");
        await expect(control).toBeInvalid();
        await expect(control).toHaveAccessibleDescription("Enter a title.");
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
        state: "success",
        validationMessage: "The URL is available.",
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

export const Disabled: Story = {
    args: {
        disabled: true,
        children: <TextInput initialValue="JOB-041" />,
    },
};

export const ReadOnly: Story = {
    args: {
        readOnly: true,
        children: <TextInput initialValue="JOB-041" />,
    },
};

/**
 * A spinner replaces the suffix while `loading`.
 */
export const Loading: Story = {
    args: {
        loading: true,
        suffix: "€ / year",
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("textbox")).toHaveAttribute("aria-busy", "true");
    },
};

/**
 * A text prefix is separated by a line, an icon is not.
 */
export const PrefixAndSuffix: Story = {
    render: (args) => (
        <div className={styles.stack}>
            <Field {...args} label="URL" prefix="example.com">
                <TextInput name="url" initialValue="/careers/open-positions" />
            </Field>
            <Field {...args} label="Salary" suffix="€ gross / year">
                <TextInput name="salary" initialValue="58,000" />
            </Field>
            <Field {...args} label="Search" prefix={<Icon name="search" />}>
                <TextInput name="search" />
            </Field>
        </div>
    ),
};

/**
 * Any control fits in the frame: here a range input with its value as output.
 */
export const CustomControl: Story = {
    args: {
        label: "Image quality",
        helperText: "Higher values make larger files.",
        children: (control) => <RangeControl {...control} />,
    },
};

/**
 * `layout="stacked"` lets a multi-line control fill the box from edge to edge, e.g. a third-party editor with its toolbar. Give the
 * editable element the control's `id` and ARIA props, so it is named by the label and described by the message.
 */
export const StackedLayout: Story = {
    args: {
        label: "Description",
        layout: "stacked",
        helperText: "Shown on the job posting.",
        children: (control) => <EditorControl {...control} />,
    },
    play: async ({ canvas }) => {
        const editor = canvas.getByRole("textbox", { name: "Description" });
        await userEvent.click(editor);
        await userEvent.click(canvas.getByRole("button", { name: "Bold" }));
        await expect(canvas.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
        await expect(editor).toHaveFocus();
    },
};
