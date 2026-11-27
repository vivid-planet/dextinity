import { KeyFactsBlock } from "@src/documents/pages/blocks/KeyFactsBlock";
import { createListItems } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createKeyFactsItem } from "./pageBlockFixtures";

const meta: Meta<typeof KeyFactsBlock> = {
    title: "Blocks/Pages/KeyFactsBlock",
    component: KeyFactsBlock,
    args: {
        data: {
            blocks: createListItems([
                createKeyFactsItem({ fact: "250+", label: "Projects" }),
                createKeyFactsItem({ fact: "20", label: "Years of experience" }),
                createKeyFactsItem({ fact: "99%", label: "Uptime" }),
                createKeyFactsItem({ fact: "24/7", label: "Support" }),
            ]),
        },
    },
};

export default meta;
type Story = StoryObj<typeof KeyFactsBlock>;

export const Default: Story = {};

export const TwoItems: Story = {
    args: {
        data: {
            blocks: createListItems([
                createKeyFactsItem({ fact: "250+", label: "Projects" }),
                createKeyFactsItem({ fact: "20", label: "Years of experience" }),
            ]),
        },
    },
};
