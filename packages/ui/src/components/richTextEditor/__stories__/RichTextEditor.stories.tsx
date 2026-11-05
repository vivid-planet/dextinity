import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import fieldTokens from "../../field/_tokens.scss?raw";
import { FieldActions } from "../../fieldActions/FieldActions";
import richTextEditorTokens from "../_tokens.scss?raw";
import { RichTextEditor, type RichTextEditorProps } from "../RichTextEditor";

/** Keeps the story controlled: editing updates the local value; changing the `value` control starts over from it. */
function ControlledRichTextEditor(props: RichTextEditorProps) {
    const [value, setValue] = useState(props.value);
    return (
        <RichTextEditor
            {...props}
            value={value}
            onChange={(html) => {
                props.onChange(html);
                setValue(html);
            }}
        />
    );
}

const meta = {
    component: RichTextEditor,
    title: "Building blocks/Form fields/RichTextEditor",
    decorators: [themeDecorator],
    parameters: { tokens: `${richTextEditorTokens}\n${fieldTokens}` },
    render: (args) => <ControlledRichTextEditor key={args.value} {...args} />,
    args: {
        name: "description",
        label: "Rich text",
        value: "<p>You design the interfaces of <strong>Dextinity</strong> with us.</p>",
        onChange: fn(),
        onRequestLink: fn(() => "https://example.com"),
    },
    argTypes: {
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        size: { control: "radio", options: ["small", "default", "large"] },
        toolbar: { control: "check", options: ["heading", "bold", "italic", "bulletList", "orderedList", "link"] },
        actions: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof RichTextEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The value is an HTML string. The toolbar shows which formatting applies at the cursor; ⌘B, ⌘I, and ⌘K work too.
 *
 * **Limitations**
 * - Built on the browser's editing commands: one heading level, no nested lists, tables, or images.
 * - Pasting and dropping insert plain text; incoming HTML is reduced to the toolbar's formatting.
 * - Without `onRequestLink`, the browser's prompt asks for the link target.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const editor = canvas.getByRole("textbox", { name: "Rich text" });
        await userEvent.click(editor);
        await userEvent.keyboard("{Control>}a{/Control}");
        await userEvent.click(canvas.getByRole("button", { name: "Italic" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.stringMatching(/<(i|em)>/)));
        await expect(canvas.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "true");
    },
};

/**
 * A link asks for its target through `onRequestLink`.
 */
export const Link: Story = {
    play: async ({ args, canvas }) => {
        const editor = canvas.getByRole("textbox");
        await userEvent.click(editor);
        await userEvent.keyboard("{Control>}a{/Control}");
        await userEvent.click(canvas.getByRole("button", { name: "Link" }));
        await expect(args.onRequestLink).toHaveBeenCalled();
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.stringContaining('<a href="https://example.com">')));
    },
};

/**
 * Pasted and dropped content arrives as plain text, so formatting from other sources never reaches the value.
 */
export const PasteAndDrop: Story = {
    args: {
        value: "",
    },
    play: async ({ args, canvas }) => {
        const editor = canvas.getByRole("textbox");
        const pasted = new DataTransfer();
        pasted.setData("text/html", "<b>Bold</b><img src=x>");
        pasted.setData("text/plain", "Pasted");
        await userEvent.click(editor);
        editor.dispatchEvent(new ClipboardEvent("paste", { clipboardData: pasted, bubbles: true, cancelable: true }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("Pasted"));

        const dropped = new DataTransfer();
        dropped.setData("text/html", "<em>Dropped</em><img src=x>");
        dropped.setData("text/plain", " and dropped");
        const box = editor.getBoundingClientRect();
        editor.dispatchEvent(
            new DragEvent("drop", { dataTransfer: dropped, clientX: box.right - 2, clientY: box.top + 2, bubbles: true, cancelable: true }),
        );
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.stringContaining("dropped")));
        await expect(editor.querySelector("img, em, b")).toBeNull();
    },
};

export const Placeholder: Story = {
    args: {
        value: "",
        placeholder: "Describe the position …",
    },
    play: async ({ args, canvas }) => {
        await userEvent.type(canvas.getByRole("textbox"), "Hello");
        await expect(args.onChange).toHaveBeenLastCalledWith("Hello");
    },
};

/**
 * `toolbar` limits the formatting, e.g. for short teasers.
 */
export const LimitedToolbar: Story = {
    args: {
        toolbar: ["bold", "italic", "link"],
        minRows: 2,
    },
};

export const Lists: Story = {
    args: {
        value: "<h3>Your tasks</h3><ul><li>Research and concept</li><li>Prototypes</li></ul><ol><li>Apply</li><li>Meet the team</li></ol>",
    },
};

/**
 * Translate and AI at the label, as on other fields.
 */
export const WithActions: Story = {
    args: {
        actions: <FieldActions translate aiAssist onAiSuggest={() => Promise.resolve("Shape the interfaces of Dextinity with us.")} />,
    },
};

export const Error: Story = {
    args: {
        value: "",
        required: true,
        state: "error",
        validationMessage: "Describe the position.",
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("textbox")).toHaveAccessibleDescription("Describe the position.");
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
