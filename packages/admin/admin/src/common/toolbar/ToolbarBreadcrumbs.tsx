import { type ComponentsOverrides, css, type Theme, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { useStackApi } from "../../stack/Api";
import { Breadcrumbs, type BreadcrumbsProps } from "../breadcrumbs/Breadcrumbs";

export type ToolbarBreadcrumbsClassKey = "root";

const Root = createComponentSlot(Breadcrumbs)<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "root",
})(css`
    // The surrounding toolbar already provides the horizontal padding and the divider below the top bar.
    padding: 0;

    &::after {
        content: none;
    }

    // The breadcrumbs of a toolbar are a single row in its 40px top bar, not the taller bar the generic component draws
    // from sm upwards. The doubled selector outranks that breakpoint, which the merged class emits after this rule.
    && {
        height: 40px;
    }

    & .DextinityAdminBreadcrumbs-toolbarContainer {
        height: 40px;
    }
`);

export interface ToolbarBreadcrumbsProps
    extends ThemedComponentBaseProps<{
        root: typeof Breadcrumbs;
    }> {
    /**
     * Rendered at the start of the breadcrumbs, before the items, for instance a scope indicator.
     */
    startAdornment?: ReactNode;
    iconMapping?: BreadcrumbsProps["iconMapping"];
}

export const ToolbarBreadcrumbs = (inProps: ToolbarBreadcrumbsProps) => {
    const { iconMapping, startAdornment, slotProps, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminToolbarBreadcrumbs" });
    const stackApi = useStackApi();

    return <Root items={stackApi?.breadCrumbs ?? []} iconMapping={iconMapping} startAdornment={startAdornment} {...slotProps?.root} {...restProps} />;
};

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminToolbarBreadcrumbs: ToolbarBreadcrumbsClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminToolbarBreadcrumbs: ToolbarBreadcrumbsProps;
    }

    interface Components {
        DextinityAdminToolbarBreadcrumbs?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminToolbarBreadcrumbs"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminToolbarBreadcrumbs"];
        };
    }
}
