import type { ComponentsOverrides } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import { type GridDensity, Toolbar, type ToolbarProps, useGridApiContext } from "@mui/x-data-grid";

import { createComponentSlot } from "../../helpers/createComponentSlot";

export type DataGridToolbarClassKey = "root" | GridDensity;

export type DataGridToolbarProps = ToolbarProps;

type OwnerState = {
    density: GridDensity;
};

export const DataGridToolbar = (inProps: DataGridToolbarProps) => {
    const props = useThemeProps({ props: inProps, name: "DextinityAdminDataGridToolbar" });
    const apiRef = useGridApiContext();
    const gridDensity = apiRef.current.state.density;

    const ownerState: OwnerState = {
        density: gridDensity,
    };

    return <Root ownerState={ownerState} {...props} />;
};

const Root = createComponentSlot(Toolbar)<DataGridToolbarClassKey, OwnerState>({
    componentName: "DataGridToolbar",
    slotName: "root",
    classesResolver(ownerState) {
        return [ownerState.density];
    },
})(
    ({ ownerState, theme }) => css`
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: start;
        align-items: center;
        min-height: auto;
        gap: ${theme.spacing(2)};
        padding: ${theme.spacing(2)};
        border-bottom: none;
        box-shadow: ${theme.shadows[1]};

        ${ownerState.density === "comfortable" &&
        css`
            ${theme.breakpoints.up("sm")} {
                padding-top: ${theme.spacing(4)};
                padding-bottom: ${theme.spacing(4)};
            }
        `}
    `,
);

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminDataGridToolbar: DataGridToolbarClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminDataGridToolbar: DataGridToolbarProps;
    }

    interface Components {
        DextinityAdminDataGridToolbar?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDataGridToolbar"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDataGridToolbar"];
        };
    }
}
