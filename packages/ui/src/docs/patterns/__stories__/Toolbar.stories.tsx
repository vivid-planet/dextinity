import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../../components/button/Button";
import { Icon } from "../../../components/icon/Icon";
import { IconButton } from "../../../components/iconButton/IconButton";
import { Typography } from "../../../components/typography/Typography";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./toolbar.module.scss";

const meta = {
    title: "Patterns/Toolbar",
    tags: ["!dev", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <div className={styles.toolbar}>
            <nav aria-label="Breadcrumb">
                <ol className={styles.breadcrumb}>
                    <li>
                        <Typography variant="small" render={<a href="#" className={styles.breadcrumbLink} />}>
                            Campaigns
                        </Typography>
                    </li>
                    <li aria-hidden className={styles.breadcrumbSeparator}>
                        <Icon name="chevron-right" />
                    </li>
                    <li>
                        <Typography variant="small" aria-current="page" className={styles.breadcrumbCurrent}>
                            All campaigns
                        </Typography>
                    </li>
                </ol>
            </nav>
            <div className={styles.titleRow}>
                <div className={styles.titleGroup}>
                    <Typography variant="displayL">Campaigns</Typography>
                </div>
                <div className={styles.actions}>
                    <Button variant="secondary">Filter</Button>
                    <Button>Export</Button>
                </div>
                <IconButton aria-label="More actions" className={styles.moreActions}>
                    <Icon name="more-vertical" />
                </IconButton>
            </div>
        </div>
    ),
};

export const DetailPage: Story = {
    render: () => (
        <div className={styles.toolbar}>
            <nav aria-label="Breadcrumb">
                <ol className={styles.breadcrumb}>
                    <li>
                        <Typography variant="small" render={<a href="#" className={styles.breadcrumbLink} />}>
                            Campaigns
                        </Typography>
                    </li>
                    <li aria-hidden className={styles.breadcrumbSeparator}>
                        <Icon name="chevron-right" />
                    </li>
                    <li>
                        <Typography variant="small" aria-current="page" className={styles.breadcrumbCurrent}>
                            Spring campaign 2027
                        </Typography>
                    </li>
                </ol>
            </nav>
            <div className={styles.titleRow}>
                <IconButton aria-label="Back">
                    <Icon name="arrow-left" />
                </IconButton>
                <div className={styles.titleGroup}>
                    <div className={styles.titleLine}>
                        <Typography variant="displayL">Spring campaign 2027</Typography>
                        <IconButton size="small" aria-label="More information">
                            <Icon name="info-filled" />
                        </IconButton>
                    </div>
                    <Typography variant="small" className={styles.supportText}>
                        Last edited on October 12, 2026 by Maria Muster
                    </Typography>
                </div>
                <div className={styles.actions}>
                    <Button variant="secondary">Filter</Button>
                    <Button>Export</Button>
                </div>
                <IconButton aria-label="More actions" className={styles.moreActions}>
                    <Icon name="more-vertical" />
                </IconButton>
            </div>
        </div>
    ),
};

export const TitleOnly: Story = {
    render: () => (
        <div className={styles.toolbar}>
            <div className={styles.titleRow}>
                <Typography variant="displayL">Settings</Typography>
            </div>
        </div>
    ),
};

export const SmallScreen: Story = {
    render: () => (
        <div className={styles.narrow}>
            <div className={styles.toolbar}>
                <nav aria-label="Breadcrumb">
                    <ol className={styles.breadcrumb}>
                        <li>
                            <Typography variant="small" render={<a href="#" className={styles.breadcrumbLink} />}>
                                Campaigns
                            </Typography>
                        </li>
                        <li aria-hidden className={styles.breadcrumbSeparator}>
                            <Icon name="chevron-right" />
                        </li>
                        <li>
                            <Typography variant="small" aria-current="page" className={styles.breadcrumbCurrent}>
                                All campaigns
                            </Typography>
                        </li>
                    </ol>
                </nav>
                <div className={styles.titleRow}>
                    <div className={styles.titleGroup}>
                        <Typography variant="displayL">Campaigns</Typography>
                    </div>
                    <div className={styles.actions}>
                        <Button variant="secondary">Filter</Button>
                        <Button>Export</Button>
                    </div>
                    <IconButton aria-label="More actions" className={styles.moreActions}>
                        <Icon name="more-vertical" />
                    </IconButton>
                </div>
            </div>
        </div>
    ),
};
