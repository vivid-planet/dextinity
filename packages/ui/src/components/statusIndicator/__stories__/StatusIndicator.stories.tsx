import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import statusIndicatorTokens from "../_tokens.scss?raw";
import { StatusIndicator, type StatusIndicatorStatus } from "../StatusIndicator";
import styles from "./StatusIndicator.stories.module.scss";

const statuses: StatusIndicatorStatus[] = ["published", "unpublished", "archived", "warning", "critical", "info", "running"];

const meta = {
    component: StatusIndicator,
    title: "Building blocks/Status, tags & badges/StatusIndicator",
    decorators: [themeDecorator],
    parameters: { tokens: statusIndicatorTokens },
    args: {
        status: "published",
    },
    argTypes: {
        status: {
            control: "select",
            options: statuses,
        },
        children: { control: "text" },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof StatusIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Use the system's status words: Published, Unpublished, Archived.
 * - Never show a status as a colored dot alone.
 */
export const Default: Story = {};

/**
 * The usual state stays quiet; only deviations stand out. In high contrast, critical gets an exclamation mark.
 */
export const AllStatuses: Story = {
    render: (args) => (
        <div className={styles.list}>
            {statuses.map((status) => (
                <StatusIndicator key={status} {...args} status={status} />
            ))}
        </div>
    ),
};

export const Unpublished: Story = {
    args: {
        status: "unpublished",
    },
};

/**
 * A hollow ring: archived content is out of use.
 */
export const Archived: Story = {
    args: {
        status: "archived",
    },
};

export const Warning: Story = {
    args: {
        status: "warning",
    },
};

export const Critical: Story = {
    args: {
        status: "critical",
    },
};

export const Info: Story = {
    args: {
        status: "info",
    },
};

/**
 * The dot pulses while a job runs, and stays still with reduced motion.
 */
export const Running: Story = {
    args: {
        status: "running",
    },
};

/**
 * `children` replaces the system word, e.g. "Active" for redirects.
 */
export const CustomText: Story = {
    args: {
        status: "published",
        children: "Active",
    },
};

/**
 * `labels` sets the system words, e.g. in the application's language.
 */
export const TranslatedLabels: Story = {
    args: {
        labels: {
            published: "Veröffentlicht",
            unpublished: "Unveröffentlicht",
            archived: "Archiviert",
            warning: "Warnung",
            critical: "Kritisch",
            info: "Hinweis",
            running: "Läuft",
        },
    },
    render: AllStatuses.render,
};

/**
 * Only in dense lists: the text becomes the dot's tooltip and accessible name.
 */
export const DotOnly: Story = {
    args: {
        status: "warning",
        dotOnly: true,
    },
    play: async ({ canvas }) => {
        const dot = canvas.getByRole("img", { name: "Warning" });
        await userEvent.hover(dot);
        await expect(await screen.findByRole("tooltip")).toHaveTextContent("Warning");
    },
};
