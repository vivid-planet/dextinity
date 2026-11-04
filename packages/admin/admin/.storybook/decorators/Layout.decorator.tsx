import { MainContent } from "../../src/common/MainContent";
import { useTheme } from "@mui/material";
import { GlobalStyles } from "@mui/system";
import { type Decorator } from "@storybook/react-vite";

import { previewGlobalStyles } from "./Layout.decorator.styles";

export enum LayoutOption {
    Default = "default",
    Padded = "padded",
}

export const LayoutDecorator: Decorator = (fn, context) => {
    const { layout: selectedLayout } = context.globals;

    const theme = useTheme();
    return (
        <div>
            <GlobalStyles styles={previewGlobalStyles(theme)} />

            {selectedLayout === LayoutOption.Padded ? <MainContent>{fn()}</MainContent> : fn()}
        </div>
    );
};
