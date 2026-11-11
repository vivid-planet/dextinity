import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { Input } from "../Input";

const meta = {
    component: Input,
    title: "Building blocks/Input",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FocusOnAdornmentClick: Story = {
    args: {
        "aria-label": "Price",
        startAdornment: "€",
    },
    decorators: [(Story) => <div tabIndex={-1}>{Story()}</div>],
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByText("€"));
        await expect(canvas.getByRole("textbox", { name: "Price" })).toHaveFocus();
    },
};

export const FocusOnAdornmentButtonClick: Story = {
    args: {
        "aria-label": "Search",
        endAdornment: (
            <IconButton aria-label="Clear" size="small">
                <Icon name="clear" />
            </IconButton>
        ),
    },
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
        await expect(canvas.getByRole("button", { name: "Clear" })).toHaveFocus();
    },
};
