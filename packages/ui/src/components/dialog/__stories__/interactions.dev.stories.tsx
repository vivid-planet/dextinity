import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { expectPopupStaysOpen } from "../../../storybook/expectPopupStaysOpen";
import { Dialog } from "../Dialog";
import dialogMeta, { AlertDialog, CloseButton, InitialFocus, NotDismissible, OverBrightPage, WithFormActions } from "./Dialog.stories";

const meta = {
    component: Dialog,
    title: "Building blocks/Modals & overlays/Dialog",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: dialogMeta.decorators,
    render: dialogMeta.render,
    args: dialogMeta.args,
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CloseButtonClosesTheDialog: Story = {
    ...CloseButton,
    play: async ({ args }) => {
        await userEvent.click(await screen.findByRole("button", { name: "Close" }));
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
    },
};

export const OverBrightPageSurfaceIsNearlyOpaque: Story = {
    ...OverBrightPage,
    play: async () => {
        const alphaOf = (color: string) => Number(/\/\s*([\d.]+)\s*\)$/.exec(color)?.[1] ?? 1);
        const dialog = await screen.findByRole("dialog", { name: "Choose a page" });
        await expect(alphaOf(getComputedStyle(dialog).backgroundColor)).toBeGreaterThanOrEqual(0.95);

        // Dark mode is where a bright page shone through, so check the surface in every color scheme, not only the one shown
        for (const colorScheme of ["light", "dark", "high-contrast"]) {
            const probe = document.createElement("div");
            probe.dataset.dextinityColorScheme = colorScheme;
            probe.style.background = "var(--dextinity-dialog-background)";
            document.body.append(probe);
            const background = getComputedStyle(probe).backgroundColor;
            probe.remove();
            await expect(background, colorScheme).not.toBe("rgba(0, 0, 0, 0)");
            await expect(alphaOf(background), colorScheme).toBeGreaterThanOrEqual(0.95);
        }
    },
};

export const InitialFocusFocusesTheGivenElement: Story = {
    ...InitialFocus,
    play: async () => {
        await waitFor(() => expect(screen.getByRole("button", { name: "Save and continue" })).toHaveFocus());
    },
};

export const AlertDialogHasTheAlertdialogRole: Story = {
    ...AlertDialog,
    play: async () => {
        await expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    },
};

export const NotDismissibleIgnoresEscapeAndTheCloseButton: Story = {
    ...NotDismissible,
    play: async ({ args }) => {
        const dialog = await screen.findByRole("dialog");
        await expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
        await userEvent.keyboard("{Escape}");
        await expectPopupStaysOpen(dialog);
        await expect(args.onOpenChange).not.toHaveBeenCalled();
    },
};

export const WithFormActionsKeepsTheDialogOpenWhileSubmitting: Story = {
    ...WithFormActions,
    play: async ({ args }) => {
        const dialog = await screen.findByRole("dialog", { name: "New folder" });
        await expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
        await userEvent.type(screen.getByRole("textbox", { name: "Name" }), "Press kit");
        await userEvent.click(screen.getByRole("button", { name: "Create" }));
        await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled());
        await userEvent.keyboard("{Escape}");
        await expectPopupStaysOpen(dialog);
        await expect(args.onOpenChange).not.toHaveBeenCalled();
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false), { timeout: 3000 });
    },
};
