import { ProductTeaserBlock } from "@src/products/blocks/ProductTeaserBlock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ProductTeaserBlock> = {
    title: "Blocks/Products/ProductTeaserBlock",
    component: ProductTeaserBlock,
    parameters: {
        docs: {
            description: {
                component: "The block loader loads the selected product on the server. Stories pass the loaded product as `data.loaded`.",
            },
        },
    },
    args: {
        data: {
            productId: "product-1",
            loaded: { id: "product-1", title: "Product A", description: "A product to show the teaser.", price: 49.9 },
        },
    },
};

export default meta;
type Story = StoryObj<typeof ProductTeaserBlock>;

export const Default: Story = {};

export const WithoutDescriptionAndPrice: Story = {
    args: { data: { productId: "product-1", loaded: { id: "product-1", title: "Product A", description: null, price: null } } },
};
