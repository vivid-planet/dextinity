import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import typographyTokens from "../../../theme/_typography.scss?raw";
import { Typography } from "../Typography";
import styles from "./Typography.stories.module.scss";

const meta = {
    component: Typography,
    title: "Foundations/Typography",
    decorators: [themeDecorator],
    parameters: {
        docs: { description: { component: "Type styles with size, weight and usage. Font families come from the brand." } },
        tokens: typographyTokens,
        rules: {
            do: ["Exactly one display title per view.", "Tabular figures for numbers in tables.", "Short labels, in mono and uppercase."],
            dont: ["Text smaller than 12px.", "Bold and color at the same time for emphasis.", "Long paragraphs in uppercase."],
        },
    },
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

const typeStyles = [
    { variant: "displayXl", name: "Display XL", sample: "Good morning, Max", metrics: "72 / 1.02 · Display", usage: "Greeting on the overview" },
    { variant: "displayL", name: "Display L", sample: "Job postings", metrics: "54 / 1.02 · Display", usage: "Page title" },
    { variant: "title", name: "Title", sample: "Recently edited", metrics: "17 / 1.3 · 500", usage: "Panel and card titles" },
    { variant: "section", name: "Section", sample: "Basics", metrics: "15 / 1.35 · 550", usage: "Sections in forms" },
    {
        variant: "body",
        name: "Body",
        sample: "We build digital products that stay in use for many years.",
        metrics: "14 / 1.45 · 400",
        usage: "Default for UI and tables",
    },
    {
        variant: "small",
        name: "Small",
        sample: "Use gender-inclusive wording, e.g. with a colon.",
        metrics: "12.5 / 1.4 · 400",
        usage: "Help texts, metadata",
    },
    { variant: "label", name: "Label", sample: "Structured content", metrics: "10.5 · Mono · Uppercase", usage: "Groups, sections, markers" },
    { variant: "mono", name: "Mono", sample: "/careers/open-positions", metrics: "12 · Mono", usage: "Paths, IDs, shortcuts" },
] as const;

/**
 * Hierarchy comes from size and weight, not color.
 */
export const TypeStyles: Story = {
    name: "Type styles",
    render: () => (
        <div className={styles.specimen}>
            {typeStyles.map(({ variant, name, sample, metrics, usage }) => (
                <div key={variant} className={styles.row}>
                    <div className={styles.sample}>
                        <Typography variant={variant} element="span">
                            {sample}
                        </Typography>
                    </div>
                    <div className={styles.meta}>
                        <Typography variant="section" element="span">
                            {name}
                        </Typography>
                        <Typography variant="mono" element="span">
                            {metrics}
                        </Typography>
                        <Typography variant="small" element="span">
                            {usage}
                        </Typography>
                    </div>
                </div>
            ))}
        </div>
    ),
};
