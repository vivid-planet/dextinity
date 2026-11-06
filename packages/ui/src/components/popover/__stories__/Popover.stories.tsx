import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { Slider } from "../../slider/Slider";
import popoverTokens from "../_tokens.scss?raw";
import { Popover, type PopoverProps } from "../Popover";
import styles from "./Popover.stories.module.scss";

function TimeOfDay() {
    const [hour, setHour] = useState(12);
    return (
        <>
            <Slider aria-label="Time of day" value={hour} onChange={setHour} min={0} max={23} />
            <span className={styles.time}>
                {String(hour).padStart(2, "0")}:00 · {hour >= 7 && hour < 19 ? "Light" : "Dark"}
            </span>
        </>
    );
}

function ControlledPopover(props: PopoverProps) {
    const [open, setOpen] = useState(props.open);
    return (
        <Popover
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
    component: Popover,
    title: "Building blocks/Modals & overlays/Popover",
    decorators: [
        themeDecorator,
        (Story, { args }) => (
            <div className={args.placement?.startsWith("top") ? `${styles.stage} ${styles.stageTop}` : styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: popoverTokens },
    render: (args) => <ControlledPopover key={String(args.open)} {...args} />,
    args: {
        trigger: (
            <Button variant="outlined" color="secondary" startIcon={<Icon name="time" />}>
                Time of day
            </Button>
        ),
        title: "Simulate time of day",
        children: <TimeOfDay />,
        open: false,
        onOpenChange: fn(),
    },
    argTypes: {
        placement: {
            control: "radio",
            options: ["bottom-start", "bottom-end", "top-start", "top-end"],
        },
        trigger: { control: false },
        children: { control: false },
        initialFocus: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Opens on click at its trigger; Escape and a click outside close it and return focus to the trigger.
 *
 * **Rules**
 *
 * - A few related controls that apply right away, without a save button.
 * - For actions, use a `Menu`; for a task with a save, a `Drawer` or `Dialog`.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const trigger = canvas.getByRole("button", { name: "Time of day" });
        await userEvent.click(trigger);
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(true));
        const popover = await screen.findByRole("dialog", { name: "Simulate time of day" });
        await waitFor(() => expect(popover).toBeVisible());
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        await expect(trigger).toHaveFocus();
    },
};

export const Open: Story = {
    args: { open: true },
};

/**
 * Without `title`, name the popover with `aria-label`.
 */
export const WithoutTitle: Story = {
    args: {
        open: true,
        title: undefined,
        "aria-label": "Time of day",
        trigger: (
            <IconButton color="secondary" aria-label="Time of day" variant="outlined">
                <Icon name="time" />
            </IconButton>
        ),
    },
};

export const BottomEnd: Story = {
    args: { open: true, placement: "bottom-end" },
};

export const TopStart: Story = {
    args: { open: true, placement: "top-start" },
};
