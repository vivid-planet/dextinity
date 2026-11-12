import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { KeyboardKey } from "../KeyboardKey";
import keyboardKeyTokens from "../KeyboardKey.tokens.scss?raw";
import styles from "./KeyboardKey.stories.module.scss";

const meta = {
    component: KeyboardKey,
    title: "Building blocks/Status, tags & badges/KeyboardKey",
    decorators: [themeDecorator],
    parameters: { tokens: keyboardKeyTokens },
    args: {
        children: "⌘K",
    },
    argTypes: {
        className: { control: false },
    },
} satisfies Meta<typeof KeyboardKey>;

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
 * A sequence of keys pressed one after another gets one `KeyboardKey` per key.
 */
export const Sequence: Story = {
    render: () => (
        <span className={styles.row}>
            <KeyboardKey>G</KeyboardKey>
            <KeyboardKey>P</KeyboardKey>
        </span>
    ),
};
