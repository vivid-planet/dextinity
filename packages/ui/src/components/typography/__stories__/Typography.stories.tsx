import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import tokens from "../../../theme/_typography.scss?raw";
import { Typography } from "../Typography";

const meta = {
    component: Typography,
    title: "Foundations/Typography",
    parameters: {
        tokens,
        rules: {
            dos: [
                "Exactly one display title per view.",
                "Tabular figures for numbers in tables.",
                "Hierarchy through size and weight, not color.",
                "Labels short, monospaced, and in capitals.",
            ],
            donts: ["Text smaller than 12 px, except for labels.", "Bold and color at the same time for emphasis.", "Long paragraphs in capitals."],
        },
    },
    decorators: [themeDecorator],
    args: {
        children: "The quick brown fox jumps over the lazy dog",
    },
    argTypes: {
        variant: {
            control: "select",
            options: ["displayXl", "displayL", "title", "section", "body", "small", "label", "mono"],
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

export const DisplayXl: Story = {
    args: {
        variant: "displayXl",
        children: "Good morning, Max",
    },
};

export const DisplayL: Story = {
    args: {
        variant: "displayL",
        children: "Job ads",
    },
};

export const Title: Story = {
    args: {
        variant: "title",
        children: "Recently edited",
    },
};

export const Section: Story = {
    args: {
        variant: "section",
        children: "Basic data",
    },
};

export const Small: Story = {
    args: {
        variant: "small",
        children: "Use gender-inclusive wording.",
    },
};

export const Label: Story = {
    args: {
        variant: "label",
        children: "Structured content",
    },
};

export const Mono: Story = {
    args: {
        variant: "mono",
        children: "/careers/open-positions",
    },
};

/**
 * Each variant maps to a default semantic element (`h2` for `title`, `p` for `body`). `element` overrides it when the visual
 * style and the document outline disagree — for example, a `title` that is the only heading of a dialog.
 */
export const WithCustomElement: Story = {
    args: {
        variant: "title",
        element: "h1",
        children: "Visually a title, semantically h1",
    },
};

/**
 * `render` replaces the root element while keeping Typography's styling. Here a `small` renders as a `<label>`, with `htmlFor`
 * typed natively.
 */
export const WithRender: Story = {
    args: {
        variant: "small",
        render: <label htmlFor="email" />,
        children: "Email",
    },
};
