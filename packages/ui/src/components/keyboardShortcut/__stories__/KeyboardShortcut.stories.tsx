import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { KeyboardShortcut } from "../KeyboardShortcut";
import keyboardShortcutTokens from "../KeyboardShortcut.tokens.scss?raw";
import styles from "./KeyboardShortcut.stories.module.scss";

const meta = {
    component: KeyboardShortcut,
    title: "Building blocks/Status, tags & badges/KeyboardShortcut",
    decorators: [themeDecorator],
    parameters: { tokens: keyboardShortcutTokens },
    args: {
        shortcut: "mod+k",
    },
    argTypes: {
        shortcut: { control: "text" },
        platform: { control: "inline-radio", options: ["apple", "other"] },
        children: { control: false },
        labels: { control: false },
        className: { control: false },
    },
} satisfies Meta<typeof KeyboardShortcut>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * `shortcut` takes the notation of `useKeyboardShortcut`: `mod` shows as ⌘ on Apple platforms and as Ctrl elsewhere, and screen
 * readers read the keys' names, e.g. "Command K". The toolbar's keyboard platform switches all stories between the two.
 */
export const Default: Story = {};

/**
 * On Apple platforms the modifiers are symbols in Apple's order, without separators.
 */
export const Apple: Story = {
    args: { shortcut: "shift+mod+n", platform: "apple" },
    play: async ({ canvasElement }) => {
        const shortcut = canvasElement.querySelector("kbd");
        await expect(shortcut?.querySelector("[aria-hidden]")).toHaveTextContent("⇧⌘N");
        await expect(shortcut).toHaveTextContent("Shift Command N");
    },
};

/**
 * On Windows and Linux the modifiers are written out and joined with `+`.
 */
export const WindowsAndLinux: Story = {
    name: "Windows & Linux",
    args: { shortcut: "shift+mod+n", platform: "other" },
    play: async ({ canvasElement }) => {
        const shortcut = canvasElement.querySelector("kbd");
        await expect(shortcut?.querySelector("[aria-hidden]")).toHaveTextContent("Ctrl+Shift+N");
        await expect(shortcut).toHaveTextContent("Control Shift N");
    },
};

/**
 * Named keys are written out in short form, and spoken in full.
 */
export const NamedKey: Story = {
    args: {
        shortcut: "Escape",
    },
};

/**
 * `labels` names the keys for screen readers, e.g. in the application's language. A `KeyboardShortcutProvider` sets them for
 * every shortcut inside.
 */
export const CustomLabels: Story = {
    args: {
        shortcut: "mod+s",
        platform: "other",
        labels: { control: "Steuerung" },
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByText("Steuerung S")).toBeInTheDocument();
    },
};

/**
 * `children` shows fixed text for what the notation doesn't cover. A sequence of keys pressed one after another gets one
 * `KeyboardShortcut` per key.
 */
export const Sequence: Story = {
    render: () => (
        <span className={styles.row}>
            <KeyboardShortcut>G</KeyboardShortcut>
            <KeyboardShortcut>P</KeyboardShortcut>
        </span>
    ),
};
