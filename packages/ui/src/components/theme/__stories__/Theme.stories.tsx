import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeExampleContent } from "../../../storybook/ThemeExampleContent";
import tokens from "../../../theme/brands/_dextinity.scss?raw";
import { Theme } from "../Theme";
import styles from "./nestedTheme.module.scss";

const colorSchemes = ["light", "dark", "high-contrast"];
const brands = ["dextinity", "ai-hub"];
const densities = ["comfortable", "standard", "compact"];

const meta: Meta<typeof Theme> = {
    component: Theme,
    title: "Foundations/Tokens/Theme",
    parameters: {
        tokens,
        rules: {
            dos: [
                "One `Theme` around the application; nest another one only for a part with another color scheme or brand.",
                "A new brand overrides only the brand tokens that differ.",
                "Components use semantic, brand, and component tokens, never primitive colors directly.",
            ],
            donts: ["Own hex values instead of tokens.", "Colors per application – between applications, only the logo and the brand differ."],
        },
    },
    argTypes: {
        colorScheme: { control: "select", options: colorSchemes },
        brand: { control: "radio", options: brands },
        density: { control: "radio", options: densities },
        className: { control: false },
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
 * A `Theme` can contain other `Theme`s, at any depth. For details, see [Tokens → Overview](?path=/docs/foundations-tokens-overview--docs).
 */
export const Nested: Story = {
    render: (args) => (
        <Theme {...args}>
            <div className={styles.frame}>
                <ThemeExampleContent />
                <Theme className={styles.sunsetBrand}>
                    <div className={styles.frame}>
                        <ThemeExampleContent />
                    </div>
                </Theme>
            </div>
        </Theme>
    ),
};

/**
 * `brand` selects one of the two brands. AI Hub differs from Dextinity only in its primary color, so the components of both look like one family.
 */
export const Brands: Story = {
    render: (args) => (
        <div className={styles.brands}>
            <Theme {...args} brand="dextinity">
                <ThemeExampleContent />
            </Theme>
            <Theme {...args} brand="ai-hub">
                <ThemeExampleContent />
            </Theme>
        </div>
    ),
};

/**
 * `density` sets the size of controls, rows, and the space between fields. Text keeps its size.
 */
export const Densities: Story = {
    render: (args) => (
        <div className={styles.brands}>
            <Theme {...args} density="comfortable">
                <ThemeExampleContent />
            </Theme>
            <Theme {...args} density="standard">
                <ThemeExampleContent />
            </Theme>
            <Theme {...args} density="compact">
                <ThemeExampleContent />
            </Theme>
        </div>
    ),
};
