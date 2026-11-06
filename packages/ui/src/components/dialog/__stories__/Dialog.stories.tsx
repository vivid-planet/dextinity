import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Input } from "../../input/Input";
import dialogTokens from "../_tokens.scss?raw";
import { Dialog, type DialogProps } from "../Dialog";

function ControlledDialog(props: DialogProps) {
    const [open, setOpen] = useState(props.open);
    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        props.onOpenChange(nextOpen);
    };
    return (
        <>
            <Button variant="outlined" color="secondary" onClick={() => handleOpenChange(true)}>
                Open dialog
            </Button>
            <Dialog {...props} open={open} onOpenChange={handleOpenChange} />
        </>
    );
}

const meta = {
    component: Dialog,
    title: "Building blocks/Modals & overlays/Dialog",
    decorators: [themeDecorator],
    parameters: { tokens: dialogTokens },
    render: (args) => <ControlledDialog key={String(args.open)} {...args} />,
    args: {
        open: false,
        onOpenChange: fn(),
        title: "Unsaved changes",
        description: "If you save, they go live right away.",
        footer: (
            <>
                <Button variant="text">Cancel</Button>
                <Button>Save and continue</Button>
            </>
        ),
    },
    argTypes: {
        size: {
            control: "radio",
            options: ["small", "default", "large"],
        },
        role: {
            control: "radio",
            options: ["dialog", "alertdialog"],
        },
        children: { control: false },
        footer: { control: false },
        initialFocus: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Opens over a dimmed page. Focus moves into the dialog and stays there; Escape, the close button, or a click on the
 * backdrop close it, and focus returns to the trigger.
 *
 * **Rules**
 *
 * - Only when something would be lost otherwise, or the task needs full attention.
 * - Secondary actions first, the primary action last.
 * - No dialog over a dialog.
 * - No forms with more than six fields in a dialog: use a `Drawer` or a page.
 * - Prefer a `Drawer` when people need the context behind it.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const trigger = canvas.getByRole("button", { name: "Open dialog" });
        await userEvent.click(trigger);
        const dialog = await screen.findByRole("dialog", { name: "Unsaved changes" });
        await waitFor(() => expect(dialog).toHaveAccessibleDescription("If you save, they go live right away."));
        await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
        const firstFocused = document.activeElement;
        for (let i = 0; i < 5; i++) {
            await userEvent.tab();
            await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
        }
        (firstFocused as HTMLElement).focus();
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        await waitFor(() => expect(trigger).toHaveFocus());
    },
};

export const Open: Story = {
    args: { open: true },
};

/**
 * The close button in the corner closes the dialog.
 */
export const CloseButton: Story = {
    args: { open: true },
    play: async ({ args }) => {
        await userEvent.click(await screen.findByRole("button", { name: "Close" }));
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
    },
};

function RedirectForm() {
    const [source, setSource] = useState("/alt-2");
    const [target, setTarget] = useState("/careers");
    return (
        <>
            <Input name="source" label="Source" value={source} onChange={(event) => setSource(event.target.value)} />
            <Input name="target" label="Target" value={target} onChange={(event) => setTarget(event.target.value)} />
        </>
    );
}

/**
 * A short form in the dialog's content.
 */
export const WithForm: Story = {
    args: {
        open: true,
        title: "New redirect",
        description: undefined,
        children: <RedirectForm />,
        footer: (
            <>
                <Button variant="text">Cancel</Button>
                <Button>Create</Button>
            </>
        ),
    },
};

/**
 * `small` (440 px) for questions.
 */
export const Small: Story = {
    args: { open: true, size: "small" },
};

/**
 * `large` (960 px) for content that needs room, e.g. a comparison.
 */
export const Large: Story = {
    args: { open: true, size: "large" },
};

/**
 * Without the close button, only Escape and the footer's actions close the dialog.
 */
export const HideCloseButton: Story = {
    args: { open: true, hideCloseButton: true },
};

function InitialFocusDialog(props: DialogProps) {
    const saveRef = useRef<HTMLButtonElement>(null);
    return (
        <Dialog
            {...props}
            initialFocus={saveRef}
            footer={
                <>
                    <Button variant="text">Cancel</Button>
                    <Button ref={saveRef}>Save and continue</Button>
                </>
            }
        />
    );
}

/**
 * `initialFocus` focuses a given element on open instead of the first focusable one.
 */
export const InitialFocus: Story = {
    args: { open: true },
    render: (args) => <InitialFocusDialog {...args} />,
    play: async () => {
        await waitFor(() => expect(screen.getByRole("button", { name: "Save and continue" })).toHaveFocus());
    },
};

/**
 * `role="alertdialog"` doesn't close on a click on the backdrop. Prefer `ConfirmDialog` for questions.
 */
export const AlertDialog: Story = {
    args: { open: true, role: "alertdialog" },
    play: async () => {
        await expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    },
};
