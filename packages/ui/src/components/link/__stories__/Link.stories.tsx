import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import linkTokens from "../_tokens.scss?raw";
import { Link } from "../Link";

const iconOptions = {
    ArrowRight: <Icon name="arrow-right" />,
    ArrowLeft: <Icon name="arrow-left" />,
    ChevronRight: <Icon name="chevron-right" />,
};

const meta = {
    component: Link,
    title: "Building blocks/Page header, breadcrumbs & links/Link",
    decorators: [themeDecorator],
    parameters: { tokens: linkTokens },
    args: {
        children: "Page tree",
        href: "#page-tree",
        onClick: fn((event) => event.preventDefault()),
    },
    argTypes: {
        color: { control: "radio", options: ["secondary", "accent"] },
        startIcon: { control: "select", options: Object.keys(iconOptions), mapping: iconOptions },
        endIcon: { control: "select", options: Object.keys(iconOptions), mapping: iconOptions },
        className: { control: false },
        slotProps: { control: false },
        render: { control: false },
        labels: { control: false },
    },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - The link text says where it goes.
 * - Don't write "Click here".
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("link", { name: "Page tree" }));
        await expect(args.onClick).toHaveBeenCalled();
    },
};

/**
 * A "go to" link next to a heading, e.g. in a card header. The arrow nudges forward on hover.
 */
export const WithArrow: Story = {
    args: { endIcon: <Icon name="arrow-right" /> },
};

/**
 * A back link, e.g. in the label line of an edit page header. The arrow nudges back on hover.
 */
export const Back: Story = {
    args: { startIcon: <Icon name="arrow-left" /> },
};

/**
 * Within text and breadcrumbs.
 */
export const Accent: Story = {
    args: { color: "accent", children: "Teaser grid" },
};

/**
 * Opens a new tab, shows the external-link icon, and tells assistive technology about the new tab.
 */
export const External: Story = {
    args: { external: true, children: "example.com/careers", href: "https://example.com/careers" },
    play: async ({ canvas }) => {
        const link = canvas.getByRole("link", { name: /^example.com\/careers.*opens in a new tab/ });
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    },
};

/**
 * Tab reaches the link; the focus ring shows where it is.
 */
export const Keyboard: Story = {
    play: async ({ canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("link")).toHaveFocus();
    },
};
