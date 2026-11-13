import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { Link } from "../../link/Link";
import { Panel } from "../Panel";
import panelTokens from "../Panel.tokens.scss?raw";
import styles from "./Panel.stories.module.scss";

const actionOptions = {
    Link: (
        <Link href="#pages" endIcon={<Icon name="arrow" />}>
            Page tree
        </Link>
    ),
    IconButton: (
        <IconButton variant="text" color="secondary" aria-label="More actions" size="small">
            <Icon name="more" />
        </IconButton>
    ),
};

const meta = {
    component: Panel,
    title: "Building blocks/Panels, cards & metrics/Panel",
    decorators: [
        (Story) => (
            <div className={styles.field}>
                <Story />
            </div>
        ),
        themeDecorator,
    ],
    parameters: { tokens: panelTokens, layout: "fullscreen" },
    args: {
        title: "Selected",
        children: "Content",
    },
    argTypes: {
        variant: { control: "radio", options: ["glass", "solid"] },
        padding: { control: "radio", options: ["default", "none"] },
        actions: { control: "select", options: Object.keys(actionOptions), mapping: actionOptions },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Panel>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Glass over the light field. Groups one task.
 *
 * **Rules**
 *
 * - One panel per task, 18px (`--dextinity-space-panel-gap`) between panels.
 * - Don't put panels inside panels.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("region", { name: "Selected" })).toBeInTheDocument();
    },
};

export const WithDescription: Story = {
    args: { title: "Panel", description: "Glass over the light field. Groups one task." },
};

/**
 * Actions sit at the end of the header: a quiet link to the full view, or an icon button.
 */
export const WithActions: Story = {
    args: { title: "Recently edited", actions: actionOptions.Link },
};

/**
 * Over media and busy backgrounds, where glass would be hard to read.
 */
export const Solid: Story = {
    args: { variant: "solid" },
};

/**
 * Tables and lists reach the edges of the panel.
 */
export const NoPadding: Story = {
    args: {
        padding: "none",
        title: undefined,
        children: (
            <ul className={styles.rows}>
                <li>Row</li>
                <li>Row</li>
                <li>Row</li>
            </ul>
        ),
    },
};

/**
 * Panels stack with the panel gap between them.
 */
export const Stacked: Story = {
    render: (args) => (
        <div className={styles.stack}>
            <Panel {...args} title="Panel" description="Glass over the light field. Groups one task." />
            <Panel {...args} title="Card" description="On the overview: orb with a duotone icon, title, and a link." />
        </div>
    ),
};
