import { LevelUp } from "@dextinity/admin-icons";
import { IconButton as MuiIconButton } from "@mui/material";
import { type ComponentsOverrides, css, type Theme, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";

import { BreadcrumbLink } from "../../common/breadcrumbs/BreadcrumbLink";
import { Breadcrumbs, type BreadcrumbsProps } from "../../common/breadcrumbs/Breadcrumbs";
import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { useStackApi } from "../Api";

export type StackBreadcrumbsClassKey = "root" | "backButton" | "backButtonSeparator";

const Root = createComponentSlot(Breadcrumbs)<StackBreadcrumbsClassKey>({
    componentName: "StackBreadcrumbs",
    slotName: "root",
})(
    ({ theme }) => css`
        border-bottom: 1px solid ${theme.palette.divider};
        box-sizing: border-box;

        // The bottom border above replaces the divider the breadcrumbs draw on mobile, which stops short of the padding.
        &::after {
            content: none;
        }
    `,
);

const BackButton = createComponentSlot(MuiIconButton)<StackBreadcrumbsClassKey>({
    componentName: "StackBreadcrumbs",
    slotName: "backButton",
})() as typeof MuiIconButton;

const BackButtonSeparator = createComponentSlot("div")<StackBreadcrumbsClassKey>({
    componentName: "StackBreadcrumbs",
    slotName: "backButtonSeparator",
})(
    ({ theme }) => css`
        height: 30px;
        width: 1px;
        background-color: ${theme.palette.divider};
        margin-left: 12px;
    `,
);

export interface StackBreadcrumbsProps
    extends ThemedComponentBaseProps<{
        root: typeof Breadcrumbs;
        backButton: typeof MuiIconButton;
        backButtonSeparator: "div";
    }> {
    iconMapping?: BreadcrumbsProps["iconMapping"] & { backButton?: ReactNode };
}

export function StackBreadcrumbs(inProps: StackBreadcrumbsProps) {
    const { iconMapping = {}, slotProps, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminStackBreadcrumbs" });
    const { backButton: backButtonIcon = <LevelUp />, ...breadcrumbsIconMapping } = iconMapping;
    const stackApi = useStackApi();

    const items = stackApi?.breadCrumbs ?? [];
    const backButtonUrl = items.length > 1 ? items[items.length - 2].url : undefined;

    return (
        <Root
            items={items}
            iconMapping={breadcrumbsIconMapping}
            startAdornment={
                backButtonUrl && (
                    <>
                        {/* @ts-expect-error The component prop does not work properly with MUIs `styled()`, see: https://mui.com/material-ui/guides/typescript/#complications-with-the-component-prop */}
                        <BackButton component={BreadcrumbLink} to={backButtonUrl} {...slotProps?.backButton}>
                            {backButtonIcon}
                        </BackButton>
                        <BackButtonSeparator {...slotProps?.backButtonSeparator} />
                    </>
                )
            }
            {...slotProps?.root}
            {...restProps}
        />
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminStackBreadcrumbs: StackBreadcrumbsClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminStackBreadcrumbs: StackBreadcrumbsProps;
    }

    interface Components {
        DextinityAdminStackBreadcrumbs?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminStackBreadcrumbs"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminStackBreadcrumbs"];
        };
    }
}
