import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorkspaceShell } from "../WorkspaceShell";

/**
 * Open it on its own, without the Storybook around it: `iframe.html?id=workspace-shell--shell&viewMode=story`.
 */
const meta = {
    title: "Workbench/Shell",
    // The story ids stay as before the rename, so that links and what the browser stored for them keep working
    id: "workspace-shell",
    component: WorkspaceShell,
    // The shell loads other stories into its frame, so a test would test those again
    tags: ["!autodocs", "!manifest", "!test"],
    parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta<typeof WorkspaceShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Shell: Story = {};
