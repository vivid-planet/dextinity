import { ProductPriceBlock } from "@src/products/blocks/ProductPriceBlock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

const meta: Meta<typeof ProductPriceBlock> = {
    title: "Blocks/Products/ProductPriceBlock",
    component: ProductPriceBlock,
    args: {
        data: { productId: "product-1", product: { id: "product-1", title: "Product A", price: 49.9 } },
    },
};

export default meta;
type Story = StoryObj<typeof ProductPriceBlock>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByText("49.9 €")).toBeInTheDocument();
    },
};
