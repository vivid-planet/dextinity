import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import breadcrumbsTokens from "../_tokens.scss?raw";
import { Breadcrumbs } from "../Breadcrumbs";

const meta = {
    component: Breadcrumbs,
    title: "Building blocks/Page header, breadcrumbs & links/Breadcrumbs",
    decorators: [themeDecorator],
    parameters: { tokens: breadcrumbsTokens },
    args: {
        items: [{ label: "Page", href: "#page" }, { label: "Teaser grid", href: "#teaser-grid" }, { label: "Teaser 2" }],
        separator: "›",
    },
    argTypes: {
        separator: { control: "radio", options: ["/", "›", "·"] },
        variant: { control: "radio", options: ["default", "label"] },
        items: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The path to a nested block in the edit panel. Earlier levels lead back up, the current level is plain text.
 *
 * **Rules**
 *
 * - The last level is the current page and never a link.
 * - Breadcrumbs and the back link lead to the same place.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("navigation", { name: "Breadcrumbs" })).toBeInTheDocument();
        await expect(canvas.getAllByRole("link")).toHaveLength(2);
        await expect(canvas.getByText("Teaser 2")).toHaveAttribute("aria-current", "page");
    },
};

/**
 * The mono label line above a page title, e.g. the area and the scope of the page.
 */
export const Label: Story = {
    args: {
        variant: "label",
        separator: "·",
        items: [{ label: "Page tree", href: "#page-tree" }, { label: "Page" }],
    },
};

/**
 * Levels with `onClick` navigate with the router instead of following `href`.
 */
export const WithClickHandlers: Story = {
    args: {
        items: [
            { label: "Page", href: "#page", onClick: fn() },
            { label: "Teaser grid", href: "#teaser-grid", onClick: fn() },
            { label: "Teaser 2" },
        ],
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("link", { name: "Teaser grid" }));
        await expect(args.items[1].onClick).toHaveBeenCalled();
    },
};

/**
 * Deep paths keep the first level and the last ones; the levels in between move into a menu.
 */
export const Collapsed: Story = {
    args: {
        items: [
            { label: "Page", href: "#page" },
            { label: "Teaser grid", href: "#teaser-grid", onClick: fn() },
            { label: "Teaser 2", href: "#teaser-2" },
            { label: "Columns", href: "#columns" },
            { label: "Text" },
        ],
    },
    play: async ({ args, canvas, canvasElement }) => {
        await expect(canvas.getAllByRole("link").map((link) => link.textContent)).toStrictEqual(["Page", "Columns"]);
        await userEvent.click(canvas.getByRole("button", { name: "Show hidden levels" }));
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(await body.findByRole("menuitem", { name: "Teaser grid" }));
        await expect(args.items[1].onClick).toHaveBeenCalled();
    },
};

/**
 * Tab moves through the links; the current level is not focusable.
 */
export const Keyboard: Story = {
    play: async ({ canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("link", { name: "Page" })).toHaveFocus();
        await userEvent.tab();
        await expect(canvas.getByRole("link", { name: "Teaser grid" })).toHaveFocus();
    },
};
