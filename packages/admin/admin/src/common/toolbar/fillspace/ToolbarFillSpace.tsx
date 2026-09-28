import type { ComponentsOverrides } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";

import { createComponentSlot } from "../../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../../helpers/ThemedComponentBaseProps";

export type ToolbarFillSpaceClassKey = "root";

export interface ToolbarFillSpaceProps extends ThemedComponentBaseProps {
    children?: ReactNode;
}

const Root = createComponentSlot("div")<ToolbarFillSpaceClassKey>({
    componentName: "ToolbarFillSpace",
    slotName: "root",
})(css`
    flex-grow: 1;
`);

/**
 * @deprecated Use `FillSpace` instead.
 */
export const ToolbarFillSpace = (inProps: ToolbarFillSpaceProps) => {
    const { children, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminToolbarFillSpace" });
    return <Root {...restProps}>{children}</Root>;
};

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminToolbarFillSpace: ToolbarFillSpaceClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminToolbarFillSpace: ToolbarFillSpaceProps;
    }

    interface Components {
        DextinityAdminToolbarFillSpace?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminToolbarFillSpace"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminToolbarFillSpace"];
        };
    }
}
