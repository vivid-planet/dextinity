import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { ShortcutList } from "../ShortcutList";
import shortcutListTokens from "../ShortcutList.tokens.scss?raw";

const meta = {
    component: ShortcutList,
    title: "Patterns/Keyboard/ShortcutList",
    decorators: [themeDecorator],
    parameters: { tokens: shortcutListTokens },
    args: {
        shortcuts: [
            { keys: ["⌘", "K"], description: "Command palette" },
            { keys: ["⌘", "\\"], description: "Collapse or expand the navigation" },
            { keys: ["/"], description: "Search the list" },
            { keys: ["?"], description: "Show keyboard shortcuts" },
            { keys: ["Esc"], description: "Close, clear the selection" },
        ],
    },
    argTypes: {
        shortcuts: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof ShortcutList>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Use the operating system's shortcut where one exists.
 * - Show shortcuts in tooltips and menus too, not only here.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("columnheader", { name: "Key" })).toBeVisible();
        await expect(canvas.getByRole("cell", { name: "Command palette" })).toBeVisible();
    },
};

/**
 * A sequence lists all of its keys, e.g. cut and paste.
 */
export const Sequence: Story = {
    args: {
        shortcuts: [
            { keys: ["⌘", "X", "⌘", "V"], description: "Cut and paste (page tree)" },
            { keys: ["Right-click"], description: "Move to … (finder)" },
        ],
    },
};

/**
 * The column headers come from `labels`, so the application translates them.
 */
export const CustomLabels: Story = {
    args: {
        labels: { keys: "Taste", description: "Wirkung" },
        shortcuts: [{ keys: ["⌘", "S"], description: "Speichern" }],
    },
};
