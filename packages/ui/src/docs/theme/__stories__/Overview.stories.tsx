import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import { Theme } from "../../../components/theme/Theme";
import { ThemeExampleContent } from "../../../storybook/ThemeExampleContent";
import styles from "./overview.module.scss";

const meta = {
    title: "Theme/Overview",
    tags: ["!dev", "!autodocs", "!manifest"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

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

function SystemColorSchemeSwitcher() {
    const [choice, setChoice] = useState("system");
    const systemColorScheme = useSystemColorScheme();
    const colorScheme = choice === "system" ? systemColorScheme : choice;

    return (
        <div>
            <label className={styles.appearance}>
                Appearance
                <select value={choice} onChange={(event) => setChoice(event.target.value)} className={styles.appearanceSelect}>
                    {["light", "dark", "system"].map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </label>
            <Theme colorScheme={colorScheme}>
                <ThemeExampleContent />
            </Theme>
        </div>
    );
}

export const SwitchSystemColorScheme: Story = {
    render: () => <SystemColorSchemeSwitcher />,
};
