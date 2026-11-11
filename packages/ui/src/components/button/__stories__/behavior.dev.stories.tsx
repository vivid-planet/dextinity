import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { Button } from "../Button";
import styles from "./Button.stories.module.scss";

const meta = {
    component: Button,
    title: "Building blocks/Buttons/Button",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
    args: {
        children: "Button",
        onClick: fn(),
    },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoadingIgnoresClicks: Story = {
    args: {
        loading: true,
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button"));
        await expect(args.onClick).not.toHaveBeenCalled();
    },
};
export const LoadingKeepsWidth: Story = {
    render: (args) => (
        <div className={styles.grid}>
            <Button {...args}>Save</Button>
            <Button {...args} loading>
                Save
            </Button>
            <Button {...args} variant="outlined" color="secondary" startIcon={<Icon name="visible" />}>
                Preview
            </Button>
            <Button {...args} variant="outlined" color="secondary" startIcon={<Icon name="visible" />} loading>
                Preview
            </Button>
        </div>
    ),
    play: async ({ canvas }) => {
        const [save, saving, preview, previewing] = canvas.getAllByRole("button");
        await expect(saving.getBoundingClientRect().width).toBe(save.getBoundingClientRect().width);
        await expect(previewing.getBoundingClientRect().width).toBe(preview.getBoundingClientRect().width);
    },
};
