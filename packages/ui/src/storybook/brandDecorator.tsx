import type { Decorator } from "@storybook/react-vite";
import { type PropsWithChildren, useEffect } from "react";

import { useToolbarBrand } from "./brand";

function ToolbarBrand({ children }: PropsWithChildren) {
    const brand = useToolbarBrand();

    useEffect(() => {
        document.body.dataset.dextinityBrand = brand;
    }, [brand]);

    return children;
}

export const brandDecorator: Decorator = (Story) => (
    <ToolbarBrand>
        <Story />
    </ToolbarBrand>
);
