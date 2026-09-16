import { Box } from "@mui/material";
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

const config: Meta = {
    title: "blocks/TipTapRichTextBlock/Heading",
};

export default config;

const HeadingLevelsBlock = createTipTapRichTextBlock({
    textBlocks: [
        { name: "paragraph", tag: "paragraph", label: "Paragraph" },
        { name: "heading-2", tag: "heading-2", label: "Heading 2" },
        { name: "heading-3", tag: "heading-3", label: "Heading 3" },
        { name: "heading-4", tag: "heading-4", label: "Heading 4" },
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

const HeadingOnlyBlock = createTipTapRichTextBlock({
    // textBlocks order is just the dropdown order (natural ascending here) — defaultTextBlock picks
    // the default level (3) independently, instead of forcing it to be listed first too.
    textBlocks: [
        { name: "heading-2", tag: "heading-2", label: "Heading 2" },
        { name: "heading-3", tag: "heading-3", label: "Heading 3" },
        { name: "heading-4", tag: "heading-4", label: "Heading 4" },
    ],
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

        await step("Text block type dropdown only offers headings, no paragraph, in natural textBlocks order", async () => {
            await userEvent.click(canvas.getByRole("combobox"));

            await waitFor(
                () => {
                    const body = within(document.body);
                    // Dropdown order is textBlocks order (2, 3, 4) — independent of defaultTextBlock (3).
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

const HeadingOnlyWithTextBlockStylesBlock = createTipTapRichTextBlock({
    // The default level (2) must be the first entry — that's what makes it the schema's default block type.
    // Heading 2 and 4 require a style (`defaultStyle`); Heading 3 has none, so it keeps "Default".
    // Heading 4's styles don't overlap with Heading 2/3's at all, so switching to it from either always
    // falls back to its own `defaultStyle` instead of preserving whatever style was active before.
    textBlocks: [
        {
            name: "heading-2",
            tag: "heading-2",
            label: "Heading 2",
            styles: ["headline550", "headline500", "headline450"],
            defaultStyle: "headline550",
        },
        {
            name: "heading-3",
            tag: "heading-3",
            label: "Heading 3",
            styles: ["headline550", "headline500", "headline450"],
        },
        {
            name: "heading-4",
            tag: "heading-4",
            label: "Heading 4",
            styles: ["headline350"],
            defaultStyle: "headline350",
        },
    ],
    textBlockStyles: [
        {
            name: "headline550",
            label: "Size 550",
            element: (props: HTMLAttributes<HTMLElement>) => <h2 style={{ fontSize: 40, lineHeight: 1.2 }} {...props} />,
        },
        {
            name: "headline500",
            label: "Size 500",
            element: (props: HTMLAttributes<HTMLElement>) => <h2 style={{ fontSize: 32, lineHeight: 1.2 }} {...props} />,
        },
        {
            name: "headline450",
            label: "Size 450",
            element: (props: HTMLAttributes<HTMLElement>) => <h2 style={{ fontSize: 26, lineHeight: 1.2 }} {...props} />,
        },
        {
            name: "headline350",
            label: "Size 350",
            element: (props: HTMLAttributes<HTMLElement>) => <h2 style={{ fontSize: 20, lineHeight: 1.2 }} {...props} />,
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
        await step("Editor starts with a heading of the default level, its default style already applied", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("heading", { level: 2 })).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            const comboboxes = canvas.getAllByRole("combobox");
            expect(comboboxes[0]).toHaveTextContent("Heading 2");
            expect(comboboxes[1]).toHaveTextContent("Size 550");
        });

        await step("Heading 2's style dropdown offers every configured size, but no 'Default'", async () => {
            const comboboxes = canvas.getAllByRole("combobox");
            await userEvent.click(comboboxes[1]);

            await waitFor(() => {
                expect(within(document.body).getByRole("option", { name: "Size 500" })).toBeInTheDocument();
            });
            expect(within(document.body).getByRole("option", { name: "Size 550" })).toBeInTheDocument();
            expect(within(document.body).getByRole("option", { name: "Size 450" })).toBeInTheDocument();
            expect(within(document.body).queryByRole("option", { name: "Default" })).not.toBeInTheDocument();

            await userEvent.click(within(document.body).getByRole("option", { name: "Size 500" }));

            await waitFor(() => {
                expect(canvas.getByText("Size 500")).toBeInTheDocument();
            });
        });

        await step("Switching to Heading 3 (no defaultStyle) makes 'Default' available again", async () => {
            const typeCombobox = canvas.getAllByRole("combobox")[0];
            await userEvent.click(typeCombobox);
            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 3" }));

            // The style itself is preserved across the switch (still valid for Heading 3, same style
            // set) — only whether "Default" is offered as a choice differs.
            await waitFor(() => {
                expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Size 500");
            });

            await userEvent.click(canvas.getAllByRole("combobox")[1]);
            await waitFor(() => {
                expect(within(document.body).getByRole("option", { name: "Default" })).toBeInTheDocument();
            });
            await userEvent.keyboard("{Escape}");
        });

        await step("Switching to Heading 4 has no style in common with Heading 3, so its own defaultStyle applies", async () => {
            const typeCombobox = canvas.getAllByRole("combobox")[0];
            await userEvent.click(typeCombobox);
            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 4" }));

            // "Size 500" (carried over from Heading 3) isn't one of Heading 4's styles, so it's
            // replaced by Heading 4's own defaultStyle instead of being preserved.
            await waitFor(() => {
                expect(canvas.getAllByRole("combobox")[1]).toHaveTextContent("Size 350");
            });

            await userEvent.click(canvas.getAllByRole("combobox")[1]);
            await waitFor(() => {
                expect(within(document.body).getByRole("option", { name: "Size 350" })).toBeInTheDocument();
            });
            expect(within(document.body).queryByRole("option", { name: "Size 550" })).not.toBeInTheDocument();
            expect(within(document.body).queryByRole("option", { name: "Default" })).not.toBeInTheDocument();
            await userEvent.keyboard("{Escape}");
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

// A `textBlockStyles` entry flagged `isTextBlockType` is a text block's sole identity, not a free
// style choice: as this entry's only style and `defaultStyle`, it hides the (otherwise pointless,
// single-option) style dropdown entirely — matching the original Draft.js RTE, where a "Display"
// block type sitting above header-one (both rendering as h1) had no separate style selection either.
// The type dropdown's order is still just `textBlocks` array order, "Display" simply comes first.
const IsTextBlockTypeBlock = createTipTapRichTextBlock({
    textBlocks: [
        { name: "display", tag: "heading-1", label: "Display", styles: ["display100"], defaultStyle: "display100" },
        { name: "heading-1", tag: "heading-1", label: "Heading 1" },
        { name: "heading-2", tag: "heading-2", label: "Heading 2" },
        { name: "heading-3", tag: "heading-3", label: "Heading 3" },
        { name: "heading-4", tag: "heading-4", label: "Heading 4" },
        { name: "heading-5", tag: "heading-5", label: "Heading 5" },
    ],
    textBlockStyles: [
        {
            name: "display100",
            label: "Display",
            isTextBlockType: true,
            element: (props: HTMLAttributes<HTMLElement>) => <h1 style={{ fontSize: 64, fontWeight: 700, margin: 0 }} {...props} />,
        },
    ],
});

function IsTextBlockTypeStory() {
    const [state, setState] = useState<TipTapRichTextBlockState>(IsTextBlockTypeBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <IsTextBlockTypeBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const IsTextBlockType: StoryObj<typeof IsTextBlockTypeStory> = {
    render: () => <IsTextBlockTypeStory />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor starts on Display, its style already applied, with only the type dropdown", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("heading", { level: 1 })).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            expect(canvas.getAllByRole("combobox")).toHaveLength(1);
            expect(canvas.getAllByRole("combobox")[0]).toHaveTextContent("Display");
        });

        await step("Type dropdown lists Display right above Heading 1, both h1", async () => {
            const typeCombobox = canvas.getAllByRole("combobox")[0];
            await userEvent.click(typeCombobox);

            await waitFor(() => {
                expect(within(document.body).getByRole("listbox")).toBeInTheDocument();
            });
            const options = within(document.body).getAllByRole("option");
            expect(options.map((option) => option.textContent)).toEqual(["Display", "Heading 1", "Heading 2", "Heading 3", "Heading 4", "Heading 5"]);

            await userEvent.click(within(document.body).getByRole("option", { name: "Heading 1" }));
        });

        await step("Heading 1 keeps the h1 tag, but has no style at all — still no style dropdown", async () => {
            await waitFor(() => {
                expect(canvas.getByRole("heading", { level: 1 })).toBeInTheDocument();
            });
            expect(canvas.getAllByRole("combobox")).toHaveLength(1);
        });

        await step("Switching back to Display re-applies its style, dropdown stays hidden", async () => {
            const typeCombobox = canvas.getAllByRole("combobox")[0];
            await userEvent.click(typeCombobox);
            await userEvent.click(within(document.body).getByRole("option", { name: "Display" }));

            await waitFor(() => {
                expect(canvas.getAllByRole("combobox")).toHaveLength(1);
            });
            expect(canvas.getAllByRole("combobox")[0]).toHaveTextContent("Display");
        });

        await step("Typing into the heading works", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("Headline");

            await waitFor(() => {
                expect(editor).toHaveTextContent("Headline");
            });
        });
    },
};
