import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../../components/button/Button";
import { Icon } from "../../../components/icon/Icon";
import { IconButton } from "../../../components/iconButton/IconButton";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./actions.module.scss";

const meta = {
    title: "Patterns/Actions",
    tags: ["!dev", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const MainAction: Story = {
    render: () => (
        <div className={styles.actions}>
            <Button variant="outlined">Cancel</Button>
            <Button variant="outlined">Save as draft</Button>
            <Button>Publish</Button>
        </div>
    ),
};

export const IconButtons: Story = {
    render: () => (
        <div className={styles.actions}>
            <IconButton variant="text" aria-label="Edit">
                <Icon name="edit" />
            </IconButton>
            <IconButton variant="text" aria-label="Duplicate">
                <Icon name="copy" />
            </IconButton>
            <IconButton variant="text" color="error" aria-label="Delete">
                <Icon name="trash" />
            </IconButton>
        </div>
    ),
};

export const Loading: Story = {
    render: () => (
        <div className={styles.actions}>
            <Button variant="outlined">Cancel</Button>
            <Button loading>Publish</Button>
        </div>
    ),
};
