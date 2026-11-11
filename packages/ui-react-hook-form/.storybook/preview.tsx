import "@fontsource-variable/inter";
import "@dextinity/ui/css";
import "@dextinity/ui/css/icons";
import "./preview.css";

import { Theme, type ThemeColorScheme, type ThemeDensity } from "@dextinity/ui";
import type { Decorator, Preview } from "@storybook/react-vite";
import { type PropsWithChildren, useEffect } from "react";

interface StoryThemeProps {
    colorScheme: ThemeColorScheme;
    density: ThemeDensity;
}

// The body carries the color scheme and brand too, so the canvas around the story gets the theme's background
function StoryTheme({ colorScheme, density, children }: PropsWithChildren<StoryThemeProps>) {
    useEffect(() => {
        document.body.dataset.dextinityColorScheme = colorScheme;
        document.body.dataset.dextinityBrand = "dextinity";
    }, [colorScheme]);

    return (
        <Theme colorScheme={colorScheme} density={density}>
            {children}
        </Theme>
    );
}

const themeDecorator: Decorator = (Story, { globals }) => (
    <StoryTheme colorScheme={globals.colorScheme ?? "light"} density={globals.density ?? "standard"}>
        <Story />
    </StoryTheme>
);

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [themeDecorator],
    globalTypes: {
        colorScheme: {
            description: "Color scheme of the @dextinity/ui Theme",
            toolbar: {
                title: "Color scheme",
                icon: "mirror",
                items: [
                    { value: "light", title: "Light mode" },
                    { value: "dark", title: "Dark mode" },
                    { value: "high-contrast", title: "High contrast mode" },
                ],
                dynamicTitle: true,
            },
        },
        density: {
            description: "Density of the @dextinity/ui Theme",
            toolbar: {
                title: "Density",
                icon: "component",
                items: [
                    { value: "compact", title: "Compact" },
                    { value: "standard", title: "Standard" },
                    { value: "comfortable", title: "Comfortable" },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { colorScheme: "light", density: "standard" },
    parameters: {
        options: {
            storySort: { order: ["Example form", "Field arrays", "FieldAdapterConfigProvider", "Fields"] },
        },
    },
};

export default preview;
