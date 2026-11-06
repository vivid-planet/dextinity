import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { Typography } from "../../typography/Typography";
import { Theme } from "../Theme";
import styles from "./Theme.stories.module.scss";

const meta = {
    component: Theme,
    title: "Foundations/Theme",
    argTypes: {
        colorScheme: { control: "radio", options: ["light", "dark", "high-contrast"] },
        brand: { control: "select", options: ["dextinity", "ai-hub", "cms"] },
        density: { control: "radio", options: ["comfortable", "standard", "compact"] },
        className: { control: false },
    },
    render: (args) => (
        <Theme {...args}>
            <ExampleContent />
        </Theme>
    ),
} satisfies Meta<typeof Theme>;

export default meta;

type Story = StoryObj<typeof meta>;

function ExampleContent() {
    return (
        <div className={styles.example}>
            <Typography variant="label">Structured content</Typography>
            <Typography variant="displayL">Job postings</Typography>
            <Typography>Body text follows the active brand, color scheme, and density.</Typography>
            <div className={styles.actions}>
                <Button startIcon={<Icon name="check" />}>Save</Button>
                <Button variant="outlined" color="secondary" startIcon={<Icon name="search" />}>
                    Preview
                </Button>
                <Button variant="text">Cancel</Button>
            </div>
        </div>
    );
}

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
                <ExampleContent />
                <Theme colorScheme="dark" brand="ai-hub">
                    <ExampleContent />
                </Theme>
                <Theme brand="cms" density="comfortable">
                    <ExampleContent />
                </Theme>
            </div>
        </Theme>
    ),
};
