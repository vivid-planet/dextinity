import type { Decorator } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";

import { Theme } from "../components/theme/Theme";
import { brandSetting } from "./brand";
import { useAppliedColorScheme } from "./colorScheme";
import { densitySetting } from "./density";

function ToolbarTheme({ children }: PropsWithChildren) {
    return (
        <Theme colorScheme={useAppliedColorScheme()} brand={brandSetting.useValue()} density={densitySetting.useValue()}>
            {children}
        </Theme>
    );
}

/**
 * Wraps a story in {@link Theme} with the color scheme, brand, and density picked in the toolbar. Opt in per story file through
 * `meta.decorators`.
 */
export const themeDecorator: Decorator = (Story) => (
    <ToolbarTheme>
        <Story />
    </ToolbarTheme>
);
