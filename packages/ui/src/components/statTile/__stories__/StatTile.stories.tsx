import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { StatTile } from "../StatTile";
import statTileTokens from "../StatTile.tokens.scss?raw";
import styles from "./StatTile.stories.module.scss";

const contextOptions = {
    LastChange: <StatusIndicator status="published">last 12 min ago</StatusIndicator>,
    Comparison: "+12 compared with the previous 30 days",
    Warning: <StatusIndicator status="warning">3 above the limit</StatusIndicator>,
};

const meta = {
    component: StatTile,
    title: "Building blocks/Panels, cards & metrics/StatTile",
    decorators: [themeDecorator],
    parameters: { tokens: statTileTokens },
    args: {
        value: 79,
        label: "Changes live",
        context: contextOptions.LastChange,
    },
    argTypes: {
        trend: { control: "radio", options: ["up", "down", "flat"] },
        context: { control: "select", options: Object.keys(contextOptions), mapping: contextOptions },
        className: { control: false },
        slotProps: { control: false },
        labels: { control: false },
    },
} satisfies Meta<typeof StatTile>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Show metrics only with context: a period or a comparison.
 * - Don't show a metric without its unit.
 */
export const Default: Story = {};

/**
 * The unit is shown small after the value.
 */
export const WithUnit: Story = {
    args: { value: 340, unit: "ms", label: "Response time", context: "Median of the last 24 hours" },
};

/**
 * Show the trend only when the direction means something. It stays quiet; the context says whether it is good or bad.
 */
export const WithTrend: Story = {
    args: { value: 1240, label: "Visits", trend: "up", context: contextOptions.Comparison },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("img", { name: "Rising" })).toBeInTheDocument();
    },
};

/**
 * Only deviations stand out: the context carries the status.
 */
export const WithWarning: Story = {
    args: { value: 15, label: "Broken links", trend: "up", context: contextOptions.Warning },
};

/**
 * Several metrics side by side, e.g. in a panel on the overview.
 */
export const Row: Story = {
    render: (args) => (
        <div className={styles.row}>
            <StatTile {...args} />
            <StatTile value={23} label="Pages" context="3 unpublished · 1 archived" />
            <StatTile value={98} unit="%" label="Translated" trend="flat" context="Compared with last week" />
        </div>
    ),
};
