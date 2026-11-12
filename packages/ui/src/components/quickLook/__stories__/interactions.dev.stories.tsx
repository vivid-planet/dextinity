import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { QuickLook } from "../QuickLook";
import quickLookMeta, { Buttons } from "./QuickLook.stories";

const meta = {
    component: QuickLook,
    title: "Building blocks/Modals & overlays/QuickLook",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: quickLookMeta.decorators,
    render: quickLookMeta.render,
    args: quickLookMeta.args,
} satisfies Meta<typeof QuickLook>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ButtonsStepAndDisableAtTheEnds: Story = {
    ...Buttons,
    play: async ({ args }) => {
        await expect(await screen.findByRole("button", { name: "Next" })).toBeDisabled();
        await userEvent.click(screen.getByRole("button", { name: "Previous" }));
        await waitFor(() => expect(args.onIndexChange).toHaveBeenLastCalledWith(1));
    },
};
