import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Tooltip, type TooltipProps } from "../Tooltip";
import tooltipTokens from "../Tooltip.tokens.scss?raw";
import styles from "./Tooltip.stories.module.scss";

const meta = {
    component: Tooltip,
    title: "Building blocks/Status, tags & badges/Tooltip",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: tooltipTokens },
    args: {
        content: "More actions",
        children: (
            <Button variant="outlined" color="secondary">
                Hover me
            </Button>
        ),
        onOpenChange: fn(),
    },
    argTypes: {
        placement: {
            control: "radio",
            options: ["top", "bottom", "left", "right"],
        },
        children: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Opens after the theme's tooltip delay on hover, and right away on keyboard focus.
 *
 * **Rules**
 *
 * - One short line that says what the element does.
 * - Every icon-only control gets a tooltip.
 * - Don't put essential information or interactive content in a tooltip.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.hover(canvas.getByRole("button"));
        await expect(await screen.findByRole("tooltip")).toHaveTextContent("More actions");
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(true, { reason: "trigger-hover" }));
        await userEvent.unhover(canvas.getByRole("button"));
        await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    },
};

/**
 * `shortcut` shows the keyboard shortcut after the text.
 */
export const WithShortcut: Story = {
    args: {
        shortcut: "⌘.",
        open: true,
    },
};

/**
 * Keyboard focus opens the tooltip, Escape closes it.
 */
export const KeyboardFocus: Story = {
    play: async ({ canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("button")).toHaveFocus();
        const tooltip = await screen.findByRole("tooltip");
        await waitFor(() => expect(tooltip).toBeVisible());
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    },
};

export const Top: Story = {
    args: {
        placement: "top",
        open: true,
    },
};

export const Left: Story = {
    args: {
        placement: "left",
        open: true,
    },
};

export const Right: Story = {
    args: {
        placement: "right",
        open: true,
    },
};

function ControlledTooltip(props: TooltipProps) {
    const [open, setOpen] = useState(false);
    return (
        <Tooltip
            {...props}
            open={open}
            onOpenChange={(nextOpen, details) => {
                setOpen(nextOpen);
                props.onOpenChange?.(nextOpen, details);
            }}
        />
    );
}

/**
 * With `open` and `onOpenChange`, the consumer owns the open state.
 */
export const Controlled: Story = {
    render: (args) => <ControlledTooltip {...args} />,
};

function ClickToShowTooltip(props: TooltipProps) {
    const [open, setOpen] = useState(false);
    return (
        <Tooltip {...props} open={open} onOpenChange={setOpen} closeOnClick={false}>
            <Button variant="outlined" color="secondary" onClick={() => setOpen(true)}>
                What is a slug?
            </Button>
        </Tooltip>
    );
}

/**
 * With `closeOnClick={false}`, a click on the trigger keeps the tooltip open, so the trigger can open it on click as well, e.g. an info
 * button that a tap on a touch screen should open. `content` takes formatted text, too, but no interactive content.
 */
export const ClickToShow: Story = {
    args: {
        content: (
            <>
                The <strong>slug</strong> is the last part of the page&apos;s URL.
            </>
        ),
    },
    render: (args) => <ClickToShowTooltip {...args} />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "What is a slug?" }));
        const tooltip = await screen.findByRole("tooltip");
        await expect(tooltip).toHaveTextContent("The slug is the last part of the page's URL.");
        await expect(tooltip.querySelector("strong")).toHaveTextContent("slug");
        await userEvent.click(canvas.getByRole("button", { name: "What is a slug?" }));
        await expect(screen.getByRole("tooltip")).toBeVisible();
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
    play: async ({ args, canvas }) => {
        await userEvent.hover(canvas.getByRole("button"));
        await new Promise((resolve) => setTimeout(resolve, 600));
        await expect(screen.queryByRole("tooltip")).toBeNull();
        await expect(args.onOpenChange).not.toHaveBeenCalled();
    },
};
