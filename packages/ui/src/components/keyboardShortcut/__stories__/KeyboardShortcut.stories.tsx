import type { Meta, StoryObj } from "@storybook/react-vite";

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
        children: "⌘K",
    },
    argTypes: {
        className: { control: false },
    },
} satisfies Meta<typeof KeyboardShortcut>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Named keys are written out in short form.
 */
export const NamedKey: Story = {
    args: {
        children: "Esc",
    },
};

/**
 * A sequence of keys pressed one after another gets one `KeyboardShortcut` per key.
 */
export const Sequence: Story = {
    render: () => (
        <span className={styles.row}>
            <KeyboardShortcut>G</KeyboardShortcut>
            <KeyboardShortcut>P</KeyboardShortcut>
        </span>
    ),
};
