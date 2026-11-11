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
            <Button variant="secondary">Cancel</Button>
            <Button variant="secondary">Save as draft</Button>
            <Button>Publish</Button>
        </div>
    ),
};

export const IconButtons: Story = {
    render: () => (
        <div className={styles.actions}>
            <IconButton aria-label="Edit">
                <Icon name="edit" />
            </IconButton>
            <IconButton aria-label="Duplicate">
                <Icon name="copy" />
            </IconButton>
            <IconButton variant="danger" aria-label="Delete">
                <Icon name="delete" />
            </IconButton>
        </div>
    ),
};

export const Loading: Story = {
    render: () => (
        <div className={styles.actions}>
            <Button variant="secondary">Cancel</Button>
            <Button loading>Publish</Button>
        </div>
    ),
};
