import { Stack } from "@dextinity/admin";
import type { BlockState } from "@dextinity/cms-admin";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { HeadingBlock } from "../HeadingBlock";

function HeadingBlockStory() {
    const [state, setState] = useState<BlockState<typeof HeadingBlock>>(HeadingBlock.defaultValues());

    // Composite blocks open their settings as a sub-page of the surrounding stack, as on a page in the admin.
    return (
        <Stack topLevelTitle={null}>
            <HeadingBlock.AdminComponent state={state} updateState={setState} />
        </Stack>
    );
}

const meta: Meta<typeof HeadingBlockStory> = {
    title: "Blocks/HeadingBlock",
    component: HeadingBlockStory,
};

export default meta;
type Story = StoryObj<typeof HeadingBlockStory>;

export const Default: Story = {};

// Draft.js, which the eyebrow and headline editors use, doesn't support typing through `userEvent`.
export const SelectHtmlTag: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        // The select's label isn't linked to it, so it's found by its default value.
        const htmlTagSelect = await canvas.findByText("Headline 2");

        await userEvent.click(htmlTagSelect);
        await userEvent.click(await within(document.body).findByRole("option", { name: "Headline 1" }));

        await waitFor(() => expect(htmlTagSelect).toHaveTextContent("Headline 1"));
    },
};
