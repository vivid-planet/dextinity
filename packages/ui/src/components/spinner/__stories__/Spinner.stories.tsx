import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Spinner } from "../Spinner";

const meta = {
    component: Spinner,
    title: "Components/Spinner",
    decorators: [themeDecorator],
    args: {
        "aria-label": "Loading",
    },
    argTypes: {
        size: {
            control: "radio",
            options: ["md", "lg", "xl"],
        },
        className: { control: false },
        ref: { control: false },
    },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
    args: {
        size: "lg",
    },
};

export const ExtraLarge: Story = {
    args: {
        size: "xl",
    },
};
