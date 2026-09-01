import { ChevronDown, ChevronRight, ChevronUp } from "@comet/admin-icons";
import { type ButtonBase, type ComponentsOverrides, type Popover as MuiPopover, type Typography, useMediaQuery } from "@mui/material";
import { type Theme, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";

import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import type { BreadcrumbsClassKey } from "./Breadcrumbs.slots";
import { DesktopBreadcrumbs } from "./DesktopBreadcrumbs";
import { MobileBreadcrumbs } from "./MobileBreadcrumbs";

export interface Breadcrumb {
    url: string;
    title: ReactNode;
}

export interface BreadcrumbsProps
    extends ThemedComponentBaseProps<{
        root: "div";
        item: typeof Typography;
        activeItem: typeof Typography;
        separator: "div";
        ellipsis: typeof Typography;
        overflowButton: typeof ButtonBase;
        overflowMenu: typeof MuiPopover;
        overflowMenuItem: "a";
        menuContainer: "div";
        toolbarContainer: "div";
        expandedMenu: "div";
        expandedMenuItem: typeof Typography;
        expandedMenuActiveItem: typeof Typography;
        expandedMenuActiveItemWrapper: "div";
        pageTreeVerticalLine: "div";
        expandedMenuSubitemWrapper: "div";
        mobileMenuIcon: "div";
        mobileRootButton: typeof ButtonBase;
    }> {
    items: Breadcrumb[];
    iconMapping?: { separator?: ReactNode; openMenu?: ReactNode; closeMenu?: ReactNode };
}

export type BreadcrumbsSlotProps = BreadcrumbsProps["slotProps"];

export const Breadcrumbs = (inProps: BreadcrumbsProps) => {
    const { iconMapping = {}, ...restProps } = useThemeProps({ props: inProps, name: "CometAdminBreadcrumbs" });
    const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));

    const {
        separator: separatorIcon = <ChevronRight />,
        openMenu: openMenuIcon = <ChevronDown />,
        closeMenu: closeMenuIcon = <ChevronUp />,
    } = iconMapping;

    if (isDesktop) {
        return <DesktopBreadcrumbs separatorIcon={separatorIcon} {...restProps} />;
    }

    return <MobileBreadcrumbs separatorIcon={separatorIcon} openMenuIcon={openMenuIcon} closeMenuIcon={closeMenuIcon} {...restProps} />;
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        CometAdminBreadcrumbs: BreadcrumbsProps;
    }

    interface ComponentNameToClassKey {
        CometAdminBreadcrumbs: BreadcrumbsClassKey;
    }

    interface Components {
        CometAdminBreadcrumbs?: {
            defaultProps?: Partial<ComponentsPropsList["CometAdminBreadcrumbs"]>;
            styleOverrides?: ComponentsOverrides<Theme>["CometAdminBreadcrumbs"];
        };
    }
}
