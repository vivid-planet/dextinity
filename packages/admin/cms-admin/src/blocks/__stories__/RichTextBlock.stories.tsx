import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";

import { createRichTextBlock, type RichTextBlockState } from "../createRichTextBlock";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { BlockCategory, type BlockInterface, type LinkBlockInterface } from "../types";

const StubLinkBlock: BlockInterface & LinkBlockInterface = {
    ...createBlockSkeleton(),
    name: "ExternalLink",
    displayName: "External Link",
    defaultValues: () => ({ targetUrl: undefined, openInNewWindow: false }),
    category: BlockCategory.Navigation,
    AdminComponent: () => null,
};

const RichTextBlock = createRichTextBlock({ link: StubLinkBlock });

function RichTextBlockStory() {
    const [state, setState] = useState<RichTextBlockState>(RichTextBlock.defaultValues());

    return (
        <MemoryRouter>
            <RichTextBlock.AdminComponent state={state} updateState={setState} />
        </MemoryRouter>
    );
}

const config: Meta<typeof RichTextBlockStory> = {
    component: RichTextBlockStory,
    title: "blocks/RichTextBlock",
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {};
