import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";
import { useState } from "react";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { NavItem } from "../NavItem";
import tokens from "../NavItem.tokens.scss?raw";
import styles from "./navItem.module.scss";

const iconOptions = {
    Dashboard: <Icon name="dashboard" />,
    Settings: <Icon name="settings" />,
};

const meta = {
    component: NavItem,
    title: "Shell/NavItem",
    parameters: {
        tokens,
        rules: {
            dos: [
                "Up to 3 levels; long labels may wrap.",
                "Icons only on level 1.",
                "Expand the ancestors of the current page automatically.",
                'Exactly one active item: the current page, with `aria-current="page"`.',
            ],
            donts: ["A level 4.", "The same labels in different groups.", "Items that open subitems and have a target of their own."],
        },
    },
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
            <NavItem {...args} />
        </div>
    ),
} satisfies Meta<typeof NavItem>;

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
                    <NavItem {...args} render={<button type="button" aria-expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)} />} />
                    {isExpanded && (
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
