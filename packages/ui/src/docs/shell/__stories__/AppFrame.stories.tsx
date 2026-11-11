import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../../components/button/Button";
import { Icon } from "../../../components/icon/Icon";
import { IconButton } from "../../../components/iconButton/IconButton";
import { MenuSectionHeader } from "../../../components/menuSectionHeader/MenuSectionHeader";
import { NavItem } from "../../../components/navItem/NavItem";
import { Typography } from "../../../components/typography/Typography";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./appFrame.module.scss";

const meta = {
    title: "Shell/App frame",
    tags: ["!dev", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const AppShell: Story = {
    name: "Full example",
    parameters: { layout: "fullscreen", docs: { story: { inline: false, height: "640px" } } },
    render: () => (
        <div className={styles.shell}>
            <header className={styles.appBar}>
                <Typography variant="title" className={styles.appBarTitle}>
                    Application title
                </Typography>
            </header>
            <div className={styles.body}>
                <nav aria-label="Main" className={styles.navigation}>
                    <MenuSectionHeader slotProps={{ label: { id: "app-shell-main" } }}>Main</MenuSectionHeader>
                    <ul aria-labelledby="app-shell-main" className={styles.list}>
                        <li>
                            <NavItem href="#" icon={<Icon name="dashboard" />} active>
                                Dashboard
                            </NavItem>
                        </li>
                        <li>
                            <NavItem href="#" icon={<Icon name="page-tree" />}>
                                Pages
                            </NavItem>
                        </li>
                        <li>
                            <NavItem href="#" icon={<Icon name="settings" />}>
                                Settings
                            </NavItem>
                        </li>
                    </ul>
                </nav>
                <main className={styles.main}>
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
                            <Typography variant="displayL">Dashboard</Typography>
                            <div className={styles.actions}>
                                <Button variant="outlined">Filter</Button>
                                <Button>Export</Button>
                            </div>
                            <IconButton variant="text" color="secondary" aria-label="More actions" className={styles.moreActions}>
                                <Icon name="more-vertical" />
                            </IconButton>
                        </div>
                    </div>
                    <div className={styles.content}>
                        <div className={styles.placeholder}>
                            <Typography variant="body">Page content</Typography>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    ),
};
