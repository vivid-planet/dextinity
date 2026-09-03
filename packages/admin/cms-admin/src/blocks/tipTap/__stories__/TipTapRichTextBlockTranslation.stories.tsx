import { ContentTranslationServiceProvider } from "@dextinity/admin";
import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type PropsWithChildren, type ReactNode, useState } from "react";
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

const config: Meta = {
    title: "blocks/TipTapRichTextBlock/Translation",
};

export default config;

const uppercaseTranslate = async (text: string): Promise<string> => text.toUpperCase();

// No `supports` means only the translate button renders, so it's the toolbar's sole (and thus unambiguous) button.
const TranslationBlock = createTipTapRichTextBlock({ supports: [] });

const translationInitialState: TipTapRichTextBlockState = {
    tipTapContent: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hello world" }] }] },
};

function TranslationProvider({ children, showApplyTranslationDialog }: PropsWithChildren<{ showApplyTranslationDialog?: boolean }>) {
    return (
        <ContentTranslationServiceProvider enabled translate={uppercaseTranslate} showApplyTranslationDialog={showApplyTranslationDialog}>
            {children}
        </ContentTranslationServiceProvider>
    );
}

function TranslationStory({ showApplyTranslationDialog }: { showApplyTranslationDialog?: boolean }) {
    const [state, setState] = useState<TipTapRichTextBlockState>(translationInitialState);

    return (
        <TranslationProvider showApplyTranslationDialog={showApplyTranslationDialog}>
            <StoryWrapper state={state}>
                <TranslationBlock.AdminComponent state={state} updateState={setState} />
            </StoryWrapper>
        </TranslationProvider>
    );
}

export const Translation: StoryObj<typeof TranslationStory> = {
    render: () => <TranslationStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with a translate button", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                    expect(canvas.getByRole("button")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Clicking translate replaces the content immediately (no review dialog)", async () => {
            await userEvent.click(canvas.getByRole("button"));

            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toHaveTextContent("HELLO WORLD");
                },
                { timeout: 3000 },
            );
        });
    },
};

export const TranslationWithApplyDialog: StoryObj<typeof TranslationStory> = {
    render: () => <TranslationStory showApplyTranslationDialog />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with a translate button", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("button")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Clicking translate opens a review dialog with the original and translated content", async () => {
            await userEvent.click(canvas.getByRole("button"));

            await waitFor(
                () => {
                    expect(within(document.body).getByRole("heading", { name: "Translation", level: 2 })).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            const dialog = within(document.body).getByRole("dialog");
            expect(within(dialog).getByText("Hello world")).toBeInTheDocument();
            expect(within(dialog).getByText("HELLO WORLD")).toBeInTheDocument();
        });

        await step("Applying the translation updates the editor and closes the dialog", async () => {
            await userEvent.click(within(document.body).getByRole("button", { name: "Apply" }));

            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toHaveTextContent("HELLO WORLD");
                    expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });
    },
};

const TranslationHeadingLevelsBlock = createTipTapRichTextBlock({ supports: ["heading"], headingLevels: [2, 3] });

function TranslationHeadingLevelsStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(translationInitialState);

    return (
        <TranslationProvider showApplyTranslationDialog>
            <StoryWrapper state={state}>
                <TranslationHeadingLevelsBlock.AdminComponent state={state} updateState={setState} />
            </StoryWrapper>
        </TranslationProvider>
    );
}

export const TranslationRespectsHeadingLevels: StoryObj<typeof TranslationHeadingLevelsStory> = {
    render: () => <TranslationHeadingLevelsStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with a translate button", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("button")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );
        });

        await step("Open the translation review dialog", async () => {
            await userEvent.click(canvas.getByRole("button"));

            await waitFor(
                () => {
                    expect(within(document.body).getByRole("dialog")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("The translated-side heading dropdown only offers Heading 2-3, matching the block's headingLevels", async () => {
            const dialog = within(document.body).getByRole("dialog");
            await userEvent.click(within(dialog).getByRole("combobox"));

            await waitFor(
                () => {
                    const body = within(document.body);
                    expect(body.getByText("Heading 2")).toBeInTheDocument();
                    expect(body.getByText("Heading 3")).toBeInTheDocument();
                    expect(body.queryByText("Heading 1")).not.toBeInTheDocument();
                    expect(body.queryByText("Heading 4")).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });
    },
};
