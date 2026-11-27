import { Header } from "@src/layout/header/Header";
import { navigationNodes } from "@src/storybook/pageTreeFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

const meta: Meta<typeof Header> = {
    title: "Layout/Header",
    component: Header,
    parameters: {
        layout: "fullscreen",
        nextjs: { appDirectory: true, navigation: { pathname: "/en/products" } },
    },
    args: {
        header: { items: navigationNodes.map((node) => ({ id: node.id, node })) },
    },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Desktop: Story = {
    globals: { viewport: { value: "desktop" } },
};

export const Mobile: Story = {
    globals: { viewport: { value: "mobile1" } },
};

export const ToggleSubmenu: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const [desktopToggle] = canvas.getAllByRole("button", { name: "Submenu of About us" });

        await expect(desktopToggle).toHaveAttribute("aria-expanded", "false");
        // A click would also hover the menu item, which opens the submenu before the click toggles it closed again.
        desktopToggle.focus();
        await userEvent.keyboard("{Enter}");
        await expect(desktopToggle).toHaveAttribute("aria-expanded", "true");
    },
};

export const Links: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getAllByRole("link", { name: "About us", hidden: true })[0]).toHaveAttribute("href", "/en/about-us");
        await expect(canvas.getAllByRole("link", { name: "Blog", hidden: true })[0]).toHaveAttribute("href", "https://www.dextinity.com");
    },
};
