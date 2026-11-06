import type { Meta, StoryObj } from "@storybook/react-vite";
import { type HTMLAttributes, useState } from "react";
import { expect, screen, waitFor, within } from "storybook/test";

import { createTableBlock } from "../createTableBlock";
import { createTipTapRichTextBlock } from "../tipTap/createTipTapRichTextBlock";

const TipTapRichTextBlock = createTipTapRichTextBlock({
    textBlocks: [
        {
            name: "paragraph",
            label: "Paragraph",
            tag: "p",
            styles: [{ name: "intro", label: "Intro Text", element: (props: HTMLAttributes<HTMLElement>) => <p {...props} /> }],
        },
    ],
});
const TableBlock = createTableBlock({ richText: TipTapRichTextBlock, name: "TipTapTable" });

const numberedParagraphs = Array.from({ length: 50 }, (_, index) => ({
    type: "textBlock",
    attrs: { textBlock: "paragraph" },
    content: [{ type: "text", text: `Line ${index + 1}` }],
}));

const tableWithOneTallCell = TableBlock.input2State({
    columns: [{ id: "column", size: "standard", highlighted: false }],
    rows: [
        {
            id: "row",
            highlighted: false,
            cellValues: [{ columnId: "column", value: { tipTapContent: { type: "doc", content: numberedParagraphs } } }],
        },
    ],
});

function TipTapTableBlockStory() {
    const [state, setState] = useState(tableWithOneTallCell);

    return <TableBlock.AdminComponent state={state} updateState={setState} />;
}

const config: Meta<typeof TipTapTableBlockStory> = {
    component: TipTapTableBlockStory,
    title: "Debug/blocks/TipTapTableBlock",
    tags: ["!autodocs"],
};

export default config;

type Story = StoryObj<typeof config>;

export const CellEditorOpensScrolledToEnd: Story = {
    play: async ({ userEvent }) => {
        await userEvent.dblClick(await screen.findByRole("cell", { name: /^Line/ }, { timeout: 5000 }));
        const cellEditor = await screen.findByRole("dialog", { name: "Column 1" });
        await within(cellEditor).findByText("Line 50");
        const scrollArea = getScrollArea(cellEditor);

        await waitFor(() => expect(scrollArea.scrollTop).toBe(scrollArea.scrollHeight - scrollArea.clientHeight));
    },
};

export const TypingAfterDoubleClickAppendsToLastLine: Story = {
    play: async ({ userEvent }) => {
        await userEvent.dblClick(await screen.findByRole("cell", { name: /^Line/ }, { timeout: 5000 }));
        const cellEditor = await screen.findByRole("dialog", { name: "Column 1" });
        await waitFor(() => expect(within(cellEditor).getByRole("textbox")).toHaveFocus());

        await userEvent.keyboard("X");

        await within(cellEditor).findByText("Line 50X");
    },
};

function getScrollArea(cellEditor: HTMLElement) {
    let element = cellEditor.querySelector(".DextinityAdminTipTapToolbar-root")?.parentElement;
    while (element && element !== cellEditor) {
        if (getComputedStyle(element).overflowY === "auto") {
            return element;
        }
        element = element.parentElement;
    }
    throw new Error("The cell editor has no scroll area");
}
