import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";
import { useState } from "react";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { MainNavigationItem } from "../MainNavigationItem";
import styles from "./mainNavigationItem.module.scss";

const iconOptions = {
    Dashboard: <Icon name="dashboard" />,
    Settings: <Icon name="settings" />,
};

const meta = {
    component: MainNavigationItem,
    title: "Components/MainNavigationItem",
    decorators: [themeDecorator],
    args: {
        children: "Dashboard",
        href: "#",
    },
    argTypes: {
        level: {
            control: "radio",
            options: [1, 2, 3],
        },
        icon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
        ref: { control: false },
        render: { control: false },
    },
    render: (args) => (
        <div className={styles.container}>
            <MainNavigationItem {...args} />
        </div>
    ),
} satisfies Meta<typeof MainNavigationItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
    args: {
        icon: <Icon name="dashboard" />,
    },
};

export const Active: Story = {
    args: {
        icon: <Icon name="dashboard" />,
        active: true,
    },
};

export const Expandable: Story = {
    args: {
        icon: <Icon name="settings" />,
        expandable: true,
        children: "Settings",
        href: undefined,
    },
    render: function Render(args) {
        const [isExpanded, setIsExpanded] = useState(true);

        return (
            <ul className={clsx(styles.container, styles.list)}>
                <li>
                    <MainNavigationItem
                        {...args}
                        render={<button type="button" aria-expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)} />}
                    />
                    {isExpanded && (
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
                        </ul>
                    )}
                </li>
            </ul>
        );
    },
};

export const Level2: Story = {
    args: {
        level: 2,
        children: "Users",
    },
};

export const Level3: Story = {
    args: {
        level: 3,
        children: "Permissions",
    },
};
