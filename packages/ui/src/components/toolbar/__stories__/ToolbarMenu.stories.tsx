import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { MenuItem } from "../../menu/MenuItem";
import { Toolbar } from "../Toolbar";
import toolbarTokens from "../Toolbar.tokens.scss?raw";
import { ToolbarMenu, type ToolbarMenuProps } from "../ToolbarMenu";
import styles from "./Toolbar.stories.module.scss";

function ControlledToolbarMenu(props: ToolbarMenuProps) {
    const [open, setOpen] = useState(props.open);
    return (
        <ToolbarMenu
            {...props}
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                props.onOpenChange(nextOpen);
            }}
        />
    );
}

const meta = {
    component: ToolbarMenu,
    title: "Building blocks/Buttons/ToolbarMenu",
    decorators: [
        (Story) => (
            <div className={styles.stage}>
                <div className={styles.surface}>
                    <Toolbar aria-label="Editor">
                        <Story />
                    </Toolbar>
                </div>
            </div>
        ),
        themeDecorator,
    ],
    parameters: { tokens: toolbarTokens },
    args: {
        label: "Insert",
        icon: <Icon name="plus" />,
        open: false,
        onOpenChange: fn(),
        children: (
            <>
                <MenuItem label="Image" icon={<Icon name="image" />} onClick={fn()} />
                <MenuItem label="Table" icon={<Icon name="grid" />} onClick={fn()} />
                <MenuItem label="Code" icon={<Icon name="html" />} onClick={fn()} />
            </>
        ),
    },
    argTypes: {
        placement: { control: "select", options: ["bottom-start", "bottom-end", "top-start", "top-end"] },
        disabled: { control: "boolean" },
        icon: { control: false },
        children: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledToolbarMenu {...args} />,
} satisfies Meta<typeof ToolbarMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Opens a menu from the toolbar, e.g. to insert content or pick the text style.
 */
export const Default: Story = {
    play: async ({ args, canvasElement }) => {
        const trigger = within(canvasElement).getByRole("button", { name: "Insert" });
        await userEvent.click(trigger);
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(true));
        await userEvent.click(await screen.findByRole("menuitem", { name: "Table" }));
        await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    },
};

/**
 * Without a text label, the icon alone needs an `aria-label`.
 */
export const IconOnly: Story = {
    args: { label: undefined, "aria-label": "Insert" },
};

/**
 * A disabled trigger stays focusable and doesn't open the menu.
 */
export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ args, canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole("button", { name: "Insert" }));
        await expect(args.onOpenChange).not.toHaveBeenCalledWith(true);
    },
};
