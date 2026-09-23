import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { expect, waitFor, within } from "storybook/test";

import {
    createTipTapRichTextBlock,
    type TipTapRichTextBlockState,
    type TipTapTextBlock,
    type TipTapTextBlockStyle,
} from "../createTipTapRichTextBlock";

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

const config: Meta = {
    title: "blocks/TipTapRichTextBlock/List",
};

export default config;

const defaultHeadingTextBlocks: TipTapTextBlock[] = [1, 2, 3, 4, 5, 6].map((level) => ({
    name: `heading-${level}`,
    label: `Heading ${level}`,
    tag: `h${level}` as "h1",
}));

const introStyle: TipTapTextBlockStyle = {
    name: "intro",
    label: "Intro Text",
    element: (props) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
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

const ListTextBlockBlock = createTipTapRichTextBlock({
    textBlocks: [
        { name: "paragraph", label: "Paragraph", tag: "p" },
        { name: "heading-2", label: "Heading 2", tag: "h2" },
    ],
});

function ListTextBlockStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(ListTextBlockBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <ListTextBlockBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const ListTextBlock: StoryObj<typeof ListTextBlockStory> = {
    render: () => <ListTextBlockStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("A heading turned into a list becomes a paragraph", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("Heading in a list");

            await userEvent.click(canvas.getAllByRole("combobox")[0]);
            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 2" }));

            await waitFor(
                () => {
                    expect(editor.querySelector("h2")).toBeTruthy();
                },
                { timeout: 3000 },
            );

            // TipTap binds list shortcuts to Mod-Shift-{7,8}: Meta on Mac, Control elsewhere
            const mod = /Mac/i.test(navigator.platform) ? "Meta" : "Control";
            await userEvent.keyboard(`{${mod}>}{Shift>}8{/Shift}{/${mod}}`);

            // The heading is wrapped into a list item, where only a paragraph text block belongs.
            await waitFor(
                () => {
                    expect(editor.querySelector("li")).toBeTruthy();
                    expect(editor.querySelector("li h2")).toBeFalsy();
                    expect(editor.querySelector("li p")).toBeTruthy();
                },
                { timeout: 3000 },
            );
            expect(editor).toHaveTextContent("Heading in a list");
        });

        await step("Choosing a heading inside a list takes the content out of the list", async () => {
            const editor = canvas.getByRole("textbox");

            await userEvent.click(canvas.getAllByRole("combobox")[0]);
            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 2" }));

            await waitFor(
                () => {
                    expect(editor.querySelector("h2")).toBeTruthy();
                    expect(editor.querySelector("li")).toBeFalsy();
                },
                { timeout: 3000 },
            );
            expect(editor).toHaveTextContent("Heading in a list");
        });
    },
};
