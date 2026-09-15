import { ChevronDown, ChevronRight, ChevronUp } from "@dextinity/admin-icons";
import { type ButtonBase, type Popover as MuiPopover, type Typography, useMediaQuery } from "@mui/material";
import { type ComponentsOverrides, type Theme, useTheme, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";

import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import type { BreadcrumbLink } from "./BreadcrumbLink";
import { type BreadcrumbsClassKey, Root, StartAdornment } from "./Breadcrumbs.slots";
import { DesktopBreadcrumbs } from "./DesktopBreadcrumbs";
import { MobileBreadcrumbs } from "./MobileBreadcrumbs";

export interface Breadcrumb {
    url: string;
    title: ReactNode;
}

export interface BreadcrumbsProps
    extends ThemedComponentBaseProps<{
        root: "div";
        startAdornment: "div";
        item: typeof Typography;
        activeItem: typeof Typography;
        separator: "div";
        ellipsis: typeof Typography;
        overflowButton: typeof ButtonBase;
        overflowMenu: typeof MuiPopover;
        overflowMenuItem: typeof BreadcrumbLink;
        menuContainer: "div";
        toolbarContainer: "div";
        expandedMenu: "div";
        expandedMenuItem: typeof Typography;
        expandedMenuActiveItem: typeof Typography;
        expandedMenuActiveItemWrapper: typeof BreadcrumbLink;
        pageTreeVerticalLine: "div";
        expandedMenuSubitemWrapper: typeof BreadcrumbLink;
        mobileMenuIcon: "div";
        mobileRootButton: typeof ButtonBase;
    }> {
    items: Breadcrumb[];
    /**
     * Rendered at the start of the breadcrumbs, before the items, for instance a back button or a scope indicator.
     */
    startAdornment?: ReactNode;
    iconMapping?: { separator?: ReactNode; openMenu?: ReactNode; closeMenu?: ReactNode };
}

export type BreadcrumbsSlotProps = BreadcrumbsProps["slotProps"];

export const Breadcrumbs = (inProps: BreadcrumbsProps) => {
    const { iconMapping = {}, items, startAdornment, slotProps, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminBreadcrumbs" });
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

    const {
        separator: separatorIcon = <ChevronRight />,
        openMenu: openMenuIcon = <ChevronDown />,
        closeMenu: closeMenuIcon = <ChevronUp />,
    } = iconMapping;

    if (!items.length) {
        // The start adornment does not belong to the trail: the scope indicator of the toolbar has to stay visible on pages without breadcrumbs.
        return startAdornment ? (
            <Root {...slotProps?.root} {...restProps}>
                <StartAdornment {...slotProps?.startAdornment}>{startAdornment}</StartAdornment>
            </Root>
        ) : null;
    }

    if (isDesktop) {
        return (
            <DesktopBreadcrumbs items={items} startAdornment={startAdornment} slotProps={slotProps} separatorIcon={separatorIcon} {...restProps} />
        );
    }

    return (
        <MobileBreadcrumbs
            items={items}
            startAdornment={startAdornment}
            slotProps={slotProps}
            separatorIcon={separatorIcon}
            openMenuIcon={openMenuIcon}
            closeMenuIcon={closeMenuIcon}
            {...restProps}
        />
    );
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminBreadcrumbs: BreadcrumbsProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminBreadcrumbs: BreadcrumbsClassKey;
    }

    interface Components {
        DextinityAdminBreadcrumbs?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminBreadcrumbs"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminBreadcrumbs"];
        };
    }
}
