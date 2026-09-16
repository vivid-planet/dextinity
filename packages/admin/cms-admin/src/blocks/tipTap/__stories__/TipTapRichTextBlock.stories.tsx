import { Box, chipClasses, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
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
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
        },
    ],
    textBlocks: [
        { name: "paragraph", tag: "paragraph", label: "Paragraph", styles: ["intro"] },
        { name: "heading-1", tag: "heading-1", label: "Heading 1" },
        { name: "heading-2", tag: "heading-2", label: "Heading 2" },
        { name: "heading-3", tag: "heading-3", label: "Heading 3" },
        { name: "heading-4", tag: "heading-4", label: "Heading 4" },
        { name: "heading-5", tag: "heading-5", label: "Heading 5" },
        { name: "heading-6", tag: "heading-6", label: "Heading 6" },
    ],
});

const readOnlyState: TipTapRichTextBlockState = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1, textBlockName: "heading-1" },
                content: [{ type: "text", text: "Read-only content" }],
            },
            {
                type: "paragraph",
                attrs: { textBlockName: "paragraph", textBlockStyle: "intro" },
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

const BoldOnlyBlock = createTipTapRichTextBlock({
    undoRedoButtons: false,
    italic: false,
    strike: false,
    sub: false,
    sup: false,
    textBlocks: [{ name: "paragraph", tag: "paragraph", label: "Paragraph" }],
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
            element: (p) => <Typography sx={{ fontSize: 48, lineHeight: 1.2 }} variant="h1" {...p} />,
        },
        {
            name: "intro",
            label: "Intro Text",
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
        },
        {
            name: "highlight",
            label: "Highlight",
            element: (props: HTMLAttributes<HTMLElement>) => <div style={{ backgroundColor: "#fff3cd", padding: 8 }} {...props} />,
        },
    ],
    textBlocks: [
        { name: "paragraph", tag: "paragraph", label: "Paragraph", styles: ["intro", "highlight"] },
        { name: "heading-1", tag: "heading-1", label: "Heading 1", styles: ["large-heading", "highlight"] },
        { name: "heading-2", tag: "heading-2", label: "Heading 2", styles: ["large-heading", "highlight"] },
        { name: "heading-3", tag: "heading-3", label: "Heading 3", styles: ["highlight"] },
        { name: "heading-4", tag: "heading-4", label: "Heading 4", styles: ["highlight"] },
        { name: "heading-5", tag: "heading-5", label: "Heading 5", styles: ["highlight"] },
        { name: "heading-6", tag: "heading-6", label: "Heading 6", styles: ["highlight"] },
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

const RequiredTextBlockStyleBlock = createTipTapRichTextBlock({
    textBlockStyles: [
        {
            name: "copy100",
            label: "Copy 100",
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 16 }} {...props} />,
        },
        {
            name: "copy200",
            label: "Copy 200",
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 14 }} {...props} />,
        },
        {
            name: "headline300",
            label: "Headline 300",
            element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="h2" {...props} />,
        },
        {
            name: "headline400",
            label: "Headline 400",
            element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="h3" {...props} />,
        },
    ],
    textBlocks: [
        // A configured `defaultStyle` makes the style mandatory: no "Default" entry in the style
        // dropdown, and content missing a style is rejected by the API.
        { name: "paragraph", tag: "paragraph", label: "Paragraph", styles: ["copy100", "copy200"], defaultStyle: "copy100" },
        { name: "heading-1", tag: "heading-1", label: "Heading 1", styles: ["headline300"], defaultStyle: "headline300" },
        // No `defaultStyle` here, and a style set disjoint from heading-1's — heading-2 keeps the
        // regular "Default" option, and switching to it clears an incompatible style from heading-1.
        { name: "heading-2", tag: "heading-2", label: "Heading 2", styles: ["headline400"] },
    ],
});

function RequiredTextBlockStyleStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(RequiredTextBlockStyleBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <RequiredTextBlockStyleBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const RequiredTextBlockStyle: StoryObj<typeof RequiredTextBlockStyleStory> = {
    render: () => <RequiredTextBlockStyleStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Initial paragraph already has its default style applied, no 'Default' option", async () => {
            await waitFor(
                () => {
                    const comboboxes = canvas.getAllByRole("combobox");
                    expect(comboboxes).toHaveLength(2);
                },
                { timeout: 5000 },
            );

            const comboboxes = canvas.getAllByRole("combobox");
            expect(comboboxes[0]).toHaveTextContent("Paragraph");
            expect(comboboxes[1]).toHaveTextContent("Copy 100");

            await userEvent.click(comboboxes[1]);
            await waitFor(() => {
                expect(within(document.body).getByRole("option", { name: "Copy 200" })).toBeInTheDocument();
            });
            expect(within(document.body).queryByRole("option", { name: "Default" })).not.toBeInTheDocument();
            await userEvent.keyboard("{Escape}");
        });

        await step("Switching to Heading 1 auto-assigns its own default style, still no 'Default' option", async () => {
            const typeCombobox = canvas.getAllByRole("combobox")[0];
            await userEvent.click(typeCombobox);
            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 1" }));

            await waitFor(() => {
                expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Headline 300");
            });

            await userEvent.click(canvas.getAllByRole("combobox")[1]);
            await waitFor(() => {
                expect(within(document.body).getByRole("listbox")).toBeInTheDocument();
            });
            expect(within(document.body).queryByRole("option", { name: "Default" })).not.toBeInTheDocument();
            await userEvent.keyboard("{Escape}");
        });

        await step("Switching to Heading 2 (no defaultStyle) brings the 'Default' option back", async () => {
            const typeCombobox = canvas.getAllByRole("combobox")[0];
            await userEvent.click(typeCombobox);
            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 2" }));

            await waitFor(() => {
                expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Default");
            });

            await userEvent.click(canvas.getAllByRole("combobox")[1]);
            await waitFor(() => {
                expect(within(document.body).getByRole("option", { name: "Default" })).toBeInTheDocument();
            });
            await userEvent.keyboard("{Escape}");
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
    undoRedoButtons: false,
    strike: false,
    sub: false,
    sup: false,
    textBlocks: [{ name: "paragraph", tag: "paragraph", label: "Paragraph" }],
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
                    attrs: { textBlockName: "paragraph" },
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
                    attrs: { textBlockName: "paragraph" },
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
            element: (props: HTMLAttributes<HTMLElement>) => <h1 style={{ textTransform: "uppercase", letterSpacing: "0.1em" }} {...props} />,
        },
        {
            name: "large-heading",
            label: "Large Heading",
            element: (p) => <Typography sx={{ fontSize: 48, lineHeight: 1.2 }} variant="h1" {...p} />,
        },
        {
            name: "intro",
            label: "Intro Text",
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
        },
        {
            name: "highlight",
            label: "Highlight",
            element: (props: HTMLAttributes<HTMLElement>) => <div style={{ backgroundColor: "#fff3cd", padding: 8 }} {...props} />,
        },
    ],
    textBlocks: [
        { name: "paragraph", tag: "paragraph", label: "Paragraph", styles: ["intro", "highlight"] },
        { name: "heading-1", tag: "heading-1", label: "Heading 1", styles: ["chapter-heading", "large-heading", "highlight"] },
        { name: "heading-2", tag: "heading-2", label: "Heading 2", styles: ["large-heading", "highlight"] },
        { name: "heading-3", tag: "heading-3", label: "Heading 3", styles: ["highlight"] },
        { name: "heading-4", tag: "heading-4", label: "Heading 4", styles: ["highlight"] },
        { name: "heading-5", tag: "heading-5", label: "Heading 5", styles: ["highlight"] },
        { name: "heading-6", tag: "heading-6", label: "Heading 6", styles: ["highlight"] },
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
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
        },
        {
            name: "list-large",
            label: "List Large",
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 18, lineHeight: "26px" }} {...props} />,
        },
        {
            name: "list-small",
            label: "List Small",
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 14, lineHeight: "20px" }} {...props} />,
        },
        {
            name: "numbered",
            label: "Numbered Style",
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 16, fontWeight: 600 }} {...props} />,
        },
        {
            name: "universal",
            label: "Universal",
            element: (props: HTMLAttributes<HTMLElement>) => <div style={{ backgroundColor: "#e8f5e9", padding: 4 }} {...props} />,
        },
    ],
    textBlocks: [
        { name: "paragraph", tag: "paragraph", label: "Paragraph", styles: ["intro", "universal"] },
        { name: "heading-1", tag: "heading-1", label: "Heading 1", styles: ["universal"] },
        { name: "heading-2", tag: "heading-2", label: "Heading 2", styles: ["universal"] },
        { name: "heading-3", tag: "heading-3", label: "Heading 3", styles: ["universal"] },
        { name: "heading-4", tag: "heading-4", label: "Heading 4", styles: ["universal"] },
        { name: "heading-5", tag: "heading-5", label: "Heading 5", styles: ["universal"] },
        { name: "heading-6", tag: "heading-6", label: "Heading 6", styles: ["universal"] },
    ],
    // `listStyles` is shared by both ordered and unordered lists — the old per-list-type `appliesTo`
    // distinction ("ol-only") no longer exists, since a list item's style choice isn't part of `textBlocks`.
    listStyles: ["list-large", "list-small", "numbered", "universal"],
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

        await step("Unordered list mode: text block style dropdown shows the list's styles (shared by both list types)", async () => {
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
                    expect(body.getByText("Numbered Style")).toBeInTheDocument();
                    expect(body.getByText("Universal")).toBeInTheDocument();
                    expect(body.queryByText("Intro Text")).not.toBeInTheDocument();
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

        await step("Ordered list mode: text block style dropdown shows the same shared list styles", async () => {
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
            attrs: { textBlockName: "paragraph" },
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
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            await waitFor(
                () => {
                    const scrollContainer = getScrollContainer();
                    expect(scrollContainer).not.toBeNull();
                    expect(scrollContainer!.scrollHeight).toBeGreaterThan(scrollContainer!.clientHeight);
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
                () => {
                    expect(scrollContainer.scrollTop).toBeGreaterThan(0);
                },
                { timeout: 5000 },
            );
        });

        await step("Toolbar stays pinned to the top while the content scrolls behind it", async () => {
            await waitFor(
                () => {
                    expect(toolbar.getBoundingClientRect().top).toBe(toolbarTopBeforeScroll);
                    expect(firstParagraph.getBoundingClientRect().top).toBeLessThan(paragraphTopBeforeScroll);
                },
                { timeout: 5000 },
            );
        });
    },
};
