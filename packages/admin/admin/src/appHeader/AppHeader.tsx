import { AppBar as MuiAppBar, type AppBarClassKey, capitalize, type ComponentsOverrides, css, type Theme, useThemeProps } from "@mui/material";
import type { AppBarProps } from "@mui/material/AppBar";
import { type CSSProperties, useContext } from "react";

import { createComponentSlot } from "../helpers/createComponentSlot";
import { MasterLayoutContext } from "../mui/MasterLayoutContext";

interface AppHeaderProps extends AppBarProps {
    /**
     * A custom height should only be set, if used outside of MasterLayout.
     */
    headerHeight?: number;
}

export type AppHeaderClassKey = AppBarClassKey;

type OwnerState = {
    position: AppBarProps["position"];
    color: AppBarProps["color"];
};

const AppHeaderRoot = createComponentSlot(MuiAppBar)<AppHeaderClassKey, OwnerState>({
    componentName: "AppHeader",
    slotName: "root",
    classesResolver(ownerState) {
        return [
            ownerState.position && `position${capitalize(ownerState.position)}`,
            ownerState.color && `color${capitalize(ownerState.color)}`,
        ] as AppHeaderClassKey[];
    },
})(
    ({ theme }) => css`
        background-color: ${theme.palette.grey.A400};
        color: white;
        height: var(--header-height);
        flex-direction: row;
        align-items: center;
    `,
);

export const AppHeader = (inProps: AppHeaderProps) => {
    const props = useThemeProps({ props: inProps, name: "DextinityAdminAppHeader" });
    const { children, headerHeight: passedHeaderHeight, position = "fixed", color = "primary", ...restProps } = props;

    const { headerHeight: masterLayoutHeaderHeight } = useContext(MasterLayoutContext);
    const headerHeight = passedHeaderHeight === undefined ? masterLayoutHeaderHeight : passedHeaderHeight;

    const ownerState: OwnerState = {
        position,
        color,
    };

    return (
        <AppHeaderRoot
            position={position}
            color={color}
            ownerState={ownerState}
            {...restProps}
            style={{ "--header-height": `${headerHeight}px` } as CSSProperties}
        >
            {children}
        </AppHeaderRoot>
    );
};

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminAppHeader: AppHeaderClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminAppHeader: AppHeaderProps;
    }

    interface Components {
        DextinityAdminAppHeader?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminAppHeader"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminAppHeader"];
        };
    }
}
