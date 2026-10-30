import type { Meta, StoryObj } from "@storybook/react-vite";

import { exampleSupportInfo } from "../exampleSupportInfo.js";
import { Mail } from "../Mail.js";

type Story = StoryObj<typeof Mail>;

const config: Meta = {
    title: "products/ProductPublishedMail",
    component: Mail,
    parameters: { mailRoot: false },
    argTypes: {
        countProductPublished: {
            control: "select",
            options: [1, 5, 10, "all"],
        },
    },
};

export default config;

export const Primary: Story = {
    args: {
        recipient: { name: "John Doe", email: "product-manager@dextinity.com", language: "en" },
        countProductPublished: 1,
        supportInfo: exampleSupportInfo,
    },
};
