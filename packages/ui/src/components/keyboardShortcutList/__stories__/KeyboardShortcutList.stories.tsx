import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { KeyboardShortcutProvider } from "../../keyboardShortcut/keyboardShortcutPlatform";
import { KeyboardShortcutList } from "../KeyboardShortcutList";
import keyboardShortcutListTokens from "../KeyboardShortcutList.tokens.scss?raw";

const meta = {
    component: KeyboardShortcutList,
    title: "Patterns/Keyboard shortcuts/KeyboardShortcutList",
    decorators: [themeDecorator],
    parameters: { tokens: keyboardShortcutListTokens },
    args: {
        keyboardShortcuts: [
            { keyboardShortcut: "mod+k", description: "Command palette" },
            { keyboardShortcut: "mod+\\", description: "Collapse or expand the navigation" },
            { keyboardShortcut: "/", description: "Search the list" },
            { keyboardShortcut: "?", description: "Show keyboard shortcuts" },
            { keyboardShortcut: "Escape", description: "Close, clear the selection" },
        ],
    },
    argTypes: {
        keyboardShortcuts: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof KeyboardShortcutList>;

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
 * A `KeyboardShortcutProvider` sets the platform for every shortcut inside, here Apple: ⌘ and the other modifiers as symbols.
 */
export const Apple: Story = {
    decorators: [
        (Story) => (
            <KeyboardShortcutProvider platform="apple">
                <Story />
            </KeyboardShortcutProvider>
        ),
    ],
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("cell", { name: "Command K" })).toBeVisible();
        await expect(canvas.getByRole("cell", { name: "Command K" }).querySelector("[aria-hidden]")).toHaveTextContent("⌘K");
    },
};

/**
 * On Windows and Linux, `mod` shows as Ctrl and the keys are joined with `+`.
 */
export const WindowsAndLinux: Story = {
    name: "Windows & Linux",
    decorators: [
        (Story) => (
            <KeyboardShortcutProvider platform="other">
                <Story />
            </KeyboardShortcutProvider>
        ),
    ],
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("cell", { name: "Control K" })).toBeVisible();
        await expect(canvas.getByRole("cell", { name: "Control K" }).querySelector("[aria-hidden]")).toHaveTextContent("Ctrl+K");
    },
};

/**
 * Several shortcuts in one row are read as a list: alternatives, or one per part of the description, e.g. cut and paste. `keys`
 * shows fixed key caps for what the notation doesn't cover.
 */
export const SeveralShortcuts: Story = {
    args: {
        keyboardShortcuts: [
            { keyboardShortcut: ["mod+x", "mod+v"], description: "Cut and paste (page tree)" },
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
        keyboardShortcuts: [{ keyboardShortcut: "mod+s", description: "Speichern" }],
    },
};
