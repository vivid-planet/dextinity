import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import fieldTokens from "../../field/_tokens.scss?raw";
import textareaTokens from "../_tokens.scss?raw";
import { Textarea, type TextareaProps } from "../Textarea";

/** Keeps the story controlled: typing updates the local value; changing the `value` control starts over from it. */
function ControlledTextarea(props: TextareaProps) {
    const [value, setValue] = useState(props.value);
    return (
        <Textarea
            {...props}
            value={value}
            onChange={(event) => {
                props.onChange(event);
                setValue(event.target.value);
            }}
        />
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
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        size: { control: "radio", options: ["small", "default", "large"] },
        actions: { control: false },
        prefix: { control: false },
        suffix: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Starts with three lines and grows with the content up to `maxRows`.
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
 * The count sits at the label.
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
        const root = canvasElement.querySelector<HTMLElement>(".dextinityTextarea");
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
