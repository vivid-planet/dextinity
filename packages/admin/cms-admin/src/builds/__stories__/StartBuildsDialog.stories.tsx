import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { StartBuildsDialog } from "../StartBuildsDialog";

const config: Meta<typeof StartBuildsDialog> = {
    component: StartBuildsDialog,
    title: "builds/StartBuildsDialog",
    args: {
        open: true,
        onClose: fn(),
    },
};

export default config;

type Story = StoryObj<typeof config>;

export const TenTemplates: Story = {
    name: "Ten templates",
};

export const RequiresABuild: Story = {
    play: async ({ args }) => {
        await screen.findByRole("checkbox", { name: /^Build Template 1\b/ });
        await userEvent.click(screen.getByRole("button", { name: "Start builds" }));
        await expect(await screen.findByText("Select at least one build")).toBeInTheDocument();
        await expect(args.onClose).not.toHaveBeenCalled();
    },
};

export const StartsTheSelectedBuilds: Story = {
    play: async ({ args }) => {
        await userEvent.click(await screen.findByRole("checkbox", { name: /^Build Template 2\b/ }));
        await userEvent.click(screen.getByRole("button", { name: "Start builds" }));
        await waitFor(() => expect(args.onClose).toHaveBeenCalled());
    },
};
