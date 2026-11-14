import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { expectPopupStaysOpen } from "../../../storybook/expectPopupStaysOpen";
import { ConfirmDialog } from "../ConfirmDialog";
import confirmDialogMeta, { Cancel, Loading, WithDetails, WithSecondaryAction } from "./ConfirmDialog.stories";

const meta = {
    component: ConfirmDialog,
    title: "Building blocks/Modals & overlays/ConfirmDialog",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: confirmDialogMeta.decorators,
    render: confirmDialogMeta.render,
    args: confirmDialogMeta.args,
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CancelClosesWithoutConfirming: Story = {
    ...Cancel,
    play: async ({ args }) => {
        await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
        await expect(args.onConfirm).not.toHaveBeenCalled();
    },
};

export const WithSecondaryActionCallsOnSecondary: Story = {
    ...WithSecondaryAction,
    play: async ({ args }) => {
        await userEvent.click(await screen.findByRole("button", { name: "Discard" }));
        await waitFor(() => expect(args.onSecondary).toHaveBeenCalled());
    },
};

export const WithDetailsShowsTheChildren: Story = {
    ...WithDetails,
    play: async () => {
        await expect(await screen.findByRole("alertdialog")).toHaveTextContent("3 published");
    },
};

export const LoadingDisablesTheOtherActionsAndEscape: Story = {
    ...Loading,
    play: async ({ args }) => {
        const dialog = await screen.findByRole("alertdialog");
        await expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
        await expect(screen.getByRole("button", { name: "Discard" })).toBeDisabled();
        await userEvent.keyboard("{Escape}");
        await expectPopupStaysOpen(dialog);
        await expect(args.onOpenChange).not.toHaveBeenCalled();
    },
};
