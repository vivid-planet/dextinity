import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { ConfirmDialog } from "../ConfirmDialog";
import confirmDialogTokens from "../ConfirmDialog.tokens.scss?raw";

const iconOptions = {
    Trash: <Icon name="trash" />,
    Check: <Icon name="check" />,
};

const meta = {
    component: ConfirmDialog,
    title: "Building blocks/Modals & overlays/ConfirmDialog",
    decorators: [themeDecorator],
    parameters: { tokens: confirmDialogTokens, closedOnDocsPage: true },
    render: (args, context) => {
        const [open, setOpen] = useControlledArg(args, "open", context);
        const handleOpenChange = (nextOpen: boolean) => {
            setOpen(nextOpen);
            args.onOpenChange(nextOpen);
        };
        return (
            <>
                <Button variant="outlined" color="secondary" onClick={() => handleOpenChange(true)}>
                    Leave page
                </Button>
                <ConfirmDialog
                    {...args}
                    open={open}
                    onOpenChange={handleOpenChange}
                    onConfirm={() => {
                        args.onConfirm();
                        handleOpenChange(false);
                    }}
                    onSecondary={
                        args.onSecondary == null
                            ? undefined
                            : () => {
                                  args.onSecondary?.();
                                  handleOpenChange(false);
                              }
                    }
                />
            </>
        );
    },
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
};

/**
 * `secondaryLabel` adds a third option, e.g. leaving without saving: Save, Discard, or Cancel for unsaved changes.
 */
export const WithSecondaryAction: Story = {
    args: {
        open: true,
        secondaryLabel: "Discard",
        onSecondary: fn(),
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
 * `children` add details that help decide, e.g. what a deletion takes along.
 */
export const WithDetails: Story = {
    args: {
        open: true,
        tone: "danger",
        title: "Delete 4 pages?",
        description: "Deleted pages can't be restored.",
        confirmLabel: "Delete",
        confirmIcon: <Icon name="trash" />,
        children: (
            <ul>
                <li>3 published</li>
                <li>1 unpublished</li>
            </ul>
        ),
    },
};

/**
 * `loading` shows a spinner in the confirming action while it runs. Meanwhile, the other actions are disabled and Escape doesn't close
 * the dialog.
 */
export const Loading: Story = {
    args: { open: true, loading: true, secondaryLabel: "Discard", onSecondary: fn() },
};
