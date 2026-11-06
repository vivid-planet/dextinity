import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import toolbarTokens from "../_tokens.scss?raw";
import { Toolbar } from "../Toolbar";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarGroup } from "../ToolbarGroup";
import styles from "./Toolbar.stories.module.scss";

const meta = {
    component: ToolbarGroup,
    title: "Building blocks/Buttons/ToolbarGroup",
    decorators: [
        (Story) => (
            <div className={styles.surface}>
                <Toolbar aria-label="Formatting">
                    <Story />
                </Toolbar>
            </div>
        ),
        themeDecorator,
    ],
    parameters: { tokens: toolbarTokens },
    args: {
        "aria-label": "Lists",
        children: (
            <>
                <ToolbarButton aria-label="Bulleted list" onClick={fn()}>
                    <Icon name="list" />
                </ToolbarButton>
                <ToolbarButton aria-label="Numbered list" onClick={fn()}>
                    <Icon name="rte-ol" />
                </ToolbarButton>
            </>
        ),
    },
    argTypes: {
        disabled: { control: "boolean" },
        children: { control: false },
        className: { control: false },
    },
} satisfies Meta<typeof ToolbarGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Groups related controls under a name.
 */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("group", { name: "Lists" })).toBeVisible();
    },
};

/**
 * Disables only the group's controls, e.g. lists inside a heading.
 */
export const Disabled: Story = {
    args: { disabled: true },
};
