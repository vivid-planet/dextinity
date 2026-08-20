import { Box, chipClasses, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type HTMLAttributes, type ReactNode, useState } from "react";
import { expect, waitFor, within } from "storybook/test";

import { createTipTapRichTextBlock, type TipTapRichTextBlockState } from "../createTipTapRichTextBlock";

function StatePreview({ state }: { state: TipTapRichTextBlockState }) {
    return (
        <Box component="pre" sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", fontSize: 12, overflow: "auto", borderRadius: 1 }}>
            {JSON.stringify(state, null, 2)}
        </Box>
    );
}

function StoryWrapper({ children, state }: { children: ReactNode; state: TipTapRichTextBlockState }) {
    return (
        <>
            {children}
            <StatePreview state={state} />
        </>
    );
}

const TipTapRichTextBlock = createTipTapRichTextBlock();

function TipTapRichTextBlockStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(TipTapRichTextBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <TipTapRichTextBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

const config: Meta<typeof TipTapRichTextBlockStory> = {
    component: TipTapRichTextBlockStory,
    title: "blocks/TipTapRichTextBlock",
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    play: async ({ canvas, step }) => {
        await step("Editor is ready with toolbar", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            // Block type select shows "Paragraph"
            expect(canvas.getByRole("combobox")).toBeInTheDocument();
            expect(canvas.getByText("Paragraph")).toBeInTheDocument();

            // Toolbar has buttons (undo, redo, bold, italic, strike, more, ol, ul, indent, dedent, nbsp, shy)
            const buttons = canvas.getAllByRole("button");
            expect(buttons.length).toBeGreaterThanOrEqual(10);
        });

        await step("Undo/redo are disabled initially", async () => {
            const buttons = canvas.getAllByRole("button");
            // First two buttons are undo and redo
            expect(buttons[0]).toBeDisabled();
            expect(buttons[1]).toBeDisabled();
        });
    },
};

const ReadOnlyBlock = createTipTapRichTextBlock({
    textBlockStyles: [
        {
            name: "intro",
            label: "Intro Text",
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
        },
    ],
});

const readOnlyState: TipTapRichTextBlockState = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "Read-only content" }],
            },
            {
                type: "paragraph",
                attrs: { textBlockStyle: "intro" },
                content: [
                    { type: "text", text: "This content is rendered " },
                    { type: "text", marks: [{ type: "bold" }], text: "read-only" },
                    { type: "text", text: "." },
                ],
            },
        ],
    },
};

export const ReadOnly: Story = {
    render: () => (
        <StoryWrapper state={readOnlyState}>
            <ReadOnlyBlock.ReadOnlyComponent state={readOnlyState} />
        </StoryWrapper>
    ),
    play: async ({ canvas, canvasElement, step }) => {
        await step("Saved content renders", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("heading", { level: 1, name: "Read-only content" })).toBeInTheDocument();
                    expect(canvas.getByText("read-only")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step(
            "The block's own text block style is applied — this needs the block's textBlockStyles reaching the read-only renderer",
            async () => {
                await waitFor(
                    () => {
                        const styledElement = canvasElement.querySelector('[data-text-block-style="intro"]');
                        expect(styledElement).not.toBeNull();
                        expect(styledElement).toHaveStyle({ fontStyle: "italic" });
                    },
                    { timeout: 3000 },
                );
            },
        );

        await step("No element is editable", async () => {
            for (const element of Array.from(canvasElement.querySelectorAll("[contenteditable]"))) {
                expect(element).toHaveAttribute("contenteditable", "false");
            }
        });

        await step("No editing toolbar is rendered", async () => {
            // The editor keeps its textbox role when read-only, so the toolbar's absence is the tell.
            expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
            expect(canvas.queryAllByRole("button")).toHaveLength(0);
        });
    },
};

const BoldOnlyBlock = createTipTapRichTextBlock({ supports: ["bold"] });

function BoldOnlyStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(BoldOnlyBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <BoldOnlyBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const BoldOnly: StoryObj<typeof BoldOnlyStory> = {
    render: () => <BoldOnlyStory />,
    play: async ({ canvas, step }) => {
        await step("Editor is ready with minimal toolbar", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            // Only bold button, no heading select
            expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
            expect(canvas.queryByText("Default")).not.toBeInTheDocument();

            // Exactly 1 button (bold only — no undo/redo, no lists, no special chars)
            const buttons = canvas.getAllByRole("button");
            expect(buttons).toHaveLength(1);
        });
    },
};

const TextBlockStylesBlock = createTipTapRichTextBlock({
    textBlockStyles: [
        {
            name: "large-heading",
            label: "Large Heading",
            appliesTo: ["heading-1", "heading-2"],
            element: (p) => <Typography sx={{ fontSize: 48, lineHeight: 1.2 }} variant="h1" {...p} />,
        },
        {
            name: "intro",
            label: "Intro Text",
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
        },
        {
            name: "highlight",
            label: "Highlight",
            element: (props: HTMLAttributes<HTMLElement>) => <div style={{ backgroundColor: "#fff3cd", padding: 8 }} {...props} />,
        },
    ],
});

function TextBlockStylesStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(TextBlockStylesBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <TextBlockStylesBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const TextBlockStyles: StoryObj<typeof TextBlockStylesStory> = {
    render: () => <TextBlockStylesStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with text block style dropdown", async () => {
            // Block type select shows "Paragraph", text block style select shows "Default"
            await waitFor(
                () => {
                    const comboboxes = canvas.getAllByRole("combobox");
                    expect(comboboxes).toHaveLength(2);
                },
                { timeout: 5000 },
            );

            const comboboxes = canvas.getAllByRole("combobox");
            expect(comboboxes[0]).toHaveTextContent("Paragraph");
            expect(comboboxes[1]).toHaveTextContent("Default");
        });

        await step("Select text block style 'Intro Text'", async () => {
            // Click the second combobox (text block style select)
            const comboboxes = canvas.getAllByRole("combobox");
            await userEvent.click(comboboxes[1]);

            await waitFor(
                () => {
                    expect(within(document.body).getByRole("option", { name: "Intro Text" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByRole("option", { name: "Intro Text" }));

            await waitFor(
                () => {
                    expect(canvas.getByText("Intro Text")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Typing into a styled block preserves character order (cursor does not jump to start)", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("hello");

            await waitFor(
                () => {
                    expect(editor).toHaveTextContent("hello");
                },
                { timeout: 3000 },
            );
        });
    },
};

const PlaceholdersBlock = createTipTapRichTextBlock({
    placeholders: [
        { name: "firstName", label: "First Name" },
        { name: "lastName", label: "Last Name" },
        { name: "email", label: "Email Address" },
        { name: "company", label: "Company" },
    ],
});

function PlaceholdersStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(PlaceholdersBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <PlaceholdersBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const Placeholders: StoryObj<typeof PlaceholdersStory> = {
    render: () => <PlaceholdersStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with placeholder button", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            // The placeholder button is identified by its accessible name, not by index among all toolbar buttons
            expect(canvas.getByRole("button", { name: "Insert placeholder" })).toBeInTheDocument();
        });

        await step("Open the placeholder menu and insert 'First Name'", async () => {
            await userEvent.click(canvas.getByRole("button", { name: "Insert placeholder" }));

            // The menu is rendered in a portal, so it lives in document.body rather than within the canvas
            await waitFor(
                () => {
                    expect(within(document.body).getByRole("menuitem", { name: "First Name" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByRole("menuitem", { name: "First Name" }));
        });

        await step("Inserted placeholder is rendered as a chip in the editor", async () => {
            const editor = canvas.getByRole("textbox");
            // Placeholders render as chips labelled `{{name}}`
            await waitFor(
                () => {
                    expect(within(editor).getByText("{{firstName}}")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Block state contains the placeholder node", async () => {
            await waitFor(
                () => {
                    const state = JSON.parse(canvas.getByText(/"tipTapContent"/).textContent ?? "{}");
                    const [paragraph] = state.tipTapContent.content;
                    expect(paragraph.content).toContainEqual({ type: "placeholder", attrs: { name: "firstName" } });
                },
                { timeout: 3000 },
            );
        });
    },
};

const PlaceholdersWithContentBlock = createTipTapRichTextBlock({
    supports: ["bold", "italic"],
    placeholders: [
        { name: "firstName", label: "First Name" },
        { name: "lastName", label: "Last Name" },
        { name: "email", label: "Email Address" },
    ],
});

function PlaceholdersWithContentStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>({
        tipTapContent: {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [
                        { type: "text", text: "Hello " },
                        { type: "placeholder", attrs: { name: "firstName" } },
                        { type: "text", text: " " },
                        { type: "placeholder", attrs: { name: "lastName" } },
                        { type: "text", text: ", welcome to our platform!" },
                    ],
                },
                {
                    type: "paragraph",
                    content: [
                        { type: "text", text: "Your registered email is: " },
                        { type: "placeholder", attrs: { name: "email" } },
                    ],
                },
            ],
        },
    });

    return (
        <StoryWrapper state={state}>
            <PlaceholdersWithContentBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const PlaceholdersWithContent: StoryObj<typeof PlaceholdersWithContentStory> = {
    render: () => <PlaceholdersWithContentStory />,
    play: async ({ canvas, step }) => {
        await step("Editor is ready", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Pre-filled placeholders are rendered as chips", async () => {
            const editor = canvas.getByRole("textbox");

            await waitFor(
                () => {
                    // Each placeholder is rendered as a chip labelled `{{name}}` (not as plain text)
                    for (const name of ["firstName", "lastName", "email"]) {
                        const chipLabel = within(editor).getByText(`{{${name}}}`);
                        expect(chipLabel.closest(`.${chipClasses.root}`)).toBeInTheDocument();
                    }
                },
                { timeout: 3000 },
            );

            // Text surrounding the chips is preserved
            expect(editor).toHaveTextContent("Hello {{firstName}} {{lastName}}, welcome to our platform!");
            expect(editor).toHaveTextContent("Your registered email is: {{email}}");
        });
    },
};

const TextBlockStyleInteractionsBlock = createTipTapRichTextBlock({
    textBlockStyles: [
        {
            name: "chapter-heading",
            label: "Chapter Heading",
            appliesTo: ["heading-1"],
            element: (props: HTMLAttributes<HTMLElement>) => <h1 style={{ textTransform: "uppercase", letterSpacing: "0.1em" }} {...props} />,
        },
        {
            name: "large-heading",
            label: "Large Heading",
            appliesTo: ["heading-1", "heading-2"],
            element: (p) => <Typography sx={{ fontSize: 48, lineHeight: 1.2 }} variant="h1" {...p} />,
        },
        {
            name: "intro",
            label: "Intro Text",
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
        },
        {
            name: "highlight",
            label: "Highlight",
            element: (props: HTMLAttributes<HTMLElement>) => <div style={{ backgroundColor: "#fff3cd", padding: 8 }} {...props} />,
        },
    ],
});

function TextBlockStyleInteractionsStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(TextBlockStyleInteractionsBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <TextBlockStyleInteractionsBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const TextBlockStyleInteractions: StoryObj<typeof TextBlockStyleInteractionsStory> = {
    render: () => <TextBlockStyleInteractionsStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Select Heading 1", async () => {
            const textBlockTypeSelect = canvas.getAllByRole("combobox")[0];
            await userEvent.click(textBlockTypeSelect);

            await waitFor(
                () => {
                    expect(within(document.body).getByText("Heading 1")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
            await userEvent.click(within(document.body).getByText("Heading 1"));

            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[0]).toHaveTextContent("Heading 1");
                },
                { timeout: 3000 },
            );
        });

        await step("Verify available styles for Heading 1: Chapter Heading, Large Heading, Highlight — but not Intro Text", async () => {
            const textBlockStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(textBlockStyleSelect);

            await waitFor(
                () => {
                    const body = within(document.body);
                    expect(body.getByText("Chapter Heading")).toBeInTheDocument();
                    expect(body.getByText("Large Heading")).toBeInTheDocument();
                    expect(body.getByText("Highlight")).toBeInTheDocument();
                    expect(body.queryByText("Intro Text")).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Select 'Chapter Heading' style (heading-1 only)", async () => {
            await userEvent.click(within(document.body).getByText("Chapter Heading"));

            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Chapter Heading");
                },
                { timeout: 3000 },
            );
        });

        await step("Verify chapter heading styling is applied (uppercase)", async () => {
            await waitFor(
                () => {
                    const styledEl = document.querySelector('[data-text-block-style="chapter-heading"]');
                    expect(styledEl).toBeTruthy();
                    expect(styledEl).toHaveStyle({ textTransform: "uppercase" });
                },
                { timeout: 3000 },
            );
        });

        await step("Switch to Heading 2", async () => {
            const textBlockTypeSelect = canvas.getAllByRole("combobox")[0];
            await userEvent.click(textBlockTypeSelect);

            await waitFor(
                () => {
                    expect(within(document.body).getByText("Heading 2")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
            await userEvent.click(within(document.body).getByText("Heading 2"));

            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[0]).toHaveTextContent("Heading 2");
                },
                { timeout: 3000 },
            );
        });

        await step("Block style auto-resets to Default (Chapter Heading doesn't apply to heading-2)", async () => {
            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Default");
                },
                { timeout: 3000 },
            );
        });

        await step("Verify chapter heading styling is removed", async () => {
            await waitFor(
                () => {
                    expect(document.querySelector("[data-text-block-style]")).toBeNull();
                },
                { timeout: 3000 },
            );
        });
    },
};

const ListTextBlockStylesBlock = createTipTapRichTextBlock({
    supports: ["bold", "ordered-list", "unordered-list", "heading"],
    textBlockStyles: [
        {
            name: "intro",
            label: "Intro Text",
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
        },
        {
            name: "list-large",
            label: "List Large",
            appliesTo: ["ordered-list", "unordered-list"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 18, lineHeight: "26px" }} {...props} />,
        },
        {
            name: "list-small",
            label: "List Small",
            appliesTo: ["ordered-list", "unordered-list"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 14, lineHeight: "20px" }} {...props} />,
        },
        {
            name: "ol-only",
            label: "Numbered Style",
            appliesTo: ["ordered-list"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 16, fontWeight: 600 }} {...props} />,
        },
        {
            name: "universal",
            label: "Universal",
            element: (props: HTMLAttributes<HTMLElement>) => <div style={{ backgroundColor: "#e8f5e9", padding: 4 }} {...props} />,
        },
    ],
});

function ListTextBlockStylesStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(ListTextBlockStylesBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <ListTextBlockStylesBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const ListTextBlockStyles: StoryObj<typeof ListTextBlockStylesStory> = {
    render: () => <ListTextBlockStylesStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with two comboboxes", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                    expect(canvas.getAllByRole("combobox")).toHaveLength(2);
                },
                { timeout: 5000 },
            );
        });

        await step("Paragraph mode: text block style dropdown shows paragraph-applicable styles only", async () => {
            const textBlockStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(textBlockStyleSelect);

            await waitFor(
                () => {
                    const body = within(document.body);
                    expect(body.getByText("Intro Text")).toBeInTheDocument();
                    expect(body.getByText("Universal")).toBeInTheDocument();
                    expect(body.queryByText("List Large")).not.toBeInTheDocument();
                    expect(body.queryByText("List Small")).not.toBeInTheDocument();
                    expect(body.queryByText("Numbered Style")).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.keyboard("{Escape}");
        });

        await step("Click the editor, then type text so list toggle works", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("List item text");
        });

        await step("Toggle bullet list via keyboard shortcut", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            // TipTap binds list shortcuts to Mod-Shift-{7,8}: Meta on Mac, Control elsewhere
            const mod = /Mac/i.test(navigator.platform) ? "Meta" : "Control";
            await userEvent.keyboard(`{${mod}>}{Shift>}8{/Shift}{/${mod}}`);

            await waitFor(
                () => {
                    expect(editor.querySelector("ul")).toBeTruthy();
                },
                { timeout: 3000 },
            );
        });

        await step("Unordered list mode: text block style dropdown shows UL-applicable styles", async () => {
            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox").length).toBeGreaterThanOrEqual(2);
                },
                { timeout: 3000 },
            );

            const textBlockStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(textBlockStyleSelect);

            await waitFor(
                () => {
                    const body = within(document.body);
                    expect(body.getByText("List Large")).toBeInTheDocument();
                    expect(body.getByText("List Small")).toBeInTheDocument();
                    expect(body.getByText("Universal")).toBeInTheDocument();
                    expect(body.queryByText("Intro Text")).not.toBeInTheDocument();
                    expect(body.queryByText("Numbered Style")).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.keyboard("{Escape}");
        });

        await step("Switch to ordered list via keyboard shortcut", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            const mod = /Mac/i.test(navigator.platform) ? "Meta" : "Control";
            await userEvent.keyboard(`{${mod}>}{Shift>}7{/Shift}{/${mod}}`);

            await waitFor(
                () => {
                    expect(editor.querySelector("ol")).toBeTruthy();
                },
                { timeout: 3000 },
            );
        });

        await step("Ordered list mode: text block style dropdown includes OL-only style", async () => {
            const textBlockStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(textBlockStyleSelect);

            await waitFor(
                () => {
                    const body = within(document.body);
                    expect(body.getByText("List Large")).toBeInTheDocument();
                    expect(body.getByText("List Small")).toBeInTheDocument();
                    expect(body.getByText("Universal")).toBeInTheDocument();
                    expect(body.getByText("Numbered Style")).toBeInTheDocument();
                    expect(body.queryByText("Intro Text")).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.keyboard("{Escape}");
        });

        await step("Select 'List Large' style", async () => {
            const textBlockStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(textBlockStyleSelect);

            await waitFor(
                () => {
                    expect(within(document.body).getByText("List Large")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByText("List Large"));

            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("List Large");
                },
                { timeout: 3000 },
            );
        });

        await step("Verify 'list-large' text block style attribute is applied in the editor", async () => {
            await waitFor(
                () => {
                    const styledEl = document.querySelector('[data-text-block-style="list-large"]');
                    expect(styledEl).toBeTruthy();
                },
                { timeout: 3000 },
            );
        });
    },
};

const MaxTextBlocksBlock = createTipTapRichTextBlock({ maxTextBlocks: 2 });

function MaxTextBlocksStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(MaxTextBlocksBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <MaxTextBlocksBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const MaxTextBlocks: StoryObj<typeof MaxTextBlocksStory> = {
    render: () => <MaxTextBlocksStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Type text and press Enter to create text blocks", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("First block");
            await userEvent.keyboard("{Enter}");
            await userEvent.keyboard("Second block");

            await waitFor(
                () => {
                    expect(editor).toHaveTextContent("First block");
                    expect(editor).toHaveTextContent("Second block");
                },
                { timeout: 3000 },
            );
        });

        await step("Third Enter does not create a new text block (maxTextBlocks=2 enforced)", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.keyboard("{Enter}");
            await userEvent.keyboard("Third block");

            // The text "Third block" should be appended to second text block (no new text block created)
            await waitFor(
                () => {
                    // Should still only have 2 paragraphs in the output
                    const paragraphs = editor.querySelectorAll("p");
                    expect(paragraphs.length).toBeLessThanOrEqual(2);
                },
                { timeout: 3000 },
            );
        });
    },
};

const InlineStylesBlock = createTipTapRichTextBlock({
    inlineStyles: [
        {
            name: "highlight",
            label: "Highlight",
            element: (props: HTMLAttributes<HTMLElement>) => <span style={{ backgroundColor: "#fff3cd", padding: "0 2px" }} {...props} />,
        },
        {
            name: "tag",
            label: "Tag",
            element: (props: HTMLAttributes<HTMLElement>) => (
                <span style={{ backgroundColor: "#e0f0ff", color: "#0066cc", padding: "0 4px", borderRadius: 4 }} {...props} />
            ),
        },
    ],
});

function InlineStylesStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(InlineStylesBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <InlineStylesBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const InlineStyles: StoryObj<typeof InlineStylesStory> = {
    render: () => <InlineStylesStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            // Heading select + inline style select
            const comboboxes = canvas.getAllByRole("combobox");
            expect(comboboxes).toHaveLength(2);
        });

        await step("Type text and select it", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("hello");

            await waitFor(
                () => {
                    expect(editor).toHaveTextContent("hello");
                },
                { timeout: 3000 },
            );

            // userEvent's Shift+Home isn't supported in contenteditable; use the native Selection API.
            const range = document.createRange();
            range.selectNodeContents(editor);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);

            // Wait for the inline-style dropdown to enable (TipTap picks up selection via the selectionchange event).
            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[1]).not.toBeDisabled();
                },
                { timeout: 3000 },
            );
        });

        await step("Apply 'Highlight' inline style", async () => {
            const inlineStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(inlineStyleSelect);

            await waitFor(
                () => {
                    expect(within(document.body).getByRole("option", { name: "Highlight" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
            await userEvent.click(within(document.body).getByRole("option", { name: "Highlight" }));

            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Highlight");
                },
                { timeout: 3000 },
            );
        });

        await step("Verify highlight element (from `element` prop) is rendered with its styling", async () => {
            await waitFor(
                () => {
                    const styledEl = document.querySelector('[data-inline-style="highlight"]');
                    expect(styledEl).toBeTruthy();
                    expect(styledEl).toHaveTextContent("hello");
                    expect(styledEl).toHaveStyle({ backgroundColor: "rgb(255, 243, 205)" });
                },
                { timeout: 3000 },
            );
        });

        await step("Switch to 'Tag' inline style", async () => {
            const inlineStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(inlineStyleSelect);

            await waitFor(
                () => {
                    expect(within(document.body).getByRole("option", { name: "Tag" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
            await userEvent.click(within(document.body).getByRole("option", { name: "Tag" }));
        });

        await step("Verify tag element replaces the highlight element", async () => {
            await waitFor(
                () => {
                    expect(document.querySelector('[data-inline-style="highlight"]')).toBeNull();
                    const tagEl = document.querySelector('[data-inline-style="tag"]');
                    expect(tagEl).toBeTruthy();
                    expect(tagEl).toHaveTextContent("hello");
                    expect(tagEl).toHaveStyle({ backgroundColor: "rgb(224, 240, 255)", color: "rgb(0, 102, 204)" });
                },
                { timeout: 3000 },
            );
        });

        await step("Clear inline style resets to default rendering", async () => {
            const inlineStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(inlineStyleSelect);

            await waitFor(
                () => {
                    expect(within(document.body).getByRole("option", { name: "Default" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
            await userEvent.click(within(document.body).getByRole("option", { name: "Default" }));

            await waitFor(
                () => {
                    expect(document.querySelector("[data-inline-style]")).toBeNull();
                },
                { timeout: 3000 },
            );
        });
    },
};

const ListLevelMaxBlock = createTipTapRichTextBlock({ listLevelMax: 2 });

function ListLevelMaxStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(ListLevelMaxBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <ListLevelMaxBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const ListLevelMax: StoryObj<typeof ListLevelMaxStory> = {
    render: () => <ListLevelMaxStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Create a bullet list", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("Item 1");

            // Toggle bullet list using keyboard shortcut
            const mod = /Mac/i.test(navigator.platform) ? "Meta" : "Control";
            await userEvent.keyboard(`{${mod}>}{Shift>}8{/Shift}{/${mod}}`);

            await waitFor(
                () => {
                    expect(editor.querySelector("ul")).toBeTruthy();
                },
                { timeout: 3000 },
            );
        });

        await step("Create a second list item and indent it (allowed, depth 2)", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.keyboard("{Enter}");
            await userEvent.keyboard("Item 2");
            await userEvent.keyboard("{Tab}");

            await waitFor(
                () => {
                    // Should have nested ul (depth 2)
                    const nestedUl = editor.querySelector("ul ul");
                    expect(nestedUl).toBeTruthy();
                },
                { timeout: 3000 },
            );
        });

        await step("Try to indent further (should be blocked, depth would exceed 2)", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.keyboard("{Enter}");
            await userEvent.keyboard("Item 3");
            await userEvent.keyboard("{Tab}");

            await waitFor(
                () => {
                    // Should NOT have triple-nested ul (depth 3 not allowed)
                    const tripleNestedUl = editor.querySelector("ul ul ul");
                    expect(tripleNestedUl).toBeNull();
                },
                { timeout: 3000 },
            );
        });
    },
};

const HeadingLevelsBlock = createTipTapRichTextBlock({ headingLevels: [2, 3, 4] });

function HeadingLevelsStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(HeadingLevelsBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <HeadingLevelsBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const HeadingLevels: StoryObj<typeof HeadingLevelsStory> = {
    render: () => <HeadingLevelsStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Heading dropdown only offers Heading 2-4, not 1, 5 or 6", async () => {
            const textBlockTypeSelect = canvas.getByRole("combobox");
            await userEvent.click(textBlockTypeSelect);

            await waitFor(
                () => {
                    const body = within(document.body);
                    expect(body.getByText("Heading 2")).toBeInTheDocument();
                    expect(body.getByText("Heading 3")).toBeInTheDocument();
                    expect(body.getByText("Heading 4")).toBeInTheDocument();
                    expect(body.queryByText("Heading 1")).not.toBeInTheDocument();
                    expect(body.queryByText("Heading 5")).not.toBeInTheDocument();
                    expect(body.queryByText("Heading 6")).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByText("Heading 2"));
        });

        await step("Selected heading level is applied", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("heading", { level: 2 })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Keyboard shortcut for a disallowed level (Mod-Alt-1) does not apply Heading 1", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            const mod = /Mac/i.test(navigator.platform) ? "Meta" : "Control";
            await userEvent.keyboard(`{${mod}>}{Alt>}1{/Alt}{/${mod}}`);

            await waitFor(
                () => {
                    expect(canvas.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });
    },
};

export const InvalidHeadingLevels: Story = {
    render: () => <div />,
    play: async ({ step }) => {
        await step("Invalid headingLevels throw instead of silently creating a broken heading", async () => {
            expect(() => createTipTapRichTextBlock({ headingLevels: [] })).toThrow();
            expect(() => createTipTapRichTextBlock({ headingLevels: [0, 2, 3] })).toThrow();
            expect(() => createTipTapRichTextBlock({ headingLevels: [1, 7] })).toThrow();
            expect(() => createTipTapRichTextBlock({ headingLevels: [1, 1, 2] })).toThrow();
            expect(() => createTipTapRichTextBlock({ headingLevels: [1.5, 2] })).toThrow();
        });
    },
};

const CombinedStylesBlock = createTipTapRichTextBlock({
    textBlockStyles: [
        {
            name: "intro",
            label: "Intro Text",
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
        },
    ],
    inlineStyles: [
        {
            name: "highlight",
            label: "Highlight",
            element: (props: HTMLAttributes<HTMLElement>) => <span style={{ backgroundColor: "#fff3cd", padding: "0 2px" }} {...props} />,
        },
        {
            name: "tag",
            label: "Tag",
            element: (props: HTMLAttributes<HTMLElement>) => (
                <span style={{ backgroundColor: "#e0f0ff", color: "#0066cc", padding: "0 4px", borderRadius: 4 }} {...props} />
            ),
        },
    ],
});

function CombinedStylesStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(CombinedStylesBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <CombinedStylesBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const CombinedTextBlockAndInlineStyles: StoryObj<typeof CombinedStylesStory> = {
    render: () => <CombinedStylesStory />,
    play: async ({ canvas, step }) => {
        await step("Editor is ready with both text block style and inline style dropdowns", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            // Heading select + text block style select + inline style select
            const comboboxes = canvas.getAllByRole("combobox");
            expect(comboboxes.length).toBeGreaterThanOrEqual(3);
        });
    },
};
