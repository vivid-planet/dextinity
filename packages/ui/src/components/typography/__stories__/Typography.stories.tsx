import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Typography } from "../Typography";

const meta = {
    component: Typography,
    title: "Future UI/Typography",
    decorators: [themeDecorator],
    args: {
        children: "The quick brown fox jumps over the lazy dog",
    },
    argTypes: {
        variant: {
            control: "radio",
            options: ["headline", "body"],
        },
        element: {
            control: "select",
            options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span"],
        },
        className: { control: false },
        ref: { control: false },
        render: { control: false },
    },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Headline: Story = {
    args: {
        variant: "headline",
        children: "Headline",
    },
};

/**
 * Each variant maps to a default semantic element (`h2` for `headline`, `p`
 * for `body`). `element` overrides it when visual level and document outline
 * disagree — for example, a `headline` rendered as an `h1`.
 */
export const WithCustomElement: Story = {
    args: {
        variant: "headline",
        element: "h1",
        children: "Visually headline, semantically h1",
    },
};

/**
 * `render` replaces the root element while keeping Typography's styling. Here a
 * `headline` renders as a `<label>`, with `htmlFor` typed natively.
 */
export const WithRender: Story = {
    args: {
        variant: "headline",
        render: <label htmlFor="email" />,
        children: "Email",
    },
};
