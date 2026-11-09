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
                        <Typography variant="bodyS" render={<a href="#" className={styles.breadcrumbLink} />}>
                            Campaigns
                        </Typography>
                    </li>
                    <li aria-hidden className={styles.breadcrumbSeparator}>
                        <Icon name="chevron-right" />
                    </li>
                    <li>
                        <Typography variant="labelS" aria-current="page">
                            All campaigns
                        </Typography>
                    </li>
                </ol>
            </nav>
            <div className={styles.titleRow}>
                <div className={styles.titleGroup}>
                    <Typography variant="h3" element="h1">
                        Campaigns
                    </Typography>
                </div>
                <div className={styles.actions}>
                    <Button variant="outlined">Filter</Button>
                    <Button>Export</Button>
                </div>
                <IconButton variant="text" color="secondary" aria-label="More actions" className={styles.moreActions}>
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
                        <Typography variant="bodyS" render={<a href="#" className={styles.breadcrumbLink} />}>
                            Campaigns
                        </Typography>
                    </li>
                    <li aria-hidden className={styles.breadcrumbSeparator}>
                        <Icon name="chevron-right" />
                    </li>
                    <li>
                        <Typography variant="labelS" aria-current="page">
                            Spring campaign 2027
                        </Typography>
                    </li>
                </ol>
            </nav>
            <div className={styles.titleRow}>
                <IconButton variant="text" color="secondary" aria-label="Back">
                    <Icon name="arrow-left" />
                </IconButton>
                <div className={styles.titleGroup}>
                    <div className={styles.titleLine}>
                        <Typography variant="h3" element="h1">
                            Spring campaign 2027
                        </Typography>
                        <IconButton variant="text" color="secondary" size="small" aria-label="More information">
                            <Icon name="info-filled" />
                        </IconButton>
                    </div>
                    <Typography variant="bodyS" className={styles.supportText}>
                        Last edited on October 12, 2026 by Maria Muster
                    </Typography>
                </div>
                <div className={styles.actions}>
                    <Button variant="outlined">Filter</Button>
                    <Button>Export</Button>
                </div>
                <IconButton variant="text" color="secondary" aria-label="More actions" className={styles.moreActions}>
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
                <Typography variant="h3" element="h1">
                    Settings
                </Typography>
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
                            <Typography variant="bodyS" render={<a href="#" className={styles.breadcrumbLink} />}>
                                Campaigns
                            </Typography>
                        </li>
                        <li aria-hidden className={styles.breadcrumbSeparator}>
                            <Icon name="chevron-right" />
                        </li>
                        <li>
                            <Typography variant="labelS" aria-current="page">
                                All campaigns
                            </Typography>
                        </li>
                    </ol>
                </nav>
                <div className={styles.titleRow}>
                    <div className={styles.titleGroup}>
                        <Typography variant="h3" element="h1">
                            Campaigns
                        </Typography>
                    </div>
                    <div className={styles.actions}>
                        <Button variant="outlined">Filter</Button>
                        <Button>Export</Button>
                    </div>
                    <IconButton variant="text" color="secondary" aria-label="More actions" className={styles.moreActions}>
                        <Icon name="more-vertical" />
                    </IconButton>
                </div>
            </div>
        </div>
    ),
};
