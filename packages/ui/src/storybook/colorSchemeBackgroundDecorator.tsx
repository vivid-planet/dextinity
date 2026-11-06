import "./colorSchemeBackground.scss";

import type { Decorator } from "@storybook/react-vite";
import { type PropsWithChildren, useEffect } from "react";

import { brandSetting } from "./brand";
import { useAppliedColorScheme } from "./colorScheme";

function ColorSchemeBackground({ children }: PropsWithChildren) {
    const colorScheme = useAppliedColorScheme();
    const brand = brandSetting.useValue();

    useEffect(() => {
        document.body.dataset.dextinityColorScheme = colorScheme;
        document.body.dataset.dextinityBrand = brand;
    }, [colorScheme, brand]);

    return children;
}

export const colorSchemeBackgroundDecorator: Decorator = (Story) => (
    <ColorSchemeBackground>
        <Story />
    </ColorSchemeBackground>
);
