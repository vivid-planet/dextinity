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
    title: "blocks/TipTapRichTextBlock/Heading",
};

export default config;

const HeadingLevelsBlock = createTipTapRichTextBlock({
    textBlocks: [
        { name: "paragraph", label: "Paragraph", tag: "p" },
        { name: "heading-2", label: "Heading 2", tag: "h2" },
        { name: "heading-3", label: "Heading 3", tag: "h3" },
        { name: "heading-4", label: "Heading 4", tag: "h4" },
    ],
});

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

        await step("A keyboard shortcut updates the stored text block along with the level", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            const mod = /Mac/i.test(navigator.platform) ? "Meta" : "Control";
            await userEvent.keyboard(`{${mod}>}{Alt>}3{/Alt}{/${mod}}`);

            await waitFor(
                () => {
                    expect(canvas.getByRole("heading", { level: 3 })).toBeInTheDocument();
                    // A name that doesn't belong to the node's tag is content the API rejects.
                    expect(canvas.getByText(/"textBlock": "heading-3"/)).toBeInTheDocument();
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

const headingOnlyTextBlocks: TipTapTextBlock[] = [
    { name: "heading-2", label: "Heading 2", tag: "h2" },
    { name: "heading-3", label: "Heading 3", tag: "h3" },
    { name: "heading-4", label: "Heading 4", tag: "h4" },
];

const HeadingOnlyBlock = createTipTapRichTextBlock({
    textBlocks: headingOnlyTextBlocks,
    defaultTextBlock: "heading-3",
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
                () => {
                    expect(canvas.getByRole("heading", { level: 3 })).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Text block type dropdown only offers headings, no paragraph", async () => {
            await userEvent.click(canvas.getByRole("combobox"));

            await waitFor(
                () => {
                    const body = within(document.body);
                    expect(body.getAllByRole("option").map((option) => option.textContent)).toEqual(["Heading 2", "Heading 3", "Heading 4"]);
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 2" }));
        });

        await step("Selected heading level is applied", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("heading", { level: 2 })).toBeInTheDocument();
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
                () => {
                    expect(canvas.getByRole("heading", { level: 4 })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Typing into the heading works", async () => {
            await userEvent.keyboard("Headline");

            await waitFor(
                () => {
                    expect(canvas.getByRole("heading", { level: 4 })).toHaveTextContent("Headline");
                },
                { timeout: 3000 },
            );
        });
    },
};

const headline550Style: TipTapTextBlockStyle = {
    name: "headline550",
    label: "Size 550",
    element: (props, Tag) => <Tag style={{ fontSize: 40, lineHeight: 1.2 }} {...props} />,
};

const HeadingOnlyWithTextBlockStylesBlock = createTipTapRichTextBlock({
    textBlocks: [
        { name: "heading-2", label: "Heading 2", tag: "h2", styles: [headline550Style] },
        { name: "heading-3", label: "Heading 3", tag: "h3", styles: [headline550Style] },
        { name: "heading-4", label: "Heading 4", tag: "h4", styles: [headline550Style] },
    ],
    defaultTextBlock: "heading-3",
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
                () => {
                    expect(canvas.getByRole("heading", { level: 3 })).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Applying a text block style keeps the heading", async () => {
            const comboboxes = canvas.getAllByRole("combobox");
            expect(comboboxes[0]).toHaveTextContent("Heading 3");
            await userEvent.click(comboboxes[1]);

            await waitFor(
                () => {
                    expect(within(document.body).getByRole("option", { name: "Size 550" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByRole("option", { name: "Size 550" }));

            await waitFor(
                () => {
                    expect(canvas.getByText("Size 550")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Typing into the styled heading works", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("Headline");

            await waitFor(
                () => {
                    expect(editor).toHaveTextContent("Headline");
                },
                { timeout: 3000 },
            );
        });
    },
};
