import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { expect, waitFor } from "storybook/test";

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

const config: Meta = {
    title: "blocks/TipTapRichTextBlock/TextAlign",
};

export default config;

const TextAlignBlock = createTipTapRichTextBlock({ textAlign: true });

const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

const initialState: TipTapRichTextBlockState = {
    tipTapContent: {
        type: "doc",
        content: [
            { type: "textBlock", attrs: { textBlock: "heading-2", textAlign: "center" }, content: [{ type: "text", text: "Centered heading" }] },
            { type: "textBlock", attrs: { textBlock: "paragraph", textAlign: "left" }, content: [{ type: "text", text: loremIpsum }] },
            { type: "textBlock", attrs: { textBlock: "paragraph", textAlign: "center" }, content: [{ type: "text", text: loremIpsum }] },
            { type: "textBlock", attrs: { textBlock: "paragraph", textAlign: "right" }, content: [{ type: "text", text: loremIpsum }] },
            { type: "textBlock", attrs: { textBlock: "paragraph", textAlign: "justify" }, content: [{ type: "text", text: loremIpsum }] },
        ],
    },
};

function TextAlignStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(initialState);

    return (
        <StoryWrapper state={state}>
            <TextAlignBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const TextAlign: StoryObj<typeof TextAlignStory> = {
    render: () => <TextAlignStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        const heading = () => canvas.getByText("Centered heading").closest("h2");

        await step("An alignment button aligns the text block of the selection", async () => {
            await userEvent.click(canvas.getByText("Centered heading"));
            await userEvent.click(canvas.getByRole("button", { name: "Align right" }));

            await waitFor(
                () => {
                    expect(heading()).toHaveStyle({ textAlign: "right" });
                },
                { timeout: 3000 },
            );
        });

        await step("Clicking the active alignment button keeps the alignment", async () => {
            await userEvent.click(canvas.getByRole("button", { name: "Align right" }));

            expect(heading()).toHaveStyle({ textAlign: "right" });
        });

        await step("A keyboard shortcut (Mod-Shift-E) centers the text block", async () => {
            const mod = /Mac/i.test(navigator.platform) ? "Meta" : "Control";
            await userEvent.keyboard(`{${mod}>}{Shift>}e{/Shift}{/${mod}}`);

            await waitFor(
                () => {
                    expect(heading()).toHaveStyle({ textAlign: "center" });
                },
                { timeout: 3000 },
            );
        });
    },
};
