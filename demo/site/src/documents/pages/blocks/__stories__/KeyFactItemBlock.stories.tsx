import { KeyFactItemBlock } from "@src/documents/pages/blocks/KeyFactItemBlock";
import { emptyRichText } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createKeyFactsItem } from "./pageBlockFixtures";

const meta: Meta<typeof KeyFactItemBlock> = {
    title: "Blocks/Pages/KeyFactItemBlock",
    component: KeyFactItemBlock,
    args: {
        data: createKeyFactsItem({ fact: "250+", label: "Projects" }),
    },
};

export default meta;
type Story = StoryObj<typeof KeyFactItemBlock>;

export const Default: Story = {};

export const WithoutIconAndDescription: Story = {
    args: { data: { ...createKeyFactsItem({ fact: "250+", label: "Projects", hasIcon: false }), description: emptyRichText } },
};
