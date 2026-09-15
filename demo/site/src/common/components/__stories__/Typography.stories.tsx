import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Typography, type TypographyVariant } from "../Typography";

const variants = [
    "headline600",
    "headline550",
    "headline500",
    "headline450",
    "headline400",
    "headline350",
    "eyebrow600",
    "eyebrow550",
    "eyebrow500",
    "eyebrow450",
    "paragraph300",
    "paragraph200",
    "list300",
    "list200",
] satisfies TypographyVariant[];

const meta: Meta<typeof Typography> = {
    title: "Components/Typography",
    component: Typography,
    argTypes: {
        variant: {
            control: "select",
            options: variants,
        },
        bottomSpacing: { control: "boolean" },
    },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Headline600: Story = {
    args: {
        variant: "headline600",
        children: "Headline 600",
    },
};

export const Headline500: Story = {
    args: {
        variant: "headline500",
        children: "Headline 500",
    },
};

export const Eyebrow500: Story = {
    args: {
        variant: "eyebrow500",
        children: "Eyebrow 500",
    },
};

export const Paragraph300: Story = {
    args: {
        variant: "paragraph300",
        children: "This is a paragraph with variant 300. It demonstrates the default text style used throughout the site.",
    },
};

export const AllVariants: Story = {
    render: () => (
        <>
            {variants.map((variant) => (
                <Typography key={variant} variant={variant} bottomSpacing>
                    {variant}
                </Typography>
            ))}
        </>
    ),
};
