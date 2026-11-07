import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
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

export const ClearsTheSelectionAfterStarting: Story = {
    render: function Render(args) {
        const [open, setOpen] = useState(true);
        return (
            <>
                <button type="button" onClick={() => setOpen(true)}>
                    Open again
                </button>
                <StartBuildsDialog
                    open={open}
                    onClose={() => {
                        args.onClose();
                        setOpen(false);
                    }}
                />
            </>
        );
    },
    play: async ({ args }) => {
        const checkbox = await screen.findByRole("checkbox", { name: /^Build Template 2\b/ });
        await userEvent.click(checkbox);
        await expect(checkbox).toBeChecked();
        await userEvent.click(screen.getByRole("button", { name: "Start builds" }));
        await waitFor(() => expect(args.onClose).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        await userEvent.click(screen.getByRole("button", { name: "Open again" }));
        await expect(await screen.findByRole("checkbox", { name: /^Build Template 2\b/ })).not.toBeChecked();
    },
};

export const KeepsTheSelectionWhenTheParentRerenders: Story = {
    render: function Render(args) {
        const [renderCount, setRenderCount] = useState(0);
        useEffect(() => {
            const interval = setInterval(() => setRenderCount((count) => count + 1), 100);
            return () => clearInterval(interval);
        }, []);
        return (
            <div data-render-count={renderCount}>
                <StartBuildsDialog {...args} />
            </div>
        );
    },
    play: async () => {
        const checkbox = await screen.findByRole("checkbox", { name: /^Build Template 2\b/ });
        await userEvent.click(checkbox);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await expect(checkbox).toBeChecked();
    },
};
