import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import kbdTokens from "../_tokens.scss?raw";
import { Kbd } from "../Kbd";
import styles from "./Kbd.stories.module.scss";

const meta = {
    component: Kbd,
    title: "Building blocks/Status, tags & badges/Kbd",
    decorators: [themeDecorator],
    parameters: { tokens: kbdTokens },
    args: {
        children: "⌘K",
    },
    argTypes: {
        className: { control: false },
    },
} satisfies Meta<typeof Kbd>;

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
 * A sequence of keys pressed one after another gets one `Kbd` per key.
 */
export const Sequence: Story = {
    render: () => (
        <span className={styles.row}>
            <Kbd>G</Kbd>
            <Kbd>P</Kbd>
        </span>
    ),
};
