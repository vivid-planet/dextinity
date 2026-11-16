import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { MiniChart } from "../MiniChart";
import miniChartTokens from "../MiniChart.tokens.scss?raw";
import styles from "./MiniChart.stories.module.scss";

const changesPerDay = [4, 6, 3, 0, 5, 7, 4, 2, 0, 3, 6, 8, 5, 3, 7, 4, 0, 2, 6, 5, 9, 4, 3, 5, 7, 6, 2, 4, 8, 10];
const responseTimes = [320, 340, 310, 360, 330, 350, 420, 380, 340, 330, 320, 345, 335, 330];

const meta = {
    component: MiniChart,
    title: "Building blocks/Panels, cards & metrics/MiniChart",
    decorators: [
        (Story) => (
            <div className={styles.frame}>
                <Story />
            </div>
        ),
        themeDecorator,
    ],
    parameters: { tokens: miniChartTokens },
    args: {
        data: changesPerDay,
        "aria-label": "79 changes in 30 days",
    },
    argTypes: {
        variant: { control: "radio", options: ["bars", "line"] },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof MiniChart>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 30 days, today in the accent color.
 *
 * **Rules**
 *
 * - Give the chart an `aria-label` that summarizes it as a sentence.
 * - Don't add axes or a grid in a small space.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("img", { name: "79 changes in 30 days" })).toBeInTheDocument();
    },
};

export const WithLabels: Story = {
    args: { startLabel: "30 days ago", endLabel: "Today" },
};

/**
 * Only deviations stand out, e.g. days with failed publications.
 */
export const Highlighted: Story = {
    args: { highlighted: [5, 11, 20], highlightLast: false, "aria-label": "Publications in 30 days, 3 days with errors" },
};

/**
 * A continuous measure as a line.
 */
export const Line: Story = {
    args: {
        variant: "line",
        data: responseTimes,
        highlighted: [6],
        startLabel: "14 days ago",
        endLabel: "Today",
        "aria-label": "Response time between 310 and 420 ms over 14 days, now 330 ms",
    },
};
