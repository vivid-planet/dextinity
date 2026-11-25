import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Avatar } from "../../avatar/Avatar";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { Link } from "../../link/Link";
import { Menu } from "../../menu/Menu";
import { MenuItem } from "../../menu/MenuItem";
import { MenuRadioGroup } from "../../menu/MenuRadioGroup";
import { MenuRadioItem } from "../../menu/MenuRadioItem";
import { Card } from "../Card";
import styles from "./Card.stories.module.scss";

function PeriodMenu() {
    const [open, setOpen] = useState(false);
    const [period, setPeriod] = useState("7");

    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <Button variant="text" color="secondary" size="small" endIcon={<Icon name="chevron-down" />}>
                    {period === "7" ? "Last 7 days" : "Last 30 days"}
                </Button>
            }
        >
            <MenuRadioGroup aria-label="Period" value={period} onChange={setPeriod}>
                <MenuRadioItem value="7" label="Last 7 days" />
                <MenuRadioItem value="30" label="Last 30 days" />
            </MenuRadioGroup>
        </Menu>
    );
}

function MoreMenu() {
    const [open, setOpen] = useState(false);

    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <IconButton variant="outlined" color="secondary" size="small" aria-label="More actions">
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <MenuItem label="Open page tree" icon={<Icon name="page-tree" />} />
            <MenuItem label="Hide card" icon={<Icon name="eye-off" />} />
        </Menu>
    );
}

const actionsOptions = {
    Toolbar: (
        <>
            <PeriodMenu />
            <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="plus" />}>
                New page
            </Button>
            <MoreMenu />
        </>
    ),
    Link: (
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
    parameters: { layout: "fullscreen" },
    args: {
        title: "Recently edited",
        children: <RecentRow />,
        className: styles.card,
    },
    argTypes: {
        meta: { control: "text" },
        actions: { control: "select", options: Object.keys(actionsOptions), mapping: actionsOptions },
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
 * - Order the actions: filter, own action, then the menu with everything else as an outlined icon button.
 * - No icon before the title; the title and the content say what the card is about.
 * - One card per topic on the overview.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("region", { name: "Recently edited" })).toBeInTheDocument();
    },
};

/**
 * `meta` adds context after the title, e.g. the number of entries.
 */
export const WithMeta: Story = {
    args: { meta: "12 pages" },
};

/**
 * `actions` at the end of the header: a filter such as the period, the card's own action, then an outlined menu button with the
 * remaining actions.
 */
export const WithActions: Story = {
    args: { meta: "12 pages", actions: actionsOptions.Toolbar },
};

/**
 * A link to the full view in place of the menu, when the card has no actions of its own.
 */
export const WithLink: Story = {
    args: { actions: actionsOptions.Link },
};
