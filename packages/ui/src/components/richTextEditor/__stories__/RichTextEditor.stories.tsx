import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import fieldTokens from "../../field/Field.tokens.scss?raw";
import { FieldActions } from "../../fieldActions/FieldActions";
import { RichTextEditor, type RichTextEditorProps } from "../RichTextEditor";
import richTextEditorTokens from "../RichTextEditor.tokens.scss?raw";
import styles from "./RichTextEditor.stories.module.scss";

type RichTextEditorStoryArgs = RichTextEditorProps & FieldStoryArgs;

/** Binds the value to its story arg, so the Controls panel drives it and a change on the canvas updates the arg. */
function ControlledRichTextEditor({ storyId, ...args }: RichTextEditorStoryArgs & { storyId: string }) {
    const { field, control } = splitFieldArgs(args);
    const [value, setValue] = useControlledArg(control, "value", { id: storyId });
    return (
        <StoryField field={field} layout="stacked">
            <RichTextEditor
                {...control}
                value={value}
                onChange={(html) => {
                    control.onChange(html);
                    setValue(html);
                }}
            />
        </StoryField>
    );
}

/** Selects `length` characters of the editor's text from where `text` starts, plus `offset`; user-event can't place a caret in nested editable content. */
function selectText(editor: HTMLElement, text: string, offset = 0, length = 0) {
    const walker = editor.ownerDocument.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const index = node.data.indexOf(text);
        if (index >= 0) {
            const range = editor.ownerDocument.createRange();
            range.setStart(node, index + offset);
            range.setEnd(node, index + offset + length);
            editor.focus();
            const selection = editor.ownerDocument.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
            return;
        }
    }
    throw new globalThis.Error(`"${text}" isn't in the editor`);
}

const modifierKey = navigator.platform.startsWith("Mac") ? "Meta" : "Control";

/** Pastes once the editor has picked up the selection, which it reads on the browser's asynchronous `selectionchange`. */
async function paste(editor: HTMLElement, html: string) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/html", html);
    clipboardData.setData("text/plain", editor.ownerDocument.createRange().createContextualFragment(html).textContent ?? "");
    editor.dispatchEvent(new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true }));
}

const meta = {
    component: RichTextEditor,
    title: "Building blocks/Form fields/RichTextEditor",
    decorators: [themeDecorator],
    parameters: { tokens: `${richTextEditorTokens}\n${fieldTokens}` },
    render: (args, context) => <ControlledRichTextEditor {...args} storyId={context.id} />,
    args: {
        name: "description",
        label: "Rich text",
        value: "<p>You design the interfaces of <strong>Dextinity</strong> with us.</p>",
        onChange: fn(),
        onRequestLink: fn(() => "https://example.com"),
    },
    argTypes: {
        ...fieldArgTypes,
        toolbar: {
            control: "check",
            options: [
                "undoRedo",
                "blockType",
                "bold",
                "italic",
                "underline",
                "strike",
                "subscript",
                "superscript",
                "textAlign",
                "bulletList",
                "orderedList",
                "link",
                "nonBreakingSpace",
                "softHyphen",
            ],
        },
        headingLevels: { control: "check", options: [1, 2, 3, 4, 5, 6] },
        textAlignments: { control: "check", options: ["left", "center", "right", "justify"] },
        labels: { control: false },
        className: { control: false },
    },
} satisfies Meta<RichTextEditorStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Put it in a `Field` with `layout="stacked"` for the label, help, and validation message:
 * `<Field label="Rich text" layout="stacked"><RichTextEditor … /></Field>`. The value is an HTML string. The toolbar shows which formatting applies at the cursor; the usual shortcuts work too, e.g. ⌘B,
 * ⌘I, ⌘K, ⌘Z, and Tab in a list.
 *
 * **Limitations**
 * - The value is HTML, not the JSON content of the CMS's rich text block.
 * - Without `onRequestLink`, the browser's prompt asks for the link target.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const editor = canvas.getByRole("textbox", { name: "Rich text" });
        await userEvent.click(editor);
        await userEvent.keyboard("{Control>}a{/Control}");
        await userEvent.click(canvas.getByRole("button", { name: "Italic" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.stringContaining("<em>")));
        await expect(canvas.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "true");

        await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.not.stringContaining("<em>")));
    },
};

/**
 * Every formatting the editor offers, including underline and alignment, which are off by default.
 */
export const AllFormatting: Story = {
    args: {
        toolbar: [
            "undoRedo",
            "blockType",
            "bold",
            "italic",
            "underline",
            "strike",
            "subscript",
            "superscript",
            "textAlign",
            "bulletList",
            "orderedList",
            "link",
            "nonBreakingSpace",
            "softHyphen",
        ],
        value: '<h2>Join us</h2><p style="text-align: center">You design the <u>interfaces</u> of <s>COMET</s> <strong>Dextinity</strong>, H<sub>2</sub>O and E = mc<sup>2</sup>.</p>',
    },
    play: async ({ args, canvas }) => {
        await expect(canvas.getByRole("button", { name: "Align center" })).toHaveAttribute("aria-pressed", "false");
        selectText(canvas.getByRole("textbox"), "interfaces");
        await waitFor(() => expect(canvas.getByRole("button", { name: "Align center" })).toHaveAttribute("aria-pressed", "true"));
        await userEvent.click(canvas.getByRole("button", { name: "Align right" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.stringMatching(/<p style="text-align: right;?">/)));
    },
};

/**
 * `textAlignments` limits the alignments, in the toolbar and by keyboard: ⇧⌘L, ⇧⌘E, ⇧⌘R, and ⇧⌘J (Ctrl+Shift+L … on Windows and Linux).
 */
export const TextAlignments: Story = {
    args: {
        toolbar: ["bold", "italic", "textAlign"],
        textAlignments: ["left", "center"],
        value: "<p>You design the interfaces of <strong>Dextinity</strong> with us.</p>",
    },
    play: async ({ args, canvas }) => {
        await expect(canvas.queryByRole("button", { name: "Align right" })).toBeNull();
        selectText(canvas.getByRole("textbox"), "interfaces");
        await userEvent.keyboard(`{${modifierKey}>}{Shift>}e{/Shift}{/${modifierKey}}`);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.stringMatching(/<p style="text-align: center;?">/)));
        await expect(canvas.getByRole("button", { name: "Align center" })).toHaveAttribute("aria-pressed", "true");
        await userEvent.keyboard(`{${modifierKey}>}{Shift>}r{/Shift}{/${modifierKey}}`);
        await expect(args.onChange).toHaveBeenLastCalledWith(expect.stringMatching(/<p style="text-align: center;?">/));
    },
};

/**
 * The text style menu switches between a paragraph and the headings of `headingLevels`.
 */
export const TextStyles: Story = {
    args: {
        headingLevels: [2, 3],
        value: "<p>Your tasks</p>",
    },
    play: async ({ args, canvas }) => {
        selectText(canvas.getByRole("textbox"), "Your tasks");
        await userEvent.click(canvas.getByRole("button", { name: "Text style: Paragraph" }));
        await userEvent.click(await screen.findByRole("menuitemradio", { name: "Heading 3" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("<h3>Your tasks</h3>"));
        await expect(canvas.getByRole("button", { name: "Text style: Heading 3" })).toHaveTextContent("Heading 3");
    },
};

/**
 * Subscript, superscript, and the `inlineStyles` share a menu next to bold and italic.
 */
export const MoreFormatting: Story = {
    args: {
        value: "<p>H2O</p>",
    },
    play: async ({ args, canvas }) => {
        selectText(canvas.getByRole("textbox"), "H2O", 1, 1);
        await userEvent.click(canvas.getByRole("button", { name: "More formatting" }));
        await userEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Subscript" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("<p>H<sub>2</sub>O</p>"));
    },
};

/**
 * Formatting of the project's own, stored as `<span data-inline-style="…">`. The project styles it in the editor and where the text
 * is rendered. Without bold, italic, underline, or strikethrough buttons, styles with an icon show as buttons of their own.
 */
export const InlineStyles: Story = {
    decorators: [
        (Story) => (
            <div className={styles.inlineStyles}>
                <Story />
            </div>
        ),
    ],
    args: {
        toolbar: ["subscript", "superscript"],
        inlineStyles: [{ name: "productName", label: "Product name", icon: "highlight" }],
        value: '<p>You design the interfaces of <span data-inline-style="productName">Dextinity</span> with us.</p>',
    },
    play: async ({ canvas }) => {
        selectText(canvas.getByRole("textbox"), "Dextinity", 2);
        await waitFor(() => expect(canvas.getByRole("button", { name: "Product name" })).toHaveAttribute("aria-pressed", "true"));
    },
};

/**
 * A link asks for its target through `onRequestLink`, which receives the current target when the cursor is on a link.
 */
export const Link: Story = {
    play: async ({ args, canvas }) => {
        const editor = canvas.getByRole("textbox");
        await userEvent.click(editor);
        await userEvent.keyboard("{Control>}a{/Control}");
        await userEvent.click(canvas.getByRole("button", { name: "Link" }));
        await waitFor(() => expect(args.onRequestLink).toHaveBeenLastCalledWith(null));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.stringContaining('<a href="https://example.com">')));

        await userEvent.click(canvas.getByRole("button", { name: "Link" }));
        await waitFor(() => expect(args.onRequestLink).toHaveBeenLastCalledWith("https://example.com"));

        await userEvent.click(canvas.getByRole("button", { name: "Remove link" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.not.stringContaining("<a")));
    },
};

/**
 * Lists nest with Tab and the indent buttons. `listLevelMax` limits the depth, also of an item's own sub-list and of pasted lists,
 * whose deeper items become paragraphs. `maxBlocks` limits the number of top-level paragraphs, headings, and lists.
 */
export const Lists: Story = {
    args: {
        listLevelMax: 2,
        value: "<h3>Your tasks</h3><ul><li><p>Research</p></li><li><p>Concept</p><ul><li><p>Interviews</p></li></ul></li><li><p>Prototypes</p></li></ul><ol><li><p>Apply</p></li><li><p>Meet the team</p></li></ol>",
    },
    play: async ({ args, canvas, step }) => {
        const editor = canvas.getByRole("textbox");
        await step("An item moves into the previous item's sub-list", async () => {
            selectText(editor, "Prototypes");
            await waitFor(() => expect(canvas.getByRole("button", { name: "Increase indent" })).toHaveAttribute("aria-disabled", "false"));
            await userEvent.click(canvas.getByRole("button", { name: "Increase indent" }));
            await waitFor(() =>
                expect(args.onChange).toHaveBeenLastCalledWith(expect.stringContaining("<p>Interviews</p></li><li><p>Prototypes</p>")),
            );
            await expect(canvas.getByRole("button", { name: "Increase indent" })).toHaveAttribute("aria-disabled", "true");
        });

        await step("An item whose sub-list would get too deep can't be indented", async () => {
            selectText(editor, "Concept");
            await waitFor(() => expect(canvas.getByRole("button", { name: "Increase indent" })).toHaveAttribute("aria-disabled", "true"));
            await userEvent.keyboard("{Tab}");
            await expect(editor.querySelector("ul ul ul")).toBeNull();
        });

        await step("Pasted lists keep up to two levels", async () => {
            selectText(editor, "Meet the team", 13);
            await paste(editor, "<ul><li>One<ul><li>Two<ul><li>Three<ul><li>Four</li></ul></li></ul></li></ul></li></ul>");
            await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.stringContaining("Four")));
            await expect(editor.querySelector(":is(ul, ol) :is(ul, ol) :is(ul, ol)")).toBeNull();
        });
    },
};

/**
 * `textPlaceholders` inserts tokens that the application replaces later, e.g. in a newsletter. Non-breaking spaces and soft hyphens
 * show a marker while editing.
 */
export const PlaceholdersAndSpecialCharacters: Story = {
    args: {
        textPlaceholders: [
            { name: "firstName", label: "First name" },
            { name: "lastName", label: "Last name" },
        ],
        value: '<p>Dear <span data-type="placeholder" data-name="firstName">{{firstName}}</span>, apply until 30<span data-type="non-breaking-space"> </span>November for the Design<span data-type="soft-hyphen">­</span>system team.</p>',
    },
    play: async ({ args, canvas }) => {
        selectText(canvas.getByRole("textbox"), "team.", 5);
        await userEvent.click(canvas.getByRole("button", { name: "Insert placeholder" }));
        await userEvent.click(await screen.findByRole("menuitem", { name: "Last name" }));
        await waitFor(() =>
            expect(args.onChange).toHaveBeenLastCalledWith(
                expect.stringContaining('<span data-name="lastName" data-type="placeholder">{{lastName}}</span>'),
            ),
        );
    },
};

/**
 * Pasted and dropped content keeps the enabled formatting; everything else, e.g. an image, is left out.
 */
export const PasteAndDrop: Story = {
    args: {
        value: "",
        toolbar: ["bold", "link"],
    },
    play: async ({ args, canvas, step }) => {
        const editor = canvas.getByRole("textbox");
        await step("Paste", async () => {
            await userEvent.click(editor);
            await paste(editor, "<b>Bold</b> <em>italic</em><img src=x>");
            await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("<p><strong>Bold</strong> italic</p>"));
            await expect(editor.querySelector("img, em")).toBeNull();
        });

        await step("Drop", async () => {
            const dataTransfer = new DataTransfer();
            dataTransfer.setData("text/html", " <b>dropped</b> <em>text</em><img src=x>");
            dataTransfer.setData("text/plain", " dropped text");
            const paragraph = canvas.getByText("italic", { exact: false }).getBoundingClientRect();
            editor.dispatchEvent(
                new DragEvent("drop", {
                    dataTransfer,
                    clientX: paragraph.right - 1,
                    clientY: paragraph.top + paragraph.height / 2,
                    bubbles: true,
                    cancelable: true,
                }),
            );
            await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.stringContaining("<strong>dropped</strong> text")));
            await expect(editor.querySelector("img, em")).toBeNull();
        });
    },
};

export const Placeholder: Story = {
    args: {
        value: "",
        placeholder: "Describe the position …",
    },
    play: async ({ args, canvas }) => {
        await userEvent.type(canvas.getByRole("textbox"), "Hello");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("<p>Hello</p>"));
    },
};

/**
 * `toolbar` limits the formatting, e.g. for short teasers. With `maxBlocks`, pasted content is cut off where it would exceed the
 * limit.
 */
export const LimitedToolbar: Story = {
    args: {
        toolbar: ["bold", "italic", "link"],
        minRows: 2,
        maxBlocks: 1,
    },
    play: async ({ args, canvas }) => {
        const editor = canvas.getByRole("textbox");
        await userEvent.click(editor);
        await userEvent.keyboard("{Control>}a{/Control}");
        await paste(editor, "<p>Apply now.</p><p>Second paragraph</p>");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("<p>Apply now.</p>"));
    },
};

/**
 * Translate at the label, as on other fields: the field's `actions`.
 */
export const WithActions: Story = {
    args: {
        actions: <FieldActions translate onTranslate={() => undefined} />,
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

/**
 * Without a `Field`, the editor draws its own box. Name it with `aria-label`.
 */
export const Standalone: Story = {
    render: (args) => <RichTextEditor {...splitFieldArgs(args).control} aria-label="Rich text" />,
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("textbox", { name: "Rich text" })).toBeVisible();
    },
};
