import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeExampleContent } from "../../../storybook/ThemeExampleContent";
import { Theme } from "../Theme";
import styles from "./nestedTheme.module.scss";

const colorSchemes = ["light", "dark", "high-contrast"];

const meta: Meta<typeof Theme> = {
    component: Theme,
    title: "Foundations/Theme/Theme",
    argTypes: {
        colorScheme: { control: "select", options: colorSchemes },
        brand: { control: "select", options: ["dextinity", "ai-hub"] },
        density: { control: "radio", options: ["comfortable", "standard", "compact"] },
    },
    args: {
        colorScheme: "light",
    },
};

export default meta;

type Story = StoryObj<typeof Theme>;

export const Default: Story = {
    render: (args) => (
        <Theme {...args}>
            <ThemeExampleContent />
        </Theme>
    ),
};

/**
 * A `Theme` can contain other `Theme`s, at any depth. For details, see [Theme → Overview](?path=/docs/foundations-theme-overview--docs).
 */
export const Nested: Story = {
    render: (args) => (
        <Theme {...args}>
            <div className={styles.frame}>
                <ThemeExampleContent />
                <Theme brand="sunset">
                    <div className={styles.frame}>
                        <ThemeExampleContent />
                    </div>
                </Theme>
            </div>
        </Theme>
    ),
};
