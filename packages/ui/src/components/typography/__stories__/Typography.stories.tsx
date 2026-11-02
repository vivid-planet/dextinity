import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Typography } from "../Typography";

const meta = {
    component: Typography,
    title: "Components/Typography",
    decorators: [themeDecorator],
    args: {
        children: "The quick brown fox jumps over the lazy dog",
    },
    argTypes: {
        variant: {
            control: "select",
            options: [
                "display",
                "h1",
                "h2",
                "h3",
                "h4",
                "bodyL",
                "bodyM",
                "bodyS",
                "bodyXs",
                "caption",
                "labelM",
                "labelS",
                "labelXs",
                "dataM",
                "dataS",
            ],
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

export const Display: Story = {
    args: {
        variant: "display",
    },
};

export const H1: Story = {
    args: {
        variant: "h1",
    },
};

export const H2: Story = {
    args: {
        variant: "h2",
    },
};

export const H3: Story = {
    args: {
        variant: "h3",
    },
};

export const H4: Story = {
    args: {
        variant: "h4",
    },
};

export const BodyL: Story = {
    args: {
        variant: "bodyL",
    },
};

export const BodyS: Story = {
    args: {
        variant: "bodyS",
    },
};

export const BodyXs: Story = {
    args: {
        variant: "bodyXs",
    },
};

export const Caption: Story = {
    args: {
        variant: "caption",
    },
};

export const LabelM: Story = {
    args: {
        variant: "labelM",
    },
};

export const LabelS: Story = {
    args: {
        variant: "labelS",
    },
};

export const LabelXs: Story = {
    args: {
        variant: "labelXs",
    },
};

export const DataM: Story = {
    args: {
        variant: "dataM",
    },
};

export const DataS: Story = {
    args: {
        variant: "dataS",
    },
};

/**
 * Each variant maps to a default semantic element (`h2` for `h2`, `p` for
 * `bodyM`). `element` overrides it when visual level and document outline
 * disagree — for example, an `h2` rendered as an `h1`.
 */
export const WithCustomElement: Story = {
    args: {
        variant: "h2",
        element: "h1",
        children: "Visually h2, semantically h1",
    },
};

/**
 * `render` replaces the root element while keeping Typography's styling. Here a
 * `labelS` renders as a `<label>`, with `htmlFor` typed natively.
 */
export const WithRender: Story = {
    args: {
        variant: "labelS",
        render: <label htmlFor="email" />,
        children: "Email",
    },
};
