import type { Decorator } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";

import { Theme } from "../components/theme/Theme";
import { useToolbarBrand } from "./brand";
import { useToolbarColorScheme } from "./colorScheme";

/**
 * Renders its children in a {@link Theme} with the brand and the color scheme picked in the toolbar.
 */
export function ToolbarTheme({ children }: PropsWithChildren) {
    return (
        <Theme colorScheme={useToolbarColorScheme()} brand={useToolbarBrand()}>
            {children}
        </Theme>
    );
}

/**
 * Wraps a story in {@link Theme} with the brand and the color scheme picked in the toolbar. Opt in per story file through `meta.decorators`.
 */
export const themeDecorator: Decorator = (Story) => (
    <ToolbarTheme>
        <Story />
    </ToolbarTheme>
);
