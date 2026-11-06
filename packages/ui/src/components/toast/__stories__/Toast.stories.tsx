import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { Toast } from "../Toast";
import toastTokens from "../Toast.tokens.scss?raw";
import styles from "./Toast.stories.module.scss";

const iconOptions = {
    Sparkle: <Icon name="artificial-intelligence" />,
    Copy: <Icon name="copy" />,
};

const onUndo = fn();

const meta = {
    component: Toast,
    title: "Building blocks/Menus & messages/Toast",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: toastTokens },
    args: {
        message: "Saved – the change is live",
    },
    argTypes: {
        tone: {
            control: "radio",
            options: ["success", "error", "warning", "info"],
        },
        icon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        action: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Confirms the result of an action. Show it through `ToastViewport`, which dismisses it after its duration.
 *
 * **Rules**
 *
 * - Short, with the result instead of the process.
 * - Offer Undo instead of asking "Are you sure?".
 * - One toast at a time.
 * - Report a field's error at the field, not only in a toast.
 */
export const Default: Story = {};

/**
 * `action` offers Undo instead of a confirmation up front.
 */
export const WithUndo: Story = {
    args: {
        action: { label: "Undo", onClick: onUndo },
    },
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
        await waitFor(() => expect(onUndo).toHaveBeenCalled());
    },
};

/**
 * `tone="error"` reports a failure; screen readers announce it right away.
 */
export const ErrorTone: Story = {
    args: {
        message: "Please enter a title first",
        tone: "error",
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("alert")).toHaveTextContent("Please enter a title first");
    },
};

/**
 * `tone="warning"` points out something to look at although the action went through.
 */
export const Warning: Story = {
    args: {
        message: "Uploaded – the video is large and may load slowly",
        tone: "warning",
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("status")).toHaveAttribute("data-tone", "warning");
    },
};

export const Info: Story = {
    args: {
        message: "3 pages are being translated",
        tone: "info",
    },
};

/**
 * `icon` replaces the tone's icon.
 */
export const CustomIcon: Story = {
    args: {
        message: "Link copied",
        icon: <Icon name="copy" />,
    },
};
