import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Typography } from "../Typography";

const meta = {
    component: Typography,
    title: "Foundations/Typography",
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

/**
 * 72 / 1.02 · display font — the greeting on an overview.
 */
export const DisplayXl: Story = {
    args: {
        variant: "displayXl",
    },
};

/**
 * 54 / 1.02 · display font — the page title, one per view.
 */
export const DisplayL: Story = {
    args: {
        variant: "displayL",
    },
};

/**
 * 17 / 1.3 · 500 — panel and card titles.
 */
export const Title: Story = {
    args: {
        variant: "title",
    },
};

/**
 * 15 / 1.35 · 550 — sections in forms.
 */
export const Section: Story = {
    args: {
        variant: "section",
    },
};

/**
 * 12.5 / 1.4 — help texts and metadata.
 */
export const Small: Story = {
    args: {
        variant: "small",
    },
};

/**
 * 10.5 · mono · uppercase — groups, sections, markers.
 */
export const Label: Story = {
    args: {
        variant: "label",
    },
};

/**
 * 12 · mono — paths, IDs, shortcuts.
 */
export const Mono: Story = {
    args: {
        variant: "mono",
    },
};
