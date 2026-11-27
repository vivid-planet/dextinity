import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { EnvironmentLabel } from "../EnvironmentLabel";
import environmentLabelTokens from "../EnvironmentLabel.tokens.scss?raw";
import styles from "./EnvironmentLabel.stories.module.scss";

const meta = {
    component: EnvironmentLabel,
    title: "Building blocks/Status, tags & badges/EnvironmentLabel",
    decorators: [themeDecorator],
    parameters: { tokens: environmentLabelTokens },
    args: {
        label: "Staging",
    },
    argTypes: {
        label: { control: "text" },
        color: { control: "select", options: ["info", "success", "warning", "error"] },
        variant: { control: "radio", options: ["default", "compact"] },
        className: { control: false },
    },
} satisfies Meta<typeof EnvironmentLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The instance an app runs on. Inside an `AppShell`, set its `environment` instead of placing the label yourself.
 *
 * **Rules**
 *
 * - No label on the live system.
 * - Name the instance short, as the team calls it.
 */
export const Default: Story = {};

/**
 * The warmer the color, the closer the instance is to the live system.
 */
export const Colors: Story = {
    render: (args) => (
        <span className={styles.row}>
            <EnvironmentLabel {...args} label="Dev" color="info" />
            <EnvironmentLabel {...args} label="Test" color="success" />
            <EnvironmentLabel {...args} label="Staging" color="warning" />
            <EnvironmentLabel {...args} label="Pre-live" color="error" />
        </span>
    ),
};

/**
 * `compact` shows only the first letter, e.g. on a collapsed navigation; the full name shows in a tooltip on hover and keyboard focus.
 */
export const Compact: Story = {
    args: { variant: "compact" },
    play: async ({ canvas }) => {
        const label = canvas.getByText("Staging").parentElement;
        await userEvent.tab();
        await expect(label).toHaveFocus();
        await expect(await screen.findByRole("tooltip")).toHaveTextContent("Staging");
    },
};
