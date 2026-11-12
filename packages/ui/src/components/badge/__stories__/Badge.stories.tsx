import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Typography } from "../../typography/Typography";
import { Badge } from "../Badge";
import badgeTokens from "../Badge.tokens.scss?raw";
import styles from "./Badge.stories.module.scss";

const meta = {
    component: Badge,
    title: "Building blocks/Status, tags & badges/Badge",
    decorators: [themeDecorator],
    parameters: { tokens: badgeTokens },
    args: {
        variant: "warning",
        tooltip: "Alt text missing",
    },
    argTypes: {
        variant: {
            control: "select",
            options: ["warning", "count", "dot"],
        },
        children: { control: "text" },
        className: { control: false },
    },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A problem on the element, e.g. a missing alt text. The tooltip names it and shows on hover and keyboard focus.
 *
 * **Rules**
 *
 * - Badges only for real exceptions.
 * - At most one badge per element.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("img", { name: "Alt text missing" })).toHaveFocus();
        await expect(await screen.findByRole("tooltip")).toHaveTextContent("Alt text missing");
    },
};

/**
 * A number of items, e.g. open issues on a tab.
 */
export const Count: Story = {
    args: {
        variant: "count",
        children: 1,
        tooltip: undefined,
    },
    render: (args) => (
        <span className={styles.row}>
            <Typography variant="body">SEO</Typography>
            <Badge {...args} />
        </span>
    ),
};

/**
 * Something new or changed. The tooltip says what.
 */
export const Dot: Story = {
    args: {
        variant: "dot",
        tooltip: "Unsaved changes",
    },
};
