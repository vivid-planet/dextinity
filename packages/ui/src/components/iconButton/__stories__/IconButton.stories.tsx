import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import iconButtonTokens from "../_tokens.scss?raw";
import { IconButton } from "../IconButton";
import styles from "./IconButton.stories.module.scss";

const iconOptions = {
    More: <Icon name="more" />,
    Edit: <Icon name="edit" />,
    Trash: <Icon name="trash" />,
    Close: <Icon name="close" />,
};

const meta = {
    component: IconButton,
    title: "Building blocks/Buttons/IconButton",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: iconButtonTokens },
    args: {
        children: <Icon name="more" />,
        "aria-label": "More actions",
        onClick: fn(),
    },
    argTypes: {
        children: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        variant: {
            control: "radio",
            options: ["text", "outlined"],
        },
        size: {
            control: "radio",
            options: ["default", "small"],
        },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The `aria-label` names the action for assistive technology and is shown as the tooltip on hover and keyboard focus.
 *
 * **Rules**
 *
 * - Always name the action in `aria-label`; it is also the tooltip text.
 * - Use an icon only for actions whose icon is well known (more, edit, delete, close). Otherwise use a `Button` with a label.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const button = canvas.getByRole("button", { name: "More actions" });
        await userEvent.hover(button);
        await expect(await screen.findByRole("tooltip")).toHaveTextContent("More actions");
        await userEvent.click(button);
        await expect(args.onClick).toHaveBeenCalledOnce();
    },
};

/**
 * Keyboard focus shows the tooltip with the shortcut; Enter triggers the action.
 */
export const WithShortcut: Story = {
    args: {
        children: <Icon name="edit" />,
        "aria-label": "Edit",
        shortcut: "⌘E",
    },
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("button", { name: "Edit" })).toHaveFocus();
        await expect(await screen.findByRole("tooltip")).toHaveTextContent("Edit⌘E");
        await userEvent.keyboard("{Enter}");
        await expect(args.onClick).toHaveBeenCalledOnce();
    },
};

/**
 * Where the button stands alone on a surface, e.g. next to a field.
 */
export const Outlined: Story = {
    args: {
        variant: "outlined",
    },
};

/**
 * In table rows, tree rows, and dense panels.
 */
export const Small: Story = {
    args: {
        size: "small",
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

/**
 * The spinner replaces the icon; the button keeps its size and ignores clicks.
 */
export const Loading: Story = {
    args: {
        loading: true,
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button"));
        await expect(args.onClick).not.toHaveBeenCalled();
    },
};

/**
 * Both variants in both sizes.
 */
export const Overview: Story = {
    render: (args) => (
        <div className={styles.row}>
            <IconButton {...args} />
            <IconButton {...args} size="small" />
            <IconButton {...args} variant="outlined" />
            <IconButton {...args} variant="outlined" size="small" />
        </div>
    ),
};
