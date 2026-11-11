import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Icon } from "../../../components/icon/Icon";
import { IconButton } from "../../../components/iconButton/IconButton";
import { MenuSectionHeader } from "../../../components/menuSectionHeader/MenuSectionHeader";
import { NavItem } from "../../../components/navItem/NavItem";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./navigation.module.scss";

const meta = {
    title: "Shell/Navigation",
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
                <NavItem href="#" icon={<Icon name="dashboard" />}>
                    Dashboard
                </NavItem>
                <MenuSectionHeader
                    slotProps={{ label: { id: "navigation-content" } }}
                    action={
                        <IconButton variant="text" color="secondary" size="small" aria-label="Add page">
                            <Icon name="add" />
                        </IconButton>
                    }
                >
                    Content
                </MenuSectionHeader>
                <ul aria-labelledby="navigation-content" className={styles.list}>
                    <li>
                        <NavItem href="#" icon={<Icon name="page-tree" />} active>
                            Pages
                        </NavItem>
                    </li>
                    <li>
                        <NavItem href="#" icon={<Icon name="assets" />}>
                            Assets
                        </NavItem>
                    </li>
                </ul>
                <MenuSectionHeader slotProps={{ label: { id: "navigation-system" } }}>System</MenuSectionHeader>
                <ul aria-labelledby="navigation-system" className={styles.list}>
                    <li>
                        <NavItem
                            icon={<Icon name="settings" />}
                            expandable
                            render={
                                <button type="button" aria-expanded={isSettingsExpanded} onClick={() => setIsSettingsExpanded(!isSettingsExpanded)} />
                            }
                        >
                            Settings
                        </NavItem>
                        {isSettingsExpanded && (
                            <ul className={styles.list}>
                                <li>
                                    <NavItem href="#" level={2}>
                                        Users
                                    </NavItem>
                                </li>
                                <li>
                                    <NavItem href="#" level={2}>
                                        Permissions
                                    </NavItem>
                                </li>
                                <li>
                                    <NavItem href="#" level={2}>
                                        Languages
                                    </NavItem>
                                </li>
                                <li>
                                    <NavItem href="#" level={2}>
                                        Domains
                                    </NavItem>
                                </li>
                            </ul>
                        )}
                    </li>
                </ul>
            </nav>
        );
    },
};
