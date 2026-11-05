import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import spinnerTokens from "../_tokens.scss?raw";
import { Spinner } from "../Spinner";

const meta = {
    component: Spinner,
    title: "Building blocks/Loading & save state/Spinner",
    decorators: [themeDecorator],
    parameters: { tokens: spinnerTokens },
    args: {
        "aria-label": "Loading",
    },
    argTypes: {
        size: {
            control: "radio",
            options: ["small", "md", "lg", "xl"],
        },
        className: { control: false },
        ref: { control: false },
    },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Only in place, e.g. in the button or field that started the action. Never as a full-screen overlay.
 * - Show nothing for the first 300 ms; most actions are faster.
 * - When content is on its way, show a `Skeleton` in its shape instead.
 */
export const Default: Story = {};

/**
 * In dense places, e.g. a small button or a field.
 */
export const Small: Story = {
    args: {
        size: "small",
    },
};

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
