import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Avatar } from "../../avatar/Avatar";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { Card } from "../Card";
import cardTokens from "../Card.tokens.scss?raw";
import { CardRow } from "../CardRow";
import styles from "./Card.stories.module.scss";

const endOptions = {
    Editor: (
        <>
            <Avatar name="Anna Klein" size="small" />
            12 min ago
        </>
    ),
    Status: <StatusIndicator status="critical">Critical</StatusIndicator>,
};

const meta = {
    component: CardRow,
    title: "Building blocks/Panels, cards & metrics/CardRow",
    decorators: [
        (Story) => (
            <div className={styles.field}>
                <Card title="Recently edited" className={styles.card}>
                    <Story />
                </Card>
            </div>
        ),
        themeDecorator,
    ],
    parameters: { tokens: cardTokens, layout: "fullscreen" },
    args: {
        title: "Open positions",
        href: "#open-positions",
    },
    argTypes: {
        title: { control: "text" },
        subtitle: { control: "text" },
        end: { control: "select", options: Object.keys(endOptions), mapping: endOptions },
        className: { control: false },
        slotProps: { control: false },
        render: { control: false },
    },
} satisfies Meta<typeof CardRow>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Each row leads to the entry's full view.
 * - Keep the end short: a status, an avatar, or a time.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("link", { name: "Open positions" })).toHaveAttribute("href", "#open-positions");
    },
};

/**
 * `subtitle` adds a line with context, e.g. the path.
 */
export const WithSubtitle: Story = {
    args: { subtitle: "/careers/open-positions" },
};

/**
 * `end` shows who changed the entry and when.
 */
export const WithEditor: Story = {
    args: { subtitle: "/careers/open-positions", end: endOptions.Editor },
};

/**
 * `end` shows the status of a warning.
 */
export const WithStatus: Story = {
    args: { title: "Broken link on “Apply now”", subtitle: "Senior UX Designer · Page", end: endOptions.Status },
};

/**
 * `render` turns the row into a button when the destination is resolved on click, e.g. the source of a warning.
 */
export const AsButton: Story = {
    args: { href: undefined, render: <button type="button" />, onClick: fn(), subtitle: "About us · Image" },
    play: async ({ canvas, args, userEvent }) => {
        await userEvent.click(canvas.getByRole("button", { name: /Open positions/ }));
        await expect(args.onClick).toHaveBeenCalled();
    },
};
