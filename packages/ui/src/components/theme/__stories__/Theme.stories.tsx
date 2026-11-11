import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { ThemeExampleContent } from "../../../storybook/ThemeExampleContent";
import { Theme } from "../Theme";
import styles from "./Theme.stories.module.scss";

const meta = {
    component: Theme,
    title: "Foundations/Theme/Theme",
    argTypes: {
        colorScheme: { control: "radio", options: ["light", "dark", "high-contrast"] },
        brand: { control: "select", options: ["dextinity", "ai-hub"] },
        density: { control: "radio", options: ["comfortable", "standard", "compact"] },
        className: { control: false },
    },
    render: (args) => (
        <Theme {...args}>
            <ThemeExampleContent />
        </Theme>
    ),
} satisfies Meta<typeof Theme>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dark: Story = {
    args: { colorScheme: "dark" },
};

export const HighContrast: Story = {
    args: { colorScheme: "high-contrast" },
};

/**
 * Dextinity AI Hub: like Dextinity, with the accent from the AI Hub logo.
 */
export const AiHub: Story = {
    args: { brand: "ai-hub" },
};

export const Compact: Story = {
    args: { density: "compact" },
};

/**
 * Themes nest: each `Theme` resolves all tokens against its own brand, color scheme, and density.
 */
export const Nested: Story = {
    render: () => (
        <Theme>
            <div className={styles.nested}>
                <ThemeExampleContent />
                <Theme colorScheme="dark" brand="ai-hub">
                    <ThemeExampleContent />
                </Theme>
                <Theme brand="ai-hub" density="comfortable">
                    <ThemeExampleContent />
                </Theme>
            </div>
        </Theme>
    ),
};

/**
 * A nested `Theme` with another color scheme resolves the values that differ per color scheme against its own, e.g. a light preview
 * inside a high-contrast application.
 */
export const NestedInHighContrast: Story = {
    render: () => (
        <Theme colorScheme="high-contrast" data-testid="high-contrast">
            <div className={styles.nested}>
                <ThemeExampleContent />
                <Theme data-testid="light">
                    <ThemeExampleContent />
                </Theme>
            </div>
        </Theme>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const token = (testId: string, name: string) => getComputedStyle(canvas.getByTestId(testId)).getPropertyValue(name).trim();

        await expect(token("high-contrast", "--dextinity-field-actions-idle-opacity")).toBe("1");
        await expect(token("light", "--dextinity-field-actions-idle-opacity")).toBe("0.55");
        await expect(token("high-contrast", "--dextinity-toast-success-icon-color")).toContain("color-mix");
        await expect(token("light", "--dextinity-toast-success-icon-color")).not.toContain("color-mix");
    },
};
