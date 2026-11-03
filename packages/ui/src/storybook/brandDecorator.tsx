import "./crimsonBrand.scss";

import type { Decorator } from "@storybook/react-vite";
import { type PropsWithChildren, useEffect } from "react";

import { useToolbarBrand } from "./brand";

function ToolbarBrand({ children }: PropsWithChildren) {
    const brand = useToolbarBrand();

    useEffect(() => {
        document.documentElement.dataset.storybookBrand = brand;
    }, [brand]);

    return children;
}

export const brandDecorator: Decorator = (Story) => (
    <ToolbarBrand>
        <Story />
    </ToolbarBrand>
);
