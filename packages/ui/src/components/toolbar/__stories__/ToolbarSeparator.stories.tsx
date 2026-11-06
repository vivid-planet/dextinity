import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import toolbarTokens from "../_tokens.scss?raw";
import { Toolbar } from "../Toolbar";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarSeparator } from "../ToolbarSeparator";
import styles from "./Toolbar.stories.module.scss";

const meta = {
    component: ToolbarSeparator,
    title: "Building blocks/Buttons/ToolbarSeparator",
    decorators: [
        (Story) => (
            <div className={styles.surface}>
                <Toolbar aria-label="Formatting">
                    <ToolbarButton aria-label="Bold" onClick={fn()}>
                        <Icon name="bold" />
                    </ToolbarButton>
                    <Story />
                    <ToolbarButton aria-label="Link" onClick={fn()}>
                        <Icon name="link" />
                    </ToolbarButton>
                </Toolbar>
            </div>
        ),
        themeDecorator,
    ],
    parameters: { tokens: toolbarTokens },
    argTypes: {
        className: { control: false },
    },
} satisfies Meta<typeof ToolbarSeparator>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Separates groups of controls.
 */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
    },
};
