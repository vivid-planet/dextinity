import { ArrowLeft } from "@dextinity/admin-icons";
import { type ComponentsOverrides, IconButton as MuiIconButton, type Theme } from "@mui/material";
import { css, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { createComponentSlot } from "../../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../../helpers/ThemedComponentBaseProps";
import { useStackApi } from "../../../stack/Api";
import { ToolbarItem as CommonToolbarItem } from "../item/ToolbarItem";

export type ToolbarBackButtonClassKey = "root" | "iconButton" | "toolbarItem";

const Root = createComponentSlot("div")<ToolbarBackButtonClassKey>({
    componentName: "ToolbarBackButton",
    slotName: "root",
})(css`
    flex: 0;
    display: flex;

    .DextinityAdminToolbarItem-root {
        padding: 0;
    }
`);

const IconButton = createComponentSlot(MuiIconButton<typeof Link>)<ToolbarBackButtonClassKey>({
    componentName: "ToolbarBackButton",
    slotName: "iconButton",
})(
    ({ theme }) => css`
        padding: ${theme.spacing(1)};
        margin: auto;
        height: fit-content;

        ${theme.breakpoints.up("sm")} {
            padding: ${theme.spacing(2)};
        }
    `,
);

const ToolbarItem = createComponentSlot(CommonToolbarItem)<ToolbarBackButtonClassKey>({
    componentName: "ToolbarBackButton",
    slotName: "toolbarItem",
})(css`
    flex: 0;
    display: flex;
    align-items: stretch;
`);

export interface ToolbarBackButtonProps extends ThemedComponentBaseProps<{
    root: "div";
    toolbarItem: typeof ToolbarItem;
    iconButton: typeof MuiIconButton<typeof Link>;
}> {
    backIcon?: ReactNode;
}

export const ToolbarBackButton = (inProps: ToolbarBackButtonProps) => {
    const {
        backIcon = <ArrowLeft sx={{ fontSize: 24 }} />,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminToolbarBackButton" });
    const stackApi = useStackApi();

    if (!stackApi || stackApi.breadCrumbs.length <= 1) {
        return null;
    }

    const backUrl = stackApi.breadCrumbs[stackApi.breadCrumbs.length - 2].url;

    return (
        <Root {...slotProps?.root} {...restProps}>
            <ToolbarItem {...slotProps?.toolbarItem}>
                <IconButton component={Link} to={backUrl} size="large" {...slotProps?.iconButton}>
                    {backIcon}
                </IconButton>
            </ToolbarItem>
        </Root>
    );
};

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminToolbarBackButton: ToolbarBackButtonClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminToolbarBackButton: ToolbarBackButtonProps;
    }

    interface Components {
        DextinityAdminToolbarBackButton?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminToolbarBackButton"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminToolbarBackButton"];
        };
    }
}
