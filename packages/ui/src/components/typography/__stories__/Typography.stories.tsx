import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Typography } from "../Typography";
import styles from "./Typography.stories.module.scss";

const fontTokens = `
// UI and body text; from the brand
--dextinity-font-family-text: var(--dextinity-brand-font-family-text);
// Headings and display styles; from the brand
--dextinity-font-family-display: var(--dextinity-brand-font-family-display);
// Labels, paths, numbers; from the brand
--dextinity-font-family-mono: var(--dextinity-brand-font-family-mono);
// Weight of the display styles
--dextinity-typography-display-font-weight: var(--dextinity-brand-display-font-weight);
// Tracking of the display styles
--dextinity-typography-display-letter-spacing: var(--dextinity-brand-display-letter-spacing);
`;

const meta = {
    component: Typography,
    title: "Foundations/Typography",
    decorators: [themeDecorator],
    parameters: { tokens: fontTokens },
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
 * 15 / 1.35 · 600 — sections in forms.
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

const specimen = [
    { variant: "displayXl", sample: "Good morning, Max", metrics: "72 / 1.02 · display", usage: "Greeting on an overview" },
    { variant: "displayL", sample: "Job postings", metrics: "54 / 1.02 · display", usage: "Page title" },
    { variant: "title", sample: "Recently edited", metrics: "17 / 1.3 · 500", usage: "Panel and card titles" },
    { variant: "section", sample: "General", metrics: "15 / 1.35 · 600", usage: "Sections in forms" },
    {
        variant: "body",
        sample: "We build digital products that stay in use for many years.",
        metrics: "14 / 1.45 · 400",
        usage: "Default for UI and tables",
    },
    { variant: "small", sample: "Use inclusive language.", metrics: "12.5 / 1.4 · 400", usage: "Help texts, metadata" },
    { variant: "label", sample: "Structured content", metrics: "10.5 · mono · uppercase", usage: "Groups, sections, markers" },
    { variant: "mono", sample: "/careers/open-positions", metrics: "12 · mono", usage: "Paths, IDs, shortcuts" },
] as const;

/**
 * All styles with their metrics and use. Hierarchy comes from size and weight, not color; font families come from the brand.
 *
 * **Rules**
 *
 * - Do: exactly one display title per view.
 * - Do: tabular figures for numbers in tables.
 * - Do: short labels, in mono and uppercase.
 * - Don't: text smaller than 12px.
 * - Don't: bold and color at the same time for emphasis.
 * - Don't: long paragraphs in uppercase.
 */
export const Specimen: Story = {
    render: () => (
        <div className={styles.specimen}>
            {specimen.map(({ variant, sample, metrics, usage }) => (
                <div key={variant} className={styles.row}>
                    <div className={styles.sample}>
                        <Typography variant={variant} element="span">
                            {sample}
                        </Typography>
                    </div>
                    <div className={styles.meta}>
                        <Typography variant="section" element="span">
                            {variant}
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
