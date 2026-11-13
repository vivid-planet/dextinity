import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import fieldTokens from "../../field/Field.tokens.scss?raw";
import { Textarea, type TextareaProps } from "../Textarea";
import textareaTokens from "../Textarea.tokens.scss?raw";

type TextareaStoryArgs = TextareaProps & FieldStoryArgs;

/** Keeps the story controlled: typing updates the local value; changing the `value` control starts over from it. */
function ControlledTextarea(args: TextareaStoryArgs) {
    const { field, control } = splitFieldArgs(args);
    const [value, setValue] = useState(control.value);
    return (
        <StoryField field={field}>
            <Textarea
                {...control}
                value={value}
                onChange={(event) => {
                    control.onChange(event);
                    setValue(event.target.value);
                }}
            />
        </StoryField>
    );
}

const meta = {
    component: Textarea,
    title: "Building blocks/Form fields/Textarea",
    decorators: [themeDecorator],
    parameters: { tokens: `${textareaTokens}\n${fieldTokens}` },
    render: (args) => <ControlledTextarea key={args.value} {...args} />,
    args: {
        name: "tasks",
        label: "Tasks",
        value: "Design interfaces for the admin, AI hub, and chatbot",
        onChange: fn(),
    },
    argTypes: {
        ...fieldArgTypes,
        className: { control: false },
        style: { control: false },
    },
} satisfies Meta<TextareaStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Starts with three lines and grows with the content up to `maxRows`. The `Field` around it adds the label, help, and validation message:
 * `<Field label="Tasks"><Textarea … /></Field>`.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const textarea = canvas.getByRole("textbox", { name: "Tasks" });
        const initialHeight = textarea.getBoundingClientRect().height;
        await userEvent.type(textarea, "{enter}a{enter}b{enter}c{enter}d");
        await waitFor(() => expect(args.onChange).toHaveBeenCalled());
        await expect(textarea.getBoundingClientRect().height).toBeGreaterThan(initialHeight);
    },
};

export const HelperText: Story = {
    args: {
        helperText: "One item per line.",
    },
};

/**
 * The count sits at the end of the field's label row.
 */
export const Count: Story = {
    args: {
        name: "teaser",
        label: "Teaser",
        value: "You design the interfaces of our platform with us.",
        maxLength: 80,
        showCount: true,
    },
};

/**
 * Stops growing after `maxRows`, then scrolls.
 */
export const MaxRows: Story = {
    args: {
        maxRows: 4,
        value: "Research\nConcept\nWireframes\nPrototypes\nUser tests\nHandover",
    },
};

/**
 * The height follows the width too: a narrower field wraps the text onto more lines and grows.
 */
export const NarrowerWidth: Story = {
    args: {
        value: "Design interfaces for the admin, AI hub, and chatbot, together with research, concept, and user tests.",
    },
    play: async ({ canvas, canvasElement }) => {
        const textarea = canvas.getByRole("textbox", { name: "Tasks" });
        const root = canvasElement.querySelector<HTMLElement>(".dextinityField");
        const initialHeight = textarea.getBoundingClientRect().height;
        root?.style.setProperty("inline-size", "160px");
        await waitFor(() => expect(textarea.getBoundingClientRect().height).toBeGreaterThan(initialHeight));
    },
};

/**
 * Without `autoResize`, the height stays at `rows` and the user can drag to resize.
 */
export const FixedHeight: Story = {
    args: {
        autoResize: false,
        rows: 2,
    },
};

export const Error: Story = {
    args: {
        required: true,
        value: "",
        state: "error",
        validationMessage: "Describe at least one task.",
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("textbox")).toHaveAccessibleDescription("Describe at least one task.");
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

export const ReadOnly: Story = {
    args: {
        readOnly: true,
    },
};

export const Small: Story = {
    args: {
        size: "small",
    },
};

/**
 * Without a `Field`, the textarea draws its own box. Name it with `aria-label`.
 */
export const Standalone: Story = {
    render: (args) => <Textarea {...splitFieldArgs(args).control} aria-label="Tasks" />,
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("textbox", { name: "Tasks" })).toBeVisible();
    },
};
