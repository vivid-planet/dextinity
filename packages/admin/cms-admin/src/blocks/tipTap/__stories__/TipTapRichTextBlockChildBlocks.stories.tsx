import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, waitFor, within } from "storybook/test";

import { createBlockSkeleton } from "../../helpers/createBlockSkeleton";
import { BlockCategory, type BlockInterface } from "../../types";
import { createTipTapRichTextBlock, type TipTapRichTextBlockState } from "../createTipTapRichTextBlock";

function StatePreview({ state }: { state: TipTapRichTextBlockState }) {
    return (
        <Box component="pre" sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", fontSize: 12, overflow: "auto", borderRadius: 1 }}>
            {JSON.stringify(state, null, 2)}
        </Box>
    );
}

type ExampleChildBlockState = { label: string };

const ExampleChildBlock: BlockInterface<ExampleChildBlockState, ExampleChildBlockState, ExampleChildBlockState> = {
    ...createBlockSkeleton(),
    name: "ExampleChild",
    displayName: "Example Child",
    category: BlockCategory.Other,
    defaultValues: () => ({ label: "" }),
    AdminComponent: ({ state, updateState }) => (
        <input aria-label="Label" value={state.label} onChange={(event) => updateState({ label: event.target.value })} placeholder="Enter a label" />
    ),
    previewContent: (state) => (state.label ? [{ type: "text", content: state.label }] : []),
};

const InlineChildBlocksBlock = createTipTapRichTextBlock({
    childBlocks: { example: { block: ExampleChildBlock, display: "inline" } },
});

const BlockChildBlocksBlock = createTipTapRichTextBlock({
    childBlocks: { example: { block: ExampleChildBlock, display: "block" } },
});

function ChildBlocksStory({ block }: { block: ReturnType<typeof createTipTapRichTextBlock> }) {
    const [state, setState] = useState<TipTapRichTextBlockState>(block.defaultValues());
    const { AdminComponent } = block;

    return (
        <>
            <AdminComponent state={state} updateState={setState} />
            <StatePreview state={state} />
        </>
    );
}

const config: Meta<typeof ChildBlocksStory> = {
    component: ChildBlocksStory,
    title: "blocks/TipTapRichTextBlock/ChildBlocks",
};

export default config;

export const InlineChildBlocks: StoryObj<typeof ChildBlocksStory> = {
    render: () => <ChildBlocksStory block={InlineChildBlocksBlock} />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Type the surrounding text and place the cursor between the words", async () => {
            await userEvent.click(canvas.getByRole("textbox"));
            // Type both words first, then move the cursor back before "after" so the child block
            // ends up between them. Inserting the block last avoids typing next to the atom node.
            await userEvent.type(canvas.getByRole("textbox"), "Text before after{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}");
        });

        await step("Selecting the inline child block opens its dialog", async () => {
            await userEvent.click(canvas.getByRole("button", { name: "Insert block" }));

            // The menu is rendered in a portal, so it lives in document.body rather than within the canvas
            await waitFor(
                () => {
                    expect(within(document.body).getByRole("menuitem", { name: "Example Child" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByRole("menuitem", { name: "Example Child" }));

            await waitFor(
                () => {
                    expect(within(document.body).getByLabelText("Label")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Inserting the inline child block places it inline between the text", async () => {
            await userEvent.type(within(document.body).getByLabelText("Label"), "Inline preview");
            await userEvent.click(within(document.body).getByRole("button", { name: "OK" }));

            await waitFor(
                () => {
                    // The inline preview shares a paragraph (text flow) with the text before and after it
                    expect(canvas.getByText("Inline preview").closest("p")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });
    },
};

export const BlockChildBlocks: StoryObj<typeof ChildBlocksStory> = {
    render: () => <ChildBlocksStory block={BlockChildBlocksBlock} />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Type the surrounding text on separate lines and place the cursor between them", async () => {
            await userEvent.click(canvas.getByRole("textbox"));
            // Type two paragraphs, then move the cursor to the start of the second one ("Text after"
            // has 10 characters) so the block-level child block is inserted between them. Inserting last
            // avoids typing next to the atom node.
            await userEvent.type(
                canvas.getByRole("textbox"),
                "Text before{Enter}Text after{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}",
            );
        });

        await step("Selecting the block-level child block opens its dialog", async () => {
            await userEvent.click(canvas.getByRole("button", { name: "Insert block" }));

            // The menu is rendered in a portal, so it lives in document.body rather than within the canvas
            await waitFor(
                () => {
                    expect(within(document.body).getByRole("menuitem", { name: "Example Child" })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await userEvent.click(within(document.body).getByRole("menuitem", { name: "Example Child" }));

            await waitFor(
                () => {
                    expect(within(document.body).getByLabelText("Label")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Inserting the block-level child block places it as a standalone block between the paragraphs", async () => {
            await userEvent.type(within(document.body).getByLabelText("Label"), "Block preview");
            await userEvent.click(within(document.body).getByRole("button", { name: "OK" }));

            await waitFor(
                () => {
                    // The block-level preview is a boxed row showing the block's display name as a title,
                    // unlike the inline chip which only renders the preview text in the text flow
                    expect(canvas.getByText("Example Child")).toBeInTheDocument();
                    expect(canvas.getByText("Block preview")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });
    },
};
