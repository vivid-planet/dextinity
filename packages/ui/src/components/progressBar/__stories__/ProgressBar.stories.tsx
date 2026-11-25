import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { ProgressBar } from "../ProgressBar";
import progressBarTokens from "../ProgressBar.tokens.scss?raw";
import styles from "./ProgressBar.stories.module.scss";

const meta = {
    component: ProgressBar,
    title: "Building blocks/Loading & save state/ProgressBar",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.container}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: progressBarTokens },
    args: { value: 42, "aria-label": "Upload" },
    argTypes: {
        value: { control: { type: "range", min: 0, max: 100 } },
        color: { control: "select", options: ["accent", "success", "warning", "error"] },
        size: { control: "radio", options: ["default", "small"] },
        showValue: { control: "boolean" },
        label: { control: "text" },
        format: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 * - Show a value whenever it is known; move without one only while it isn't.
 * - Name what is in progress, visibly with `label` or with `aria-label`.
 */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("progressbar", { name: "Upload" })).toHaveAttribute("aria-valuenow", "42");
    },
};

/**
 * A visible label and the value as a percentage.
 */
export const LabelAndValue: Story = {
    args: { label: "Importing 1,240 redirects", showValue: true, "aria-label": undefined },
};

/**
 * While the value is unknown, e.g. before the server reports progress, the bar moves without one.
 */
export const Indeterminate: Story = {
    args: { value: null, label: "Preparing export", "aria-label": undefined },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("progressbar", { name: "Preparing export" })).not.toHaveAttribute("aria-valuenow");
    },
};

/**
 * `success` once a task finished, `warning` and `error` when it ran into problems.
 */
export const Colors: Story = {
    render: (args) => (
        <div className={styles.stack}>
            <ProgressBar {...args} label="Accent" aria-label={undefined} color="accent" />
            <ProgressBar {...args} label="Success" aria-label={undefined} color="success" value={100} />
            <ProgressBar {...args} label="Warning" aria-label={undefined} color="warning" value={76} />
            <ProgressBar {...args} label="Error" aria-label={undefined} color="error" value={18} />
        </div>
    ),
};

/**
 * A thinner bar inside rows and lists.
 */
export const Small: Story = {
    args: { size: "small" },
};
