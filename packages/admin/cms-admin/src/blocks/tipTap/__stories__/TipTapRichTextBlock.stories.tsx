import { Box, chipClasses, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type HTMLAttributes, type ReactNode, useState } from "react";
import { expect, waitFor, within } from "storybook/test";

import { createTipTapRichTextBlock, type TipTapRichTextBlockState } from "../createTipTapRichTextBlock";

function StatePreview({ state }: { state: TipTapRichTextBlockState }) {
    return (
        <Box
            component="pre"
            data-testid="state-preview"
            sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", fontSize: 12, overflow: "auto", borderRadius: 1 }}
        >
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
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            // Block type select shows "Paragraph"
            await expect(canvas.getByRole("combobox")).toBeInTheDocument();
            await expect(canvas.getByText("Paragraph")).toBeInTheDocument();

            // Toolbar has buttons (undo, redo, bold, italic, strike, more, ol, ul, indent, dedent, nbsp, shy)
            const buttons = canvas.getAllByRole("button");
            await expect(buttons.length).toBeGreaterThanOrEqual(10);
        });

        await step("Undo/redo are disabled initially", async () => {
            const buttons = canvas.getAllByRole("button");
            // First two buttons are undo and redo
            await expect(buttons[0]).toBeDisabled();
            await expect(buttons[1]).toBeDisabled();
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
                async () => {
                    await expect(canvas.getByRole("heading", { level: 1, name: "Read-only content" })).toBeInTheDocument();
                    await expect(canvas.getByText("read-only")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step(
            "The block's own text block style is applied — this needs the block's textBlockStyles reaching the read-only renderer",
            async () => {
                await waitFor(
                    async () => {
                        const styledElement = canvasElement.querySelector('[data-text-block-style="intro"]');
                        await expect(styledElement).not.toBeNull();
                        await expect(styledElement).toHaveStyle({ fontStyle: "italic" });
                    },
                    { timeout: 3000 },
                );
            },
        );

        await step("No element is editable", async () => {
            for (const element of Array.from(canvasElement.querySelectorAll("[contenteditable]"))) {
                await expect(element).toHaveAttribute("contenteditable", "false");
            }
        });

        await step("No editing toolbar is rendered", async () => {
            // The editor keeps its textbox role when read-only, so the toolbar's absence is the tell.
            await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
            await expect(canvas.queryAllByRole("button")).toHaveLength(0);
        });
    },
};

const BoldOnlyBlock = createTipTapRichTextBlock({
    undoRedoButtons: false,
    italic: false,
    strike: false,
    sub: false,
    sup: false,
    heading: false,
    orderedList: false,
    unorderedList: false,
    nonBreakingSpace: false,
    softHyphen: false,
});

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
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            // Only bold button, no heading select
            await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
            await expect(canvas.queryByText("Default")).not.toBeInTheDocument();

            // Exactly 1 button (bold only — no undo/redo, no lists, no special chars)
            const buttons = canvas.getAllByRole("button");
            await expect(buttons).toHaveLength(1);
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
                async () => {
                    const comboboxes = canvas.getAllByRole("combobox");
                    await expect(comboboxes).toHaveLength(2);
                },
                { timeout: 5000 },
            );

            const comboboxes = canvas.getAllByRole("combobox");
            await expect(comboboxes[0]).toHaveTextContent("Paragraph");
            await expect(comboboxes[1]).toHaveTextContent("Default");
        });

        await step("Select text block style 'Intro Text'", async () => {
            // Click the second combobox (text block style select)
            const comboboxes = canvas.getAllByRole("combobox");
            await userEvent.click(comboboxes[1]);

            await waitFor(
                async () => {
                    await expect(within(document.body).getByRole("option", { name: "Intro Text" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByRole("option", { name: "Intro Text" }));

            await waitFor(
                async () => {
                    await expect(canvas.getByText("Intro Text")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Typing into a styled block preserves character order (cursor does not jump to start)", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("hello");

            await waitFor(
                async () => {
                    await expect(editor).toHaveTextContent("hello");
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
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            // The placeholder button is identified by its accessible name, not by index among all toolbar buttons
            await expect(canvas.getByRole("button", { name: "Insert placeholder" })).toBeInTheDocument();
        });

        await step("Open the placeholder menu and insert 'First Name'", async () => {
            await userEvent.click(canvas.getByRole("button", { name: "Insert placeholder" }));

            // The menu is rendered in a portal, so it lives in document.body rather than within the canvas
            await waitFor(
                async () => {
                    await expect(within(document.body).getByRole("menuitem", { name: "First Name" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByRole("menuitem", { name: "First Name" }));
        });

        await step("Inserted placeholder is rendered as a chip in the editor", async () => {
            const editor = canvas.getByRole("textbox");
            // Placeholders render as chips labelled `{{name}}`
            await waitFor(
                async () => {
                    await expect(within(editor).getByText("{{firstName}}")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Block state contains the placeholder node", async () => {
            await waitFor(
                async () => {
                    const state = JSON.parse(canvas.getByText(/"tipTapContent"/).textContent ?? "{}");
                    const [paragraph] = state.tipTapContent.content;
                    await expect(paragraph.content).toContainEqual({ type: "placeholder", attrs: { name: "firstName" } });
                },
                { timeout: 3000 },
            );
        });
    },
};

const PlaceholdersWithContentBlock = createTipTapRichTextBlock({
    undoRedoButtons: false,
    strike: false,
    sub: false,
    sup: false,
    heading: false,
    orderedList: false,
    unorderedList: false,
    nonBreakingSpace: false,
    softHyphen: false,
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
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Pre-filled placeholders are rendered as chips", async () => {
            const editor = canvas.getByRole("textbox");

            await waitFor(
                async () => {
                    // Each placeholder is rendered as a chip labelled `{{name}}` (not as plain text)
                    for (const name of ["firstName", "lastName", "email"]) {
                        const chipLabel = within(editor).getByText(`{{${name}}}`);
                        await expect(chipLabel.closest(`.${chipClasses.root}`)).toBeInTheDocument();
                    }
                },
                { timeout: 3000 },
            );

            // Text surrounding the chips is preserved
            await expect(editor).toHaveTextContent("Hello {{firstName}} {{lastName}}, welcome to our platform!");
            await expect(editor).toHaveTextContent("Your registered email is: {{email}}");
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
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Select Heading 1", async () => {
            const textBlockTypeSelect = canvas.getAllByRole("combobox")[0];
            await userEvent.click(textBlockTypeSelect);

            await waitFor(
                async () => {
                    await expect(within(document.body).getByText("Heading 1")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
            await userEvent.click(within(document.body).getByText("Heading 1"));

            await waitFor(
                async () => {
                    await expect(canvas.getAllByRole("combobox")[0]).toHaveTextContent("Heading 1");
                },
                { timeout: 3000 },
            );
        });

        await step("Verify available styles for Heading 1: Chapter Heading, Large Heading, Highlight — but not Intro Text", async () => {
            const textBlockStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(textBlockStyleSelect);

            await waitFor(
                async () => {
                    const body = within(document.body);
                    await expect(body.getByText("Chapter Heading")).toBeInTheDocument();
                    await expect(body.getByText("Large Heading")).toBeInTheDocument();
                    await expect(body.getByText("Highlight")).toBeInTheDocument();
                    await expect(body.queryByText("Intro Text")).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Select 'Chapter Heading' style (heading-1 only)", async () => {
            await userEvent.click(within(document.body).getByText("Chapter Heading"));

            await waitFor(
                async () => {
                    await expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Chapter Heading");
                },
                { timeout: 3000 },
            );
        });

        await step("Verify chapter heading styling is applied (uppercase)", async () => {
            await waitFor(
                async () => {
                    const styledEl = document.querySelector('[data-text-block-style="chapter-heading"]');
                    await expect(styledEl).toBeTruthy();
                    await expect(styledEl).toHaveStyle({ textTransform: "uppercase" });
                },
                { timeout: 3000 },
            );
        });

        await step("Switch to Heading 2", async () => {
            const textBlockTypeSelect = canvas.getAllByRole("combobox")[0];
            await userEvent.click(textBlockTypeSelect);

            await waitFor(
                async () => {
                    await expect(within(document.body).getByText("Heading 2")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
            await userEvent.click(within(document.body).getByText("Heading 2"));

            await waitFor(
                async () => {
                    await expect(canvas.getAllByRole("combobox")[0]).toHaveTextContent("Heading 2");
                },
                { timeout: 3000 },
            );
        });

        await step("Block style auto-resets to Default (Chapter Heading doesn't apply to heading-2)", async () => {
            await waitFor(
                async () => {
                    await expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Default");
                },
                { timeout: 3000 },
            );
        });

        await step("Verify chapter heading styling is removed", async () => {
            await waitFor(
                async () => {
                    await expect(document.querySelector("[data-text-block-style]")).toBeNull();
                },
                { timeout: 3000 },
            );
        });
    },
};

const ListTextBlockStylesBlock = createTipTapRichTextBlock({
    undoRedoButtons: false,
    italic: false,
    strike: false,
    sub: false,
    sup: false,
    nonBreakingSpace: false,
    softHyphen: false,
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
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
                    await expect(canvas.getAllByRole("combobox")).toHaveLength(2);
                },
                { timeout: 5000 },
            );
        });

        await step("Paragraph mode: text block style dropdown shows paragraph-applicable styles only", async () => {
            const textBlockStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(textBlockStyleSelect);

            await waitFor(
                async () => {
                    const body = within(document.body);
                    await expect(body.getByText("Intro Text")).toBeInTheDocument();
                    await expect(body.getByText("Universal")).toBeInTheDocument();
                    await expect(body.queryByText("List Large")).not.toBeInTheDocument();
                    await expect(body.queryByText("List Small")).not.toBeInTheDocument();
                    await expect(body.queryByText("Numbered Style")).not.toBeInTheDocument();
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
                async () => {
                    await expect(editor.querySelector("ul")).toBeTruthy();
                },
                { timeout: 3000 },
            );
        });

        await step("Unordered list mode: text block style dropdown shows UL-applicable styles", async () => {
            await waitFor(
                async () => {
                    await expect(canvas.getAllByRole("combobox").length).toBeGreaterThanOrEqual(2);
                },
                { timeout: 3000 },
            );

            const textBlockStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(textBlockStyleSelect);

            await waitFor(
                async () => {
                    const body = within(document.body);
                    await expect(body.getByText("List Large")).toBeInTheDocument();
                    await expect(body.getByText("List Small")).toBeInTheDocument();
                    await expect(body.getByText("Universal")).toBeInTheDocument();
                    await expect(body.queryByText("Intro Text")).not.toBeInTheDocument();
                    await expect(body.queryByText("Numbered Style")).not.toBeInTheDocument();
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
                async () => {
                    await expect(editor.querySelector("ol")).toBeTruthy();
                },
                { timeout: 3000 },
            );
        });

        await step("Ordered list mode: text block style dropdown includes OL-only style", async () => {
            const textBlockStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(textBlockStyleSelect);

            await waitFor(
                async () => {
                    const body = within(document.body);
                    await expect(body.getByText("List Large")).toBeInTheDocument();
                    await expect(body.getByText("List Small")).toBeInTheDocument();
                    await expect(body.getByText("Universal")).toBeInTheDocument();
                    await expect(body.getByText("Numbered Style")).toBeInTheDocument();
                    await expect(body.queryByText("Intro Text")).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.keyboard("{Escape}");
        });

        await step("Select 'List Large' style", async () => {
            const textBlockStyleSelect = canvas.getAllByRole("combobox")[1];
            await userEvent.click(textBlockStyleSelect);

            await waitFor(
                async () => {
                    await expect(within(document.body).getByText("List Large")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByText("List Large"));

            await waitFor(
                async () => {
                    await expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("List Large");
                },
                { timeout: 3000 },
            );
        });

        await step("Verify 'list-large' text block style attribute is applied in the editor", async () => {
            await waitFor(
                async () => {
                    const styledEl = document.querySelector('[data-text-block-style="list-large"]');
                    await expect(styledEl).toBeTruthy();
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
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
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
                async () => {
                    await expect(editor).toHaveTextContent("First block");
                    await expect(editor).toHaveTextContent("Second block");
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
                async () => {
                    // Should still only have 2 paragraphs in the output
                    const paragraphs = editor.querySelectorAll("p");
                    await expect(paragraphs.length).toBeLessThanOrEqual(2);
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
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
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
                async () => {
                    await expect(editor.querySelector("ul")).toBeTruthy();
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
                async () => {
                    // Should have nested ul (depth 2)
                    const nestedUl = editor.querySelector("ul ul");
                    await expect(nestedUl).toBeTruthy();
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
                async () => {
                    // Should NOT have triple-nested ul (depth 3 not allowed)
                    const tripleNestedUl = editor.querySelector("ul ul ul");
                    await expect(tripleNestedUl).toBeNull();
                },
                { timeout: 3000 },
            );
        });
    },
};

const HeadingLevelsBlock = createTipTapRichTextBlock({ heading: { levels: [2, 3, 4] } });

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
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Heading dropdown only offers Heading 2-4, not 1, 5 or 6", async () => {
            const textBlockTypeSelect = canvas.getByRole("combobox");
            await userEvent.click(textBlockTypeSelect);

            await waitFor(
                async () => {
                    const body = within(document.body);
                    await expect(body.getByText("Heading 2")).toBeInTheDocument();
                    await expect(body.getByText("Heading 3")).toBeInTheDocument();
                    await expect(body.getByText("Heading 4")).toBeInTheDocument();
                    await expect(body.queryByText("Heading 1")).not.toBeInTheDocument();
                    await expect(body.queryByText("Heading 5")).not.toBeInTheDocument();
                    await expect(body.queryByText("Heading 6")).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByText("Heading 2"));
        });

        await step("Selected heading level is applied", async () => {
            await waitFor(
                async () => {
                    await expect(canvas.getByRole("heading", { level: 2 })).toBeInTheDocument();
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
                async () => {
                    await expect(canvas.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });
    },
};

// Simulates the surrounding admin UI, which scrolls the block's container rather than the block itself.
const ScrollableContainer = styled("div")({
    height: 250,
    overflowY: "auto",
});

const longTextContent: TipTapRichTextBlockState = {
    tipTapContent: {
        type: "doc",
        content: Array.from({ length: 30 }, (_, index) => ({
            type: "paragraph",
            content: [{ type: "text", text: `Paragraph ${index + 1}: enough text to make the container scroll past the toolbar.` }],
        })),
    },
};

function StickyToolbarStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(longTextContent);

    return (
        <ScrollableContainer data-testid="scroll-container">
            <TipTapRichTextBlock.AdminComponent state={state} updateState={setState} />
        </ScrollableContainer>
    );
}

function findStickyAncestor(element: HTMLElement): HTMLElement {
    for (let current: HTMLElement | null = element; current; current = current.parentElement) {
        if (getComputedStyle(current).position === "sticky") {
            return current;
        }
    }
    throw new Error("No sticky ancestor found");
}

export const StickyToolbar: StoryObj<typeof StickyToolbarStory> = {
    render: () => <StickyToolbarStory />,
    play: async ({ canvas, canvasElement, step }) => {
        const getScrollContainer = () => canvasElement.querySelector('[data-testid="scroll-container"]') as HTMLElement | null;

        await step("Editor is ready and the container has more content than fits", async () => {
            await waitFor(
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            await waitFor(
                async () => {
                    const scrollContainer = getScrollContainer();
                    await expect(scrollContainer).not.toBeNull();
                    await expect(scrollContainer!.scrollHeight).toBeGreaterThan(scrollContainer!.clientHeight);
                },
                { timeout: 5000 },
            );
        });

        const scrollContainer = getScrollContainer()!;
        const undoButton = canvas.getAllByRole("button")[0];
        const toolbar = findStickyAncestor(undoButton);
        const firstParagraph = canvas.getByText("Paragraph 1: enough text to make the container scroll past the toolbar.");

        const toolbarTopBeforeScroll = toolbar.getBoundingClientRect().top;
        const paragraphTopBeforeScroll = firstParagraph.getBoundingClientRect().top;

        await step("Scroll the container down", async () => {
            scrollContainer.scrollTop = 300;

            await waitFor(
                async () => {
                    await expect(scrollContainer.scrollTop).toBeGreaterThan(0);
                },
                { timeout: 5000 },
            );
        });

        await step("Toolbar stays pinned to the top while the content scrolls behind it", async () => {
            await waitFor(
                async () => {
                    await expect(toolbar.getBoundingClientRect().top).toBe(toolbarTopBeforeScroll);
                    await expect(firstParagraph.getBoundingClientRect().top).toBeLessThan(paragraphTopBeforeScroll);
                },
                { timeout: 5000 },
            );
        });
    },
};

const HeadingOnlyBlock = createTipTapRichTextBlock({
    paragraph: false,
    heading: { levels: [2, 3, 4], defaultLevel: 3 },
    nonBreakingSpace: false,
    softHyphen: false,
});

function HeadingOnlyStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(HeadingOnlyBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <HeadingOnlyBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const HeadingOnly: StoryObj<typeof HeadingOnlyStory> = {
    render: () => <HeadingOnlyStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor starts with a heading of the default level", async () => {
            await waitFor(
                async () => {
                    await expect(canvas.getByRole("heading", { level: 3 })).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Text block type dropdown only offers headings, no paragraph", async () => {
            await userEvent.click(canvas.getByRole("combobox"));

            await waitFor(
                async () => {
                    const body = within(document.body);
                    await expect(body.getAllByRole("option").map((option) => option.textContent)).toEqual(["Heading 2", "Heading 3", "Heading 4"]);
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 2" }));
        });

        await step("Selected heading level is applied", async () => {
            await waitFor(
                async () => {
                    await expect(canvas.getByRole("heading", { level: 2 })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Keyboard shortcut switches the heading level instead of toggling to a paragraph", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            const mod = /Mac/i.test(navigator.platform) ? "Meta" : "Control";
            await userEvent.keyboard(`{${mod}>}{Alt>}4{/Alt}{/${mod}}`);

            await waitFor(
                async () => {
                    await expect(canvas.getByRole("heading", { level: 4 })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Typing into the heading works", async () => {
            await userEvent.keyboard("Headline");

            await waitFor(
                async () => {
                    await expect(canvas.getByRole("heading", { level: 4 })).toHaveTextContent("Headline");
                },
                { timeout: 3000 },
            );
        });
    },
};

const HeadingOnlyWithTextBlockStylesBlock = createTipTapRichTextBlock({
    paragraph: false,
    heading: { levels: [2, 3, 4], defaultLevel: 3 },
    textBlockStyles: [
        {
            name: "headline550",
            label: "Size 550",
            appliesTo: ["heading-2", "heading-3", "heading-4"],
            element: (props: HTMLAttributes<HTMLElement>) => <h2 style={{ fontSize: 40, lineHeight: 1.2 }} {...props} />,
        },
    ],
});

function HeadingOnlyWithTextBlockStylesStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(HeadingOnlyWithTextBlockStylesBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <HeadingOnlyWithTextBlockStylesBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const HeadingOnlyWithTextBlockStyles: StoryObj<typeof HeadingOnlyWithTextBlockStylesStory> = {
    render: () => <HeadingOnlyWithTextBlockStylesStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor starts with a heading of the default level", async () => {
            await waitFor(
                async () => {
                    await expect(canvas.getByRole("heading", { level: 3 })).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Applying a text block style keeps the heading", async () => {
            const comboboxes = canvas.getAllByRole("combobox");
            await expect(comboboxes[0]).toHaveTextContent("Heading 3");
            await userEvent.click(comboboxes[1]);

            await waitFor(
                async () => {
                    await expect(within(document.body).getByRole("option", { name: "Size 550" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByRole("option", { name: "Size 550" }));

            await waitFor(
                async () => {
                    await expect(canvas.getByText("Size 550")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Typing into the styled heading works", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("Headline");

            await waitFor(
                async () => {
                    await expect(editor).toHaveTextContent("Headline");
                },
                { timeout: 3000 },
            );
        });
    },
};

const contentFromOutside: TipTapRichTextBlockState = {
    tipTapContent: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Text written by the agent" }] }],
    },
};

function ExternalContentUpdateStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(TipTapRichTextBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <button type="button" onClick={() => setState(contentFromOutside)}>
                Update from outside
            </button>
            <TipTapRichTextBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const ExternalContentUpdate: StoryObj<typeof ExternalContentUpdateStory> = {
    render: () => <ExternalContentUpdateStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Typing keeps the caret in place", async () => {
            await waitFor(
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("Text written by the user");

            await waitFor(
                async () => {
                    await expect(editor).toHaveTextContent("Text written by the user");
                },
                { timeout: 3000 },
            );
        });

        await step("Content set from outside replaces what the editor shows", async () => {
            await userEvent.click(canvas.getByRole("button", { name: "Update from outside" }));

            await waitFor(
                async () => {
                    const editor = canvas.getByRole("textbox");
                    await expect(editor).toHaveTextContent("Text written by the agent");
                    await expect(editor).not.toHaveTextContent("Text written by the user");
                },
                { timeout: 3000 },
            );
        });

        await step("The editor stays editable after the update from outside", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard(", extended by the user");

            await waitFor(
                async () => {
                    await expect(editor).toHaveTextContent("Text written by the agent, extended by the user");
                },
                { timeout: 3000 },
            );
        });
    },
};

// Mirrors a parent that applies the editor's updates late, which makes React render a keystroke's
// state after later keystrokes already reached the editor.
function LaggingStateStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(TipTapRichTextBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <TipTapRichTextBlock.AdminComponent
                state={state}
                updateState={(setStateAction) => {
                    setTimeout(() => setState(setStateAction), 50);
                }}
            />
        </StoryWrapper>
    );
}

export const LaggingState: StoryObj<typeof LaggingStateStory> = {
    render: () => <LaggingStateStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("State arriving late does not undo what was typed since", async () => {
            await waitFor(
                async () => {
                    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("Text written by the user");

            // The editor shows the text as it is typed, so only the state catching up tells us that
            // the delayed updates have landed — and that none of them reset the editor on arrival.
            await waitFor(
                async () => {
                    await expect(canvas.getByTestId("state-preview")).toHaveTextContent("Text written by the user");
                },
                { timeout: 3000 },
            );
            await expect(editor).toHaveTextContent("Text written by the user");
        });
    },
};
