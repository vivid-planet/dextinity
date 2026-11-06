import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, within } from "storybook/test";

import { createRichTextBlock } from "../createRichTextBlock";
import { createTableBlock } from "../createTableBlock";
import { ExternalLinkBlock } from "../ExternalLinkBlock";

const RichTextBlock = createRichTextBlock({ link: ExternalLinkBlock });
const TableBlock = createTableBlock({ richText: RichTextBlock });

const numberedLines = Array.from({ length: 50 }, (_, index) => `Line ${index + 1}`).join("\n");

const tableWithOneTallCell = TableBlock.input2State({
    columns: [{ id: "column", size: "standard", highlighted: false }],
    rows: [
        {
            id: "row",
            highlighted: false,
            cellValues: [{ columnId: "column", value: { draftContent: { blocks: [{ text: numberedLines }], entityMap: {} } } }],
        },
    ],
});

function TableBlockStory() {
    const [state, setState] = useState(tableWithOneTallCell);

    return <TableBlock.AdminComponent state={state} updateState={setState} />;
}

const config: Meta<typeof TableBlockStory> = {
    component: TableBlockStory,
    title: "Debug/blocks/TableBlock",
    tags: ["!autodocs"],
};

export default config;

type Story = StoryObj<typeof config>;

export const ToolbarStaysAtTopOfCellEditor: Story = {
    play: async ({ userEvent }) => {
        await userEvent.dblClick(await screen.findByRole("cell", { name: /^Line/ }, { timeout: 5000 }));
        const cellEditor = await screen.findByRole("dialog", { name: "Column 1" });

        within(cellEditor).getByRole("textbox").scrollIntoView({ block: "end" });

        const toolbar = cellEditor.querySelector<HTMLElement>(".DextinityAdminRteToolbar-root");
        expect(toolbar?.getBoundingClientRect().top).toBe(getScrollArea(toolbar).getBoundingClientRect().top);
    },
};

function getScrollArea(element: HTMLElement | null) {
    let ancestor = element?.parentElement;
    while (ancestor) {
        if (getComputedStyle(ancestor).overflowY === "auto") {
            return ancestor;
        }
        ancestor = ancestor.parentElement;
    }
    throw new Error("The element has no scroll area");
}
