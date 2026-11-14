import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { Drawer } from "../Drawer";
import drawerMeta, { Modal } from "./Drawer.stories";

const meta = {
    component: Drawer,
    title: "Building blocks/Modals & overlays/Drawer",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: drawerMeta.decorators,
    render: drawerMeta.render,
    args: drawerMeta.args,
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ModalClosesOnEscape: Story = {
    ...Modal,
    play: async ({ args }) => {
        await screen.findByRole("dialog", { name: "Edit redirect" });
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
    },
};
