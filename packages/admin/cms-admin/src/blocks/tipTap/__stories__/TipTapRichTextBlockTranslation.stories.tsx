import { ContentTranslationServiceProvider } from "@dextinity/admin";
import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type PropsWithChildren, type ReactNode, useState } from "react";
import { expect, waitFor, within } from "storybook/test";

import { createBlockSkeleton } from "../../helpers/createBlockSkeleton";
import { BlockCategory, type BlockInterface, type LinkBlockInterface } from "../../types";
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

const NoTranslateBlock = createTipTapRichTextBlock({ supports: [], disableContentTranslation: true });

function NoTranslateStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(translationInitialState);

    return (
        <TranslationProvider>
            <StoryWrapper state={state}>
                <NoTranslateBlock.AdminComponent state={state} updateState={setState} />
            </StoryWrapper>
        </TranslationProvider>
    );
}

export const TranslationDisabled: StoryObj<typeof NoTranslateStory> = {
    render: () => <NoTranslateStory />,
    play: async ({ canvas, step }) => {
        await step("Translate button does not render, even though the translation context is enabled", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            expect(canvas.queryByRole("button")).not.toBeInTheDocument();
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

// `supports: []` isn't enough here: the bold mark in the seeded content needs the bold extension
// registered, so the toolbar renders a second button. The translate button stays first regardless,
// since the toolbar renders it before the format group.
const TranslationFormattingBlock = createTipTapRichTextBlock({ supports: ["bold"] });

const translationFormattingInitialState: TipTapRichTextBlockState = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "A " },
                    { type: "text", marks: [{ type: "bold" }], text: "bold" },
                    { type: "text", text: " word" },
                ],
            },
        ],
    },
};

function TranslationFormattingStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(translationFormattingInitialState);
    const [translateCalls, setTranslateCalls] = useState<string[]>([]);

    async function translate(html: string): Promise<string> {
        setTranslateCalls((calls) => [...calls, html]);
        return html;
    }

    return (
        <ContentTranslationServiceProvider enabled translate={translate}>
            <StoryWrapper state={state}>
                <TranslationFormattingBlock.AdminComponent state={state} updateState={setState} />
            </StoryWrapper>
            <Box component="pre" data-testid="translate-calls" sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", fontSize: 12 }}>
                {JSON.stringify(translateCalls, null, 2)}
            </Box>
        </ContentTranslationServiceProvider>
    );
}

export const TranslationPreservesFormatting: StoryObj<typeof TranslationFormattingStory> = {
    render: () => <TranslationFormattingStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with a translate button", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                    expect(canvas.getAllByRole("button")).toHaveLength(2);
                },
                { timeout: 5000 },
            );
        });

        await step("Translating sends the whole paragraph as a single request, with the bold mark's context intact", async () => {
            const [translateButton] = canvas.getAllByRole("button");
            await userEvent.click(translateButton);

            await waitFor(
                () => {
                    // One request for the whole field (not one per text node), and the bold run travels
                    // together with its surrounding text instead of being sent as a separate fragment.
                    const calls: string[] = JSON.parse(canvas.getByTestId("translate-calls").textContent ?? "[]");
                    expect(calls).toHaveLength(1);
                    expect(calls[0]).toContain("A <strong>bold</strong> word");
                },
                { timeout: 3000 },
            );

            await waitFor(
                () => {
                    // Round-tripping through HTML reconstructs the same single paragraph, bold mark included.
                    const editor = canvas.getByRole("textbox");
                    expect(editor.querySelectorAll("p")).toHaveLength(1);
                    expect(editor).toHaveTextContent("A bold word");
                    expect(editor.querySelector("strong")).toHaveTextContent("bold");
                },
                { timeout: 3000 },
            );
        });
    },
};

interface StructuredChildBlockState {
    nested: { value: string };
}

const StructuredChildBlock: BlockInterface<StructuredChildBlockState, StructuredChildBlockState, StructuredChildBlockState> = {
    ...createBlockSkeleton(),
    name: "StructuredChild",
    displayName: "Structured Child",
    category: BlockCategory.Other,
    defaultValues: () => ({ nested: { value: "" } }),
    AdminComponent: () => null,
    previewContent: () => [],
};

const TranslationChildBlockDataBlock = createTipTapRichTextBlock({
    supports: [],
    childBlocks: { structured: { block: StructuredChildBlock, display: "block" } },
});

const translationChildBlockDataInitialState: TipTapRichTextBlockState = {
    tipTapContent: {
        type: "doc",
        content: [
            { type: "paragraph", content: [{ type: "text", text: "Before" }] },
            { type: "cmsBlock", attrs: { blockType: "structured", data: { nested: { value: "keep me" } } } },
            { type: "paragraph", content: [{ type: "text", text: "After" }] },
        ],
    },
};

// The HTML round trip only needs to leave the child block's structured `data` byte-for-byte
// identical; whether translation itself changes the surrounding text is a separate concern
// (covered by the other translation stories), so an identity translate keeps this story focused.
const identityTranslate = async (html: string): Promise<string> => html;

function TranslationChildBlockDataStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(translationChildBlockDataInitialState);

    return (
        <ContentTranslationServiceProvider enabled translate={identityTranslate}>
            <StoryWrapper state={state}>
                <TranslationChildBlockDataBlock.AdminComponent state={state} updateState={setState} />
            </StoryWrapper>
        </ContentTranslationServiceProvider>
    );
}

export const TranslationPreservesChildBlockData: StoryObj<typeof TranslationChildBlockDataStory> = {
    render: () => <TranslationChildBlockDataStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with a translate button", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                    // The sole unnamed button is Translate; "Insert block" (from childBlocks) has its own accessible name.
                    expect(canvas.getAllByRole("button", { name: "" })).toHaveLength(1);
                },
                { timeout: 5000 },
            );
        });

        await step("Translating leaves the surrounding text and the child block's structured data unchanged", async () => {
            const [translateButton] = canvas.getAllByRole("button", { name: "" });
            await userEvent.click(translateButton);

            await waitFor(
                () => {
                    const editor = canvas.getByRole("textbox");
                    expect(editor).toHaveTextContent("Before");
                    expect(editor).toHaveTextContent("After");
                },
                { timeout: 3000 },
            );

            await waitFor(
                () => {
                    const state = JSON.parse(canvas.getByText(/"tipTapContent"/).textContent ?? "{}");

                    const cmsBlockNode = state.tipTapContent.content.find((node: any) => node.type === "cmsBlock");
                    // Without externalizing it first, this object would come back as the literal string
                    // "[object Object]" — HTML attribute serialization stringifies non-string values.
                    expect(cmsBlockNode.attrs.data).toEqual({ nested: { value: "keep me" } });
                },
                { timeout: 3000 },
            );
        });
    },
};

interface FalsyDataLinkBlockState {
    url: string;
}

const FalsyDataLinkBlock: BlockInterface<FalsyDataLinkBlockState, FalsyDataLinkBlockState, FalsyDataLinkBlockState> & LinkBlockInterface = {
    ...createBlockSkeleton(),
    name: "FalsyDataLink",
    displayName: "Link",
    category: BlockCategory.Other,
    defaultValues: () => ({ url: "" }),
    AdminComponent: () => null,
    previewContent: () => [],
};

const TranslationFalsyLinkDataBlock = createTipTapRichTextBlock({ supports: [], link: FalsyDataLinkBlock });

const translationFalsyLinkDataInitialState: TipTapRichTextBlockState = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "Before " },
                    // `false` is a valid (if unusual) value for a link mark's `data`: `setCmsLink`'s `data` is
                    // typed as `any`, so nothing rules it out even though the link dialog never produces it.
                    { type: "text", marks: [{ type: "link", attrs: { data: false } }], text: "link" },
                    { type: "text", text: " after" },
                ],
            },
        ],
    },
};

function TranslationFalsyLinkDataStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(translationFalsyLinkDataInitialState);

    return (
        <ContentTranslationServiceProvider enabled translate={identityTranslate}>
            <StoryWrapper state={state}>
                <TranslationFalsyLinkDataBlock.AdminComponent state={state} updateState={setState} />
            </StoryWrapper>
        </ContentTranslationServiceProvider>
    );
}

export const TranslationPreservesFalsyLinkData: StoryObj<typeof TranslationFalsyLinkDataStory> = {
    render: () => <TranslationFalsyLinkDataStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with a translate button", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                    // Translate, Link and Remove Link — the toolbar always renders translate first.
                    expect(canvas.getAllByRole("button")).toHaveLength(3);
                },
                { timeout: 5000 },
            );
        });

        await step("Translating leaves the link mark's `false` data untouched instead of turning it into a string", async () => {
            const [translateButton] = canvas.getAllByRole("button");
            await userEvent.click(translateButton);

            await waitFor(
                () => {
                    const editor = canvas.getByRole("textbox");
                    expect(editor).toHaveTextContent("Before link after");
                },
                { timeout: 3000 },
            );

            await waitFor(
                () => {
                    const state = JSON.parse(canvas.getByText(/"tipTapContent"/).textContent ?? "{}");

                    const paragraph = state.tipTapContent.content[0];

                    const linkTextNode = paragraph.content.find((node: any) => node.marks?.some((mark: any) => mark.type === "link"));
                    // Without unconditional externalization, `false` would come back as the string "false".
                    expect(linkTextNode.marks[0].attrs.data).toBe(false);
                },
                { timeout: 3000 },
            );
        });
    },
};

const TranslationPlaceholderBlock = createTipTapRichTextBlock({
    supports: [],
    placeholders: [{ name: "firstName", label: "First Name" }],
});

const translationPlaceholderInitialState: TipTapRichTextBlockState = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "Hello " },
                    { type: "placeholder", attrs: { name: "firstName" } },
                    { type: "text", text: ", welcome." },
                ],
            },
        ],
    },
};

function TranslationPlaceholderStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(translationPlaceholderInitialState);

    return (
        <ContentTranslationServiceProvider enabled translate={identityTranslate}>
            <StoryWrapper state={state}>
                <TranslationPlaceholderBlock.AdminComponent state={state} updateState={setState} />
            </StoryWrapper>
        </ContentTranslationServiceProvider>
    );
}

export const TranslationPreservesPlaceholders: StoryObj<typeof TranslationPlaceholderStory> = {
    render: () => <TranslationPlaceholderStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with a translate button", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                    // Translate and Insert placeholder — the toolbar always renders translate first.
                    expect(canvas.getAllByRole("button")).toHaveLength(2);
                },
                { timeout: 5000 },
            );
        });

        await step("Translating reconstructs the placeholder from its data-name attribute, not its rendered {{name}} text", async () => {
            const [translateButton] = canvas.getAllByRole("button");
            await userEvent.click(translateButton);

            await waitFor(
                () => {
                    const editor = canvas.getByRole("textbox");
                    expect(within(editor).getByText("{{firstName}}")).toBeInTheDocument();
                },
                { timeout: 3000 },
            );

            await waitFor(
                () => {
                    const state = JSON.parse(canvas.getByText(/"tipTapContent"/).textContent ?? "{}");
                    const paragraph = state.tipTapContent.content[0];
                    expect(paragraph.content).toContainEqual({ type: "placeholder", attrs: { name: "firstName" } });
                },
                { timeout: 3000 },
            );
        });
    },
};

// `translate` is typed as an unconstrained (text: string) => Promise<string>, so nothing in the type
// system rules out an implementation like this one, which mangles the HTML itself instead of only the
// human-readable text. It stands in for any non-HTML-aware translator someone could plug in.
const corruptingTranslate = async (html: string): Promise<string> => html.toUpperCase();

const TranslationRejectsCorruptingTranslateBlock = createTipTapRichTextBlock({ supports: [], link: FalsyDataLinkBlock });

const translationCorruptionInitialState: TipTapRichTextBlockState = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "Before " },
                    { type: "text", marks: [{ type: "link", attrs: { data: { url: "https://example.com" } } }], text: "link" },
                    { type: "text", text: " after" },
                ],
            },
        ],
    },
};

function TranslationRejectsCorruptingTranslateStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(translationCorruptionInitialState);

    return (
        <ContentTranslationServiceProvider enabled translate={corruptingTranslate}>
            <StoryWrapper state={state}>
                <TranslationRejectsCorruptingTranslateBlock.AdminComponent state={state} updateState={setState} />
            </StoryWrapper>
        </ContentTranslationServiceProvider>
    );
}

export const TranslationRejectsCorruptingTranslate: StoryObj<typeof TranslationRejectsCorruptingTranslateStory> = {
    render: () => <TranslationRejectsCorruptingTranslateStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with a translate button", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                    // Translate, Link and Remove Link — the toolbar always renders translate first.
                    expect(canvas.getAllByRole("button")).toHaveLength(3);
                },
                { timeout: 5000 },
            );
        });

        await step("A translate function that mangles HTML markup is rejected instead of silently corrupting the link data", async () => {
            const [translateButton] = canvas.getAllByRole("button");
            await userEvent.click(translateButton);

            // There is no visible error UI in this Storybook setup (no <ErrorDialog/> mounted), so the
            // only observable signal is the absence of a state change. Give the rejected translate()
            // call time to run and confirm it did not apply anyway.
            await new Promise((resolve) => setTimeout(resolve, 500));

            const state = JSON.parse(canvas.getByText(/"tipTapContent"/).textContent ?? "{}");
            expect(state.tipTapContent).toEqual(translationCorruptionInitialState.tipTapContent);
        });
    },
};
