import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Icon } from "../../../components/icon/Icon";
import { IconButton } from "../../../components/iconButton/IconButton";
import { MainNavigationItem } from "../../../components/mainNavigationItem/MainNavigationItem";
import { MenuSectionHeader } from "../../../components/menuSectionHeader/MenuSectionHeader";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./mainNavigation.module.scss";

const meta = {
    title: "Patterns/Main navigation",
    tags: ["!dev", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const MainNavigation: Story = {
    render: function Render() {
        const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);

        return (
            <nav aria-label="Main" className={styles.navigation}>
                <MainNavigationItem href="#" icon={<Icon name="dashboard" />}>
                    Dashboard
                </MainNavigationItem>
                <MenuSectionHeader
                    slotProps={{ label: { id: "navigation-content" } }}
                    action={
                        <IconButton variant="text" color="secondary" size="small" aria-label="Add page">
                            <Icon name="plus-circle" />
                        </IconButton>
                    }
                >
                    Content
                </MenuSectionHeader>
                <ul aria-labelledby="navigation-content" className={styles.list}>
                    <li>
                        <MainNavigationItem href="#" icon={<Icon name="sitemap" />} active>
                            Pages
                        </MainNavigationItem>
                    </li>
                    <li>
                        <MainNavigationItem href="#" icon={<Icon name="images" />}>
                            Assets
                        </MainNavigationItem>
                    </li>
                </ul>
                <MenuSectionHeader slotProps={{ label: { id: "navigation-system" } }}>System</MenuSectionHeader>
                <ul aria-labelledby="navigation-system" className={styles.list}>
                    <li>
                        <MainNavigationItem
                            icon={<Icon name="gear" />}
                            expandable
                            render={
                                <button type="button" aria-expanded={isSettingsExpanded} onClick={() => setIsSettingsExpanded(!isSettingsExpanded)} />
                            }
                        >
                            Settings
                        </MainNavigationItem>
                        {isSettingsExpanded && (
                            <ul className={styles.list}>
                                <li>
                                    <MainNavigationItem href="#" level={2}>
                                        Users
                                    </MainNavigationItem>
                                </li>
                                <li>
                                    <MainNavigationItem href="#" level={2}>
                                        Permissions
                                    </MainNavigationItem>
                                </li>
                                <li>
                                    <MainNavigationItem href="#" level={2}>
                                        Languages
                                    </MainNavigationItem>
                                </li>
                                <li>
                                    <MainNavigationItem href="#" level={2}>
                                        Domains
                                    </MainNavigationItem>
                                </li>
                            </ul>
                        )}
                    </li>
                </ul>
            </nav>
        );
    },
};
