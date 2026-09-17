import { Box, Typography } from "@mui/material";
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

const config: Meta = {
    title: "blocks/TipTapRichTextBlock/TextBlockStyles",
};

export default config;

const introStyle: TipTapTextBlockStyle = {
    name: "intro",
    label: "Intro Text",
    element: (props) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
};

const largeHeadingStyle: TipTapTextBlockStyle = {
    name: "large-heading",
    label: "Large Heading",
    element: (props) => <Typography sx={{ fontSize: 48, lineHeight: 1.2 }} variant="h1" {...props} />,
};

const highlightStyle: TipTapTextBlockStyle = {
    name: "highlight",
    label: "Highlight",
    element: (props) => <div style={{ backgroundColor: "#fff3cd", padding: 8 }} {...props} />,
};

const TextBlockStylesBlock = createTipTapRichTextBlock({
    textBlocks: [
        { name: "paragraph", label: "Paragraph", tag: "p", styles: [introStyle, highlightStyle] },
        { name: "heading-1", label: "Heading 1", tag: "h1", styles: [largeHeadingStyle, highlightStyle] },
        { name: "heading-2", label: "Heading 2", tag: "h2", styles: [largeHeadingStyle, highlightStyle] },
        { name: "heading-3", label: "Heading 3", tag: "h3", styles: [highlightStyle] },
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

const chapterHeadingStyle: TipTapTextBlockStyle = {
    name: "chapter-heading",
    label: "Chapter Heading",
    element: (props) => <h1 style={{ textTransform: "uppercase", letterSpacing: "0.1em" }} {...props} />,
};

const TextBlockStyleInteractionsBlock = createTipTapRichTextBlock({
    textBlocks: [
        { name: "paragraph", label: "Paragraph", tag: "p", styles: [introStyle, highlightStyle] },
        { name: "heading-1", label: "Heading 1", tag: "h1", styles: [chapterHeadingStyle, largeHeadingStyle, highlightStyle] },
        { name: "heading-2", label: "Heading 2", tag: "h2", styles: [largeHeadingStyle, highlightStyle] },
        { name: "heading-3", label: "Heading 3", tag: "h3", styles: [highlightStyle] },
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

const listLargeStyle: TipTapTextBlockStyle = {
    name: "list-large",
    label: "List Large",
    element: (props) => <p style={{ fontSize: 18, lineHeight: "26px" }} {...props} />,
};

const listSmallStyle: TipTapTextBlockStyle = {
    name: "list-small",
    label: "List Small",
    element: (props) => <p style={{ fontSize: 14, lineHeight: "20px" }} {...props} />,
};

const orderedListOnlyStyle: TipTapTextBlockStyle = {
    name: "ol-only",
    label: "Numbered Style",
    element: (props) => <p style={{ fontSize: 16, fontWeight: 600 }} {...props} />,
};

const universalStyle: TipTapTextBlockStyle = {
    name: "universal",
    label: "Universal",
    element: (props) => <div style={{ backgroundColor: "#e8f5e9", padding: 4 }} {...props} />,
};

const ListTextBlockStylesBlock = createTipTapRichTextBlock({
    undoRedoButtons: false,
    italic: false,
    strike: false,
    sub: false,
    sup: false,
    nonBreakingSpace: false,
    softHyphen: false,
    textBlocks: [{ name: "paragraph", label: "Paragraph", tag: "p", styles: [introStyle, universalStyle] }, ...defaultHeadingTextBlocks],
    orderedList: { styles: [listLargeStyle, listSmallStyle, orderedListOnlyStyle, universalStyle] },
    unorderedList: { styles: [listLargeStyle, listSmallStyle, universalStyle] },
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

// "Display" needs no style choice, so it carries its own `element` instead of a single style.
const TextBlockElementBlock = createTipTapRichTextBlock({
    undoRedoButtons: false,
    textBlocks: [
        { name: "paragraph", label: "Paragraph", tag: "p" },
        { name: "display", label: "Display", tag: "h1", element: (props, Tag) => <Tag style={{ fontSize: 64, lineHeight: 1.1 }} {...props} /> },
        { name: "heading-1", label: "Heading 1", tag: "h1", styles: [largeHeadingStyle] },
    ],
});

function TextBlockElementStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(TextBlockElementBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <TextBlockElementBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const TextBlockElement: StoryObj<typeof TextBlockElementStory> = {
    render: () => <TextBlockElementStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("A text block without styles shows no styling select", async () => {
            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")).toHaveLength(1);
                },
                { timeout: 5000 },
            );
        });

        await step("Display renders through its own element", async () => {
            await userEvent.click(canvas.getAllByRole("combobox")[0]);
            await userEvent.click(within(document.body).getByRole("option", { name: "Display" }));

            await waitFor(
                () => {
                    expect(canvas.getByRole("heading", { level: 1 })).toHaveStyle({ fontSize: "64px" });
                    expect(canvas.getAllByRole("combobox")).toHaveLength(1);
                },
                { timeout: 3000 },
            );
        });

        await step("Heading 1 offers its styles instead", async () => {
            await userEvent.click(canvas.getAllByRole("combobox")[0]);
            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 1" }));

            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")).toHaveLength(2);
                },
                { timeout: 3000 },
            );
        });
    },
};

// "Heading 1" has a default style, so its styling select offers no "Default" and always holds one of
// its styles. "Heading 2" shares the same styles without a default, so it keeps the "Default" entry.
// The lists carry a default of their own, which takes over while a paragraph sits in one - by the
// toolbar's list buttons as well as by `Mod-Shift-7`/`Mod-Shift-8`.
const DefaultTextBlockStyleBlock = createTipTapRichTextBlock({
    undoRedoButtons: false,
    textBlocks: [
        { name: "paragraph", label: "Paragraph", tag: "p", styles: [introStyle, highlightStyle], defaultStyle: "intro" },
        { name: "heading-1", label: "Heading 1", tag: "h1", styles: [largeHeadingStyle, chapterHeadingStyle], defaultStyle: "large-heading" },
        { name: "heading-2", label: "Heading 2", tag: "h2", styles: [largeHeadingStyle, chapterHeadingStyle] },
    ],
    orderedList: { styles: [listLargeStyle, listSmallStyle], defaultStyle: "list-large" },
    unorderedList: { styles: [listLargeStyle, listSmallStyle], defaultStyle: "list-large" },
});

function DefaultTextBlockStyleStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(DefaultTextBlockStyleBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <DefaultTextBlockStyleBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const DefaultTextBlockStyle: StoryObj<typeof DefaultTextBlockStyleStory> = {
    render: () => <DefaultTextBlockStyleStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("New content starts with the default text block's default style", async () => {
            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Intro Text");
                },
                { timeout: 5000 },
            );
        });

        await step("A text block with a default style offers no Default entry", async () => {
            await userEvent.click(canvas.getAllByRole("combobox")[1]);

            await waitFor(
                () => {
                    expect(within(document.body).getByRole("option", { name: "Intro Text" })).toBeInTheDocument();
                    expect(within(document.body).queryByRole("option", { name: "Default" })).toBeNull();
                },
                { timeout: 3000 },
            );
            await userEvent.keyboard("{Escape}");
        });

        await step("Switching to Heading 1 applies its own default style", async () => {
            await userEvent.click(canvas.getAllByRole("combobox")[0]);
            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 1" }));

            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Large Heading");
                },
                { timeout: 3000 },
            );
        });

        await step("Heading 2 shares the styles but keeps the Default entry, having no default style", async () => {
            await userEvent.click(canvas.getAllByRole("combobox")[0]);
            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 2" }));

            // "Large Heading" is offered by both, so switching keeps it instead of resetting.
            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Large Heading");
                },
                { timeout: 3000 },
            );

            await userEvent.click(canvas.getAllByRole("combobox")[1]);
            await waitFor(
                () => {
                    expect(within(document.body).getByRole("option", { name: "Default" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
            await userEvent.click(within(document.body).getByRole("option", { name: "Default" }));

            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Default");
                },
                { timeout: 3000 },
            );
        });

        await step("The list shortcut hands the paragraph to the list's default style and back", async () => {
            await userEvent.click(canvas.getAllByRole("combobox")[0]);
            await userEvent.click(within(document.body).getByRole("option", { name: "Paragraph" }));

            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("List item text");

            await waitFor(
                () => {
                    expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Intro Text");
                },
                { timeout: 3000 },
            );

            // TipTap binds list shortcuts to Mod-Shift-{7,8}: Meta on Mac, Control elsewhere
            const mod = /Mac/i.test(navigator.platform) ? "Meta" : "Control";
            await userEvent.keyboard(`{${mod}>}{Shift>}8{/Shift}{/${mod}}`);

            await waitFor(
                () => {
                    expect(editor.querySelector("ul")).toBeTruthy();
                    expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("List Large");
                },
                { timeout: 3000 },
            );

            await userEvent.keyboard(`{${mod}>}{Shift>}8{/Shift}{/${mod}}`);

            await waitFor(
                () => {
                    expect(editor.querySelector("ul")).toBeFalsy();
                    expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Intro Text");
                },
                { timeout: 3000 },
            );
        });
    },
};
