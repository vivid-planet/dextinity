import "./colorSchemeBackground.scss";

import type { Decorator } from "@storybook/react-vite";
import { type PropsWithChildren, useEffect } from "react";

import { useAppliedColorScheme } from "./colorScheme";

function ColorSchemeBackground({ children }: PropsWithChildren) {
    const colorScheme = useAppliedColorScheme();

    useEffect(() => {
        document.body.dataset.dextinityColorScheme = colorScheme;
    }, [colorScheme]);

    return children;
}

export const colorSchemeBackgroundDecorator: Decorator = (Story) => (
    <ColorSchemeBackground>
        <Story />
    </ColorSchemeBackground>
);
