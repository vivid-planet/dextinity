import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { MenuSectionHeader } from "../MenuSectionHeader";
import tokens from "../MenuSectionHeader.tokens.scss?raw";
import styles from "./menuSectionHeader.module.scss";

const actionOptions = {
    Add: (
        <IconButton variant="text" color="secondary" size="small" aria-label="Add page">
            <Icon name="add" />
        </IconButton>
    ),
};

const meta = {
    component: MenuSectionHeader,
    title: "Shell/MenuSectionHeader",
    parameters: {
        tokens,
        rules: {
            dos: ["Group labels separate areas, such as Content, Project, Administration.", "Short labels of one or two words."],
            donts: ["The same labels in different groups.", "A group with a single item."],
        },
    },
    decorators: [themeDecorator],
    args: {
        children: "Section",
    },
    argTypes: {
        action: {
            control: "select",
            options: Object.keys(actionOptions),
            mapping: actionOptions,
        },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
        ref: { control: false },
    },
    render: (args) => (
        <div className={styles.container}>
            <MenuSectionHeader {...args} />
        </div>
    ),
} satisfies Meta<typeof MenuSectionHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expandable: Story = {
    args: {
        expandable: true,
        slots: { label: "button" },
        slotProps: { label: { type: "button", "aria-expanded": true } },
    },
};

export const WithAction: Story = {
    args: {
        action: actionOptions.Add,
    },
};
