import type { Decorator } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";

import { Theme } from "../components/theme/Theme";
import { useToolbarBrand } from "./brand";
import { useAppliedColorScheme } from "./colorScheme";

function AppliedColorSchemeTheme({ children }: PropsWithChildren) {
    return (
        <Theme colorScheme={useAppliedColorScheme()} brand={useToolbarBrand()}>
            {children}
        </Theme>
    );
}

/**
 * Wraps a story in {@link Theme} with the color scheme and brand picked in the toolbar. Opt in per story file through `meta.decorators`.
 */
export const themeDecorator: Decorator = (Story) => (
    <AppliedColorSchemeTheme>
        <Story />
    </AppliedColorSchemeTheme>
);
