import type { BlockState } from "@dextinity/cms-admin";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { TipTapRichTextBlock } from "../TipTapRichTextBlock";

function TipTapRichTextBlockStory() {
    const [state, setState] = useState<BlockState<typeof TipTapRichTextBlock>>(TipTapRichTextBlock.defaultValues());

    return <TipTapRichTextBlock.AdminComponent state={state} updateState={setState} />;
}

const meta: Meta<typeof TipTapRichTextBlockStory> = {
    title: "Blocks/TipTapRichTextBlock",
    component: TipTapRichTextBlockStory,
};

export default meta;
type Story = StoryObj<typeof TipTapRichTextBlockStory>;

export const Default: Story = {};

export const TypeText: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const editor = await canvas.findByRole("textbox", {}, { timeout: 5000 });

        await userEvent.click(editor);
        await userEvent.keyboard("Hello Dextinity");

        await waitFor(() => expect(editor).toHaveTextContent("Hello Dextinity"));
    },
};
