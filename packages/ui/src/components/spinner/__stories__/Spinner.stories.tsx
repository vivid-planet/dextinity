import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Spinner } from "../Spinner";
import tokens from "../Spinner.tokens.scss?raw";

const meta = {
    component: Spinner,
    title: "Building blocks/Spinner",
    parameters: {
        tokens,
        rules: {
            dos: ["Show nothing for the first 300 ms.", "Only in place, such as in a button or a field.", "Set `aria-busy` on the area that loads."],
            donts: ["Loading overlays over the whole page.", "Progress percentages that aren't accurate."],
        },
    },
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
