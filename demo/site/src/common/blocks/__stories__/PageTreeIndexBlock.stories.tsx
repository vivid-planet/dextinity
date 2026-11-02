import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageTreeIndexBlock } from "../PageTreeIndexBlock";
import type { LoadedData } from "../PageTreeIndexBlock.loader";

const scope = { domain: "main", language: "en" };

const pageTreeNodes: LoadedData = [
    { id: "home", parentId: null, name: "Home", path: "/", scope },
    { id: "products", parentId: null, name: "Products", path: "/products", scope },
    { id: "product-a", parentId: "products", name: "Product A", path: "/products/product-a", scope },
    { id: "product-b", parentId: "products", name: "Product B", path: "/products/product-b", scope },
    { id: "about-us", parentId: null, name: "About us", path: "/about-us", scope },
    { id: "team", parentId: "about-us", name: "Team", path: "/about-us/team", scope },
];

const meta: Meta<typeof PageTreeIndexBlock> = {
    title: "Blocks/Common/PageTreeIndexBlock",
    component: PageTreeIndexBlock,
    parameters: {
        docs: {
            description: {
                component: "The block loader loads the page tree on the server. Stories pass the loaded nodes as `data.loaded`.",
            },
        },
    },
    args: {
        data: { loaded: pageTreeNodes },
    },
};

export default meta;
type Story = StoryObj<typeof PageTreeIndexBlock>;

export const Default: Story = {};
