import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { Toolbar } from "../Toolbar";
import toolbarTokens from "../Toolbar.tokens.scss?raw";
import { ToolbarButton } from "../ToolbarButton";
import styles from "./Toolbar.stories.module.scss";

const meta = {
    component: ToolbarButton,
    title: "Building blocks/Buttons/ToolbarButton",
    decorators: [
        (Story) => (
            <div className={styles.surface}>
                <Toolbar aria-label="Formatting">
                    <Story />
                </Toolbar>
            </div>
        ),
        themeDecorator,
    ],
    parameters: { tokens: toolbarTokens },
    args: { "aria-label": "Bold", children: <Icon name="bold" />, onClick: fn(), onSelectedChange: fn() },
    argTypes: {
        onClick: { description: "Called when the button is clicked." },
        selected: { control: "boolean" },
        disabled: { control: "boolean" },
        keepFocus: { control: "boolean" },
        keyboardShortcut: { control: "text" },
        children: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args, context) => {
        const [selected, setSelected] = useControlledArg(args, "selected", context);
        return (
            <ToolbarButton
                {...args}
                selected={selected}
                onSelectedChange={(next) => {
                    args.onSelectedChange?.(next);
                    setSelected(next);
                }}
            />
        );
    },
} satisfies Meta<typeof ToolbarButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A plain action, e.g. undo. Its name shows as the tooltip.
 */
export const Default: Story = {
    play: async ({ args, canvasElement }) => {
        const button = within(canvasElement).getByRole("button", { name: "Bold" });
        await expect(button).not.toHaveAttribute("aria-pressed");
        await userEvent.click(button);
        await expect(args.onClick).toHaveBeenCalledOnce();
        await expect(args.onSelectedChange).not.toHaveBeenCalled();
    },
};

/**
 * With `selected`, the button is a toggle, e.g. whether the text at the cursor is bold.
 */
export const Toggle: Story = {
    args: { selected: false },
    play: async ({ args, canvasElement }) => {
        const button = within(canvasElement).getByRole("button", { name: "Bold" });
        await userEvent.click(button);
        await expect(args.onSelectedChange).toHaveBeenCalledWith(true);
        await expect(button).toHaveAttribute("aria-pressed", "true");
    },
};

/**
 * The shortcut shows in the tooltip next to the name.
 */
export const KeyboardShortcut: Story = {
    args: { keyboardShortcut: "mod+b" },
};

/**
 * Disabled buttons stay focusable inside the toolbar.
 */
export const Disabled: Story = {
    args: { disabled: true },
};
