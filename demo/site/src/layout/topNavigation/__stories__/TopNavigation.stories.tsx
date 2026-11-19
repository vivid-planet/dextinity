import { TopNavigation } from "@src/layout/topNavigation/TopNavigation";
import { navigationNodes } from "@src/storybook/pageTreeFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof TopNavigation> = {
    title: "Layout/TopNavigation",
    component: TopNavigation,
    parameters: {
        nextjs: { appDirectory: true, navigation: { pathname: "/en/products" } },
        docs: {
            description: {
                component: "The skip links only become visible when they receive focus.",
            },
        },
    },
    args: {
        data: navigationNodes,
    },
};

export default meta;
type Story = StoryObj<typeof TopNavigation>;

export const Default: Story = {};
