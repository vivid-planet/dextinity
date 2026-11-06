import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Avatar } from "../../avatar/Avatar";
import { Icon } from "../../icon/Icon";
import { Link } from "../../link/Link";
import { Card } from "../Card";
import cardTokens from "../Card.tokens.scss?raw";
import styles from "./Card.stories.module.scss";

const iconOptions = {
    Recent: <Icon name="time" duotone />,
    Page: <Icon name="file" duotone />,
    Live: <Icon name="online" duotone />,
};

const linkOptions = {
    PageTree: (
        <Link href="#page-tree" endIcon={<Icon name="arrow-right" />}>
            Page tree
        </Link>
    ),
};

function RecentRow() {
    return (
        <a className={styles.row} href="#open-positions">
            <div>
                <div className={styles.rowTitle}>Open positions</div>
                <div className={styles.rowPath}>/careers/open-positions</div>
            </div>
            <div className={styles.rowMeta}>
                <Avatar name="Anna Klein" size="small" />
                12 min ago
            </div>
            <Icon name="arrow-right" size="small" className={styles.rowGo} />
        </a>
    );
}

const meta = {
    component: Card,
    title: "Building blocks/Panels, cards & metrics/Card",
    decorators: [
        (Story) => (
            <div className={styles.field}>
                <Story />
            </div>
        ),
        themeDecorator,
    ],
    parameters: { tokens: cardTokens, layout: "fullscreen" },
    args: {
        title: "Recently edited",
        children: <RecentRow />,
        className: styles.card,
    },
    argTypes: {
        icon: { control: "select", options: Object.keys(iconOptions), mapping: iconOptions },
        link: { control: "select", options: Object.keys(linkOptions), mapping: linkOptions },
        children: { control: false },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Show an excerpt and link to the full view; the card is not the full list.
 * - One card per topic on the overview.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("region", { name: "Recently edited" })).toBeInTheDocument();
    },
};

/**
 * As on the overview: a duotone icon in the orb and a link to the full view.
 */
export const WithIconAndLink: Story = {
    args: { icon: iconOptions.Recent, link: linkOptions.PageTree },
};

/**
 * `meta` adds context after the title, e.g. the period.
 */
export const WithMeta: Story = {
    args: { icon: iconOptions.Live, title: "Changes", meta: "30 days", link: linkOptions.PageTree },
};
