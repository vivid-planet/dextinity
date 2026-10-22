import type { Meta, StoryObj } from "@storybook/react-vite";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { Button } from "../../button/Button";
import { Typography } from "../../typography/Typography";
import { Theme } from "../Theme";
import styles from "./themeOverrides.module.scss";

const colorSchemes = ["light", "dark", "high-contrast"];

const meta: Meta<typeof Theme> = {
    component: Theme,
    title: "Future UI/Theme",
    argTypes: {
        colorScheme: { control: "select", options: colorSchemes },
    },
    args: {
        colorScheme: "light",
    },
};

export default meta;

type Story = StoryObj<typeof Theme>;

function ExampleContent() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
            <Typography variant="headline">Themed headline</Typography>
            <Typography variant="body">Body text follows the active theme.</Typography>
            <div style={{ display: "flex", gap: "1rem" }}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
            </div>
        </div>
    );
}

function ThemeSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: Dispatch<SetStateAction<string>>;
}) {
    return (
        <label style={{ display: "inline-flex", gap: "0.5rem", marginRight: "1rem", marginBottom: "1rem" }}>
            {label}
            <select value={value} onChange={(event) => onChange(event.target.value)}>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </label>
    );
}

function useSystemColorScheme() {
    const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const update = () => setColorScheme(mediaQuery.matches ? "dark" : "light");

        update();
        mediaQuery.addEventListener("change", update);
        return () => mediaQuery.removeEventListener("change", update);
    }, []);

    return colorScheme;
}

/**
 * Wrap an application, or a section of one, once. The components inside resolve
 * their tokens from the color scheme it supplies.
 */
export const Default: Story = {
    render: (args) => (
        <Theme {...args}>
            <ExampleContent />
        </Theme>
    ),
};

function SystemColorSchemeSwitcher() {
    const [choice, setChoice] = useState("system");
    const systemColorScheme = useSystemColorScheme();
    const colorScheme = choice === "system" ? systemColorScheme : choice;

    return (
        <div>
            <ThemeSelect label="Appearance" value={choice} options={["light", "dark", "system"]} onChange={setChoice} />
            <Theme colorScheme={colorScheme}>
                <ExampleContent />
            </Theme>
        </div>
    );
}

/**
 * "system" is resolved by the consumer: `matchMedia` maps the OS scheme onto an
 * explicit `colorScheme`. The library ships no "system" scheme.
 */
export const SwitchSystemColorScheme: Story = {
    render: () => <SystemColorSchemeSwitcher />,
    parameters: { controls: { disable: true } },
};

/**
 * A consumer remaps the brand primary color to a different primitive. The
 * override is unlayered, so it wins over the shipped tokens (which live in
 * `@layer dextinity`) and cascades to every component that reads the primary color
 * — without touching the primitive layer.
 */
export const OverrideBrandToken: Story = {
    render: () => (
        <Theme className={styles.brandPrimaryOverride}>
            <ExampleContent />
        </Theme>
    ),
    parameters: { controls: { disable: true } },
};
