import { Box, chipClasses } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { expect, waitFor, within } from "storybook/test";

import {
    createTipTapRichTextBlock,
    type TipTapRichTextBlockState,
    type TipTapTextBlock,
    type TipTapTextBlockStyle,
} from "../createTipTapRichTextBlock";

const defaultHeadingTextBlocks: TipTapTextBlock[] = [1, 2, 3, 4, 5, 6].map((level) => ({
    name: `heading-${level}`,
    label: `Heading ${level}`,
    tag: `h${level}` as "h1",
}));

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

const introStyle: TipTapTextBlockStyle = {
    name: "intro",
    label: "Intro Text",
    element: (props) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
};

const ReadOnlyBlock = createTipTapRichTextBlock({
    textBlocks: [{ name: "paragraph", label: "Paragraph", tag: "p", styles: [introStyle] }, ...defaultHeadingTextBlocks],
});

const readOnlyState: TipTapRichTextBlockState = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "textBlock",
                attrs: { textBlock: "heading-1" },
                content: [{ type: "text", text: "Read-only content" }],
            },
            {
                type: "textBlock",
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

const BoldOnlyBlock = createTipTapRichTextBlock({
    undoRedoButtons: false,
    italic: false,
    strike: false,
    sub: false,
    sup: false,
    textBlocks: [{ name: "paragraph", label: "Paragraph", tag: "p" }],
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
    textBlocks: [{ name: "paragraph", label: "Paragraph", tag: "p" }],
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
                    type: "textBlock",
                    content: [
                        { type: "text", text: "Hello " },
                        { type: "placeholder", attrs: { name: "firstName" } },
                        { type: "text", text: " " },
                        { type: "placeholder", attrs: { name: "lastName" } },
                        { type: "text", text: ", welcome to our platform!" },
                    ],
                },
                {
                    type: "textBlock",
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
            type: "textBlock",
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
