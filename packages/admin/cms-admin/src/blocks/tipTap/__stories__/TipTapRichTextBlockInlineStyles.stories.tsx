import { RteHighlight, Tag } from "@dextinity/admin-icons";
import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type HTMLAttributes, useState } from "react";
import { expect, waitFor, within } from "storybook/test";

import { createTipTapRichTextBlock, type TipTapRichTextBlockState } from "../createTipTapRichTextBlock";

function StatePreview({ state }: { state: TipTapRichTextBlockState }) {
    return (
        <Box component="pre" sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", fontSize: 12, overflow: "auto", borderRadius: 1 }}>
            {JSON.stringify(state, null, 2)}
        </Box>
    );
}

function InlineStylesBlockStory({ block }: { block: ReturnType<typeof createTipTapRichTextBlock> }) {
    const [state, setState] = useState<TipTapRichTextBlockState>(block.defaultValues());
    const { AdminComponent } = block;

    return (
        <>
            <AdminComponent state={state} updateState={setState} />
            <StatePreview state={state} />
        </>
    );
}

const config: Meta<typeof InlineStylesBlockStory> = {
    component: InlineStylesBlockStory,
    title: "blocks/TipTapRichTextBlock/InlineStyles",
};

export default config;

const InlineStylesBlock = createTipTapRichTextBlock({
    supports: ["heading", "sub", "sup"],
    inlineStyles: [
        {
            name: "highlight",
            label: "Highlight",
            icon: RteHighlight,
            element: (props: HTMLAttributes<HTMLElement>) => <span style={{ backgroundColor: "#fff3cd", padding: "0 2px" }} {...props} />,
        },
        {
            name: "tag",
            label: "Tag",
            icon: Tag,
            element: (props: HTMLAttributes<HTMLElement>) => (
                <span style={{ backgroundColor: "#e0f0ff", color: "#0066cc", padding: "0 4px", borderRadius: 4 }} {...props} />
            ),
        },
    ],
});

export const InlineStyles: StoryObj<typeof InlineStylesBlockStory> = {
    render: () => <InlineStylesBlockStory block={InlineStylesBlock} />,
    play: async ({ canvas, userEvent, step }) => {
        await step(
            "Without bold/italic/underline/strike buttons, superscript/subscript/inline styles render as their own toolbar buttons instead of a 'More options' menu",
            async () => {
                await waitFor(
                    () => {
                        expect(canvas.getByRole("textbox")).toBeInTheDocument();
                    },
                    { timeout: 5000 },
                );

                expect(canvas.queryByRole("button", { name: "More options" })).not.toBeInTheDocument();
                expect(canvas.getAllByRole("button")).toHaveLength(4);
            },
        );

        const [superscriptButton, subscriptButton, highlightButton, tagButton] = canvas.getAllByRole("button");

        await step("Highlight and tag buttons are enabled even without a selection, like superscript/subscript", async () => {
            expect(superscriptButton).toBeEnabled();
            expect(subscriptButton).toBeEnabled();
            expect(highlightButton).toBeEnabled();
            expect(tagButton).toBeEnabled();
        });

        await step("Type text and select it", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("hello");

            await waitFor(
                () => {
                    expect(editor).toHaveTextContent("hello");
                },
                { timeout: 3000 },
            );

            // userEvent's Shift+Home isn't supported in contenteditable; use the native Selection API.
            const range = document.createRange();
            range.selectNodeContents(editor);
            const selectionChanged = new Promise<void>((resolve) => document.addEventListener("selectionchange", () => resolve(), { once: true }));
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);

            // jsdom fires `selectionchange` asynchronously, and TipTap only picks up the selection once that event fires.
            await selectionChanged;
        });

        await step("Toggle superscript directly from the toolbar button", async () => {
            await userEvent.click(superscriptButton);
            await waitFor(() => {
                expect(document.querySelector("sup")).toHaveTextContent("hello");
            });

            await userEvent.click(superscriptButton);
            await waitFor(() => {
                expect(document.querySelector("sup")).toBeNull();
            });
        });

        await step("Toggle subscript directly from the toolbar button", async () => {
            await userEvent.click(subscriptButton);
            await waitFor(() => {
                expect(document.querySelector("sub")).toHaveTextContent("hello");
            });

            await userEvent.click(subscriptButton);
            await waitFor(() => {
                expect(document.querySelector("sub")).toBeNull();
            });
        });

        await step("Toggle the 'Highlight' inline style directly from the toolbar button", async () => {
            await userEvent.click(highlightButton);
            await waitFor(() => {
                const styledEl = document.querySelector('[data-inline-style="highlight"]');
                expect(styledEl).toBeTruthy();
                expect(styledEl).toHaveTextContent("hello");
            });

            await userEvent.click(highlightButton);
            await waitFor(() => {
                expect(document.querySelector("[data-inline-style]")).toBeNull();
            });
        });

        await step("Subscript and 'Highlight' can be active at the same time — each is its own button, no menu to reopen in between", async () => {
            await userEvent.click(subscriptButton);
            await userEvent.click(highlightButton);

            await waitFor(() => {
                expect(document.querySelector("sub")).toHaveTextContent("hello");
                expect(document.querySelector('[data-inline-style="highlight"]')).toHaveTextContent("hello");
            });
        });

        await step("Switching to 'Tag' replaces 'Highlight' (both share the same inline-style mark) but leaves subscript untouched", async () => {
            await userEvent.click(tagButton);

            await waitFor(() => {
                expect(document.querySelector('[data-inline-style="highlight"]')).toBeNull();
                const tagEl = document.querySelector('[data-inline-style="tag"]');
                expect(tagEl).toBeTruthy();
                expect(tagEl).toHaveTextContent("hello");
                expect(document.querySelector("sub")).toHaveTextContent("hello");
            });
        });
    },
};

const InlineStylesMoreOptionsBlock = createTipTapRichTextBlock({
    inlineStyles: [
        {
            name: "highlight",
            label: "Highlight",
            icon: RteHighlight,
            element: (props: HTMLAttributes<HTMLElement>) => <span style={{ backgroundColor: "#fff3cd", padding: "0 2px" }} {...props} />,
        },
        {
            name: "tag",
            label: "Tag",
            icon: Tag,
            element: (props: HTMLAttributes<HTMLElement>) => (
                <span style={{ backgroundColor: "#e0f0ff", color: "#0066cc", padding: "0 4px", borderRadius: 4 }} {...props} />
            ),
        },
    ],
});

export const InlineStylesMoreOptions: StoryObj<typeof InlineStylesBlockStory> = {
    render: () => <InlineStylesBlockStory block={InlineStylesMoreOptionsBlock} />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            // Heading select only — custom inline styles live in the "More options" menu, not a dropdown.
            const comboboxes = canvas.getAllByRole("combobox");
            expect(comboboxes).toHaveLength(1);
        });

        await step("Type text and select it", async () => {
            const editor = canvas.getByRole("textbox");
            await userEvent.click(editor);
            await userEvent.keyboard("hello");

            await waitFor(
                () => {
                    expect(editor).toHaveTextContent("hello");
                },
                { timeout: 3000 },
            );

            // userEvent's Shift+Home isn't supported in contenteditable; use the native Selection API.
            const range = document.createRange();
            range.selectNodeContents(editor);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        });

        await step("Apply 'Highlight' inline style from the More options menu", async () => {
            await userEvent.click(canvas.getByRole("button", { name: "More options" }));
            await userEvent.click(within(document.body).getByRole("menuitem", { name: "Highlight" }));
        });

        await step("Verify highlight element (from `element` prop) is rendered with its styling", async () => {
            await waitFor(
                () => {
                    const styledEl = document.querySelector('[data-inline-style="highlight"]');
                    expect(styledEl).toBeTruthy();
                    expect(styledEl).toHaveTextContent("hello");
                    expect(styledEl).toHaveStyle({ backgroundColor: "rgb(255, 243, 205)" });
                },
                { timeout: 3000 },
            );
        });

        await step("'Highlight' menu item is now shown as selected", async () => {
            await userEvent.click(canvas.getByRole("button", { name: "More options" }));
            await waitFor(() => {
                // MenuItem's `selected` prop is exposed as the `Mui-selected` state class, not an ARIA attribute
                // (role="menuitem" has no `aria-selected` in the ARIA spec — that's only valid on option/tab/etc.).
                expect(within(document.body).getByRole("menuitem", { name: "Highlight" })).toHaveClass("Mui-selected");
            });
        });

        await step("Switch to 'Tag' inline style", async () => {
            await userEvent.click(within(document.body).getByRole("menuitem", { name: "Tag" }));
        });

        await step("Verify tag element replaces the highlight element", async () => {
            await waitFor(
                () => {
                    expect(document.querySelector('[data-inline-style="highlight"]')).toBeNull();
                    const tagEl = document.querySelector('[data-inline-style="tag"]');
                    expect(tagEl).toBeTruthy();
                    expect(tagEl).toHaveTextContent("hello");
                    expect(tagEl).toHaveStyle({ backgroundColor: "rgb(224, 240, 255)", color: "rgb(0, 102, 204)" });
                },
                { timeout: 3000 },
            );
        });

        await step("Clicking the active 'Tag' item again clears the inline style", async () => {
            await userEvent.click(canvas.getByRole("button", { name: "More options" }));
            await userEvent.click(within(document.body).getByRole("menuitem", { name: "Tag" }));

            await waitFor(
                () => {
                    expect(document.querySelector("[data-inline-style]")).toBeNull();
                },
                { timeout: 3000 },
            );
        });
    },
};

const CombinedStylesBlock = createTipTapRichTextBlock({
    textBlockStyles: [
        {
            name: "intro",
            label: "Intro Text",
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 20, fontStyle: "italic" }} {...props} />,
        },
    ],
    inlineStyles: [
        {
            name: "highlight",
            label: "Highlight",
            icon: RteHighlight,
            element: (props: HTMLAttributes<HTMLElement>) => <span style={{ backgroundColor: "#fff3cd", padding: "0 2px" }} {...props} />,
        },
        {
            name: "tag",
            label: "Tag",
            icon: Tag,
            element: (props: HTMLAttributes<HTMLElement>) => (
                <span style={{ backgroundColor: "#e0f0ff", color: "#0066cc", padding: "0 4px", borderRadius: 4 }} {...props} />
            ),
        },
    ],
});

export const CombinedTextBlockAndInlineStyles: StoryObj<typeof InlineStylesBlockStory> = {
    render: () => <InlineStylesBlockStory block={CombinedStylesBlock} />,
    play: async ({ canvas, userEvent, step }) => {
        await step("Editor is ready with the text block style dropdown and the inline styles in the More options menu", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("textbox")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            // Heading select + text block style select — inline styles live in the "More options" menu, not a dropdown.
            const comboboxes = canvas.getAllByRole("combobox");
            expect(comboboxes.length).toBeGreaterThanOrEqual(2);

            await userEvent.click(canvas.getByRole("button", { name: "More options" }));
            await waitFor(() => {
                expect(within(document.body).getByRole("menuitem", { name: "Highlight" })).toBeInTheDocument();
                expect(within(document.body).getByRole("menuitem", { name: "Tag" })).toBeInTheDocument();
            });
        });
    },
};
