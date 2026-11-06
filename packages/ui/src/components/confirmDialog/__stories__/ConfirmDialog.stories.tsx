import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import confirmDialogTokens from "../_tokens.scss?raw";
import { ConfirmDialog, type ConfirmDialogProps } from "../ConfirmDialog";

function ControlledConfirmDialog(props: ConfirmDialogProps) {
    const [open, setOpen] = useState(props.open);
    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        props.onOpenChange(nextOpen);
    };
    return (
        <>
            <Button variant="outlined" color="secondary" onClick={() => handleOpenChange(true)}>
                Leave page
            </Button>
            <ConfirmDialog
                {...props}
                open={open}
                onOpenChange={handleOpenChange}
                onConfirm={() => {
                    props.onConfirm();
                    handleOpenChange(false);
                }}
                onSecondary={
                    props.onSecondary == null
                        ? undefined
                        : () => {
                              props.onSecondary?.();
                              handleOpenChange(false);
                          }
                }
            />
        </>
    );
}

const iconOptions = {
    Trash: <Icon name="trash" />,
    Check: <Icon name="check" />,
};

const meta = {
    component: ConfirmDialog,
    title: "Building blocks/Modals & overlays/ConfirmDialog",
    decorators: [themeDecorator],
    parameters: { tokens: confirmDialogTokens },
    render: (args) => <ControlledConfirmDialog key={String(args.open)} {...args} />,
    args: {
        open: false,
        onOpenChange: fn(),
        title: "Unsaved changes",
        description: "If you save, they go live right away.",
        confirmLabel: "Save and continue",
        onConfirm: fn(),
    },
    argTypes: {
        tone: {
            control: "radio",
            options: ["default", "danger"],
        },
        confirmIcon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Asks before data is lost. Cancel comes first and gets focus; Escape cancels too, a click on the backdrop doesn't.
 *
 * **Rules**
 *
 * - Only when the action can't be undone: otherwise do it right away and offer Undo in a `Toast`.
 * - The title asks what happens, the description says the consequence.
 * - Label the confirming action with what it does, never "OK" or "Yes".
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Leave page" }));
        const dialog = await screen.findByRole("alertdialog", { name: "Unsaved changes" });
        await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus());
        await userEvent.click(screen.getByRole("button", { name: "Save and continue" }));
        await waitFor(() => expect(args.onConfirm).toHaveBeenCalled());
        await waitFor(() => expect(dialog).not.toBeInTheDocument());
    },
};

/**
 * Cancel and Escape close the dialog without confirming.
 */
export const Cancel: Story = {
    args: { open: true },
    play: async ({ args }) => {
        await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
        await expect(args.onConfirm).not.toHaveBeenCalled();
    },
};

/**
 * `secondaryLabel` adds a third option, e.g. leaving without saving.
 */
export const WithSecondaryAction: Story = {
    args: {
        open: true,
        secondaryLabel: "Discard",
        onSecondary: fn(),
    },
    play: async ({ args }) => {
        await userEvent.click(await screen.findByRole("button", { name: "Discard" }));
        await waitFor(() => expect(args.onSecondary).toHaveBeenCalled());
    },
};

/**
 * `tone="danger"` for deleting for good, only when Undo isn't possible.
 */
export const Danger: Story = {
    args: {
        open: true,
        tone: "danger",
        title: "Delete “Careers” and 3 subpages?",
        description: "Redirects to these pages stop working.",
        confirmLabel: "Delete",
        confirmIcon: <Icon name="trash" />,
    },
};

/**
 * `loading` shows a spinner in the confirming action while it runs.
 */
export const Loading: Story = {
    args: { open: true, loading: true },
};
