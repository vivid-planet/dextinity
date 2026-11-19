import { ChevronDown, ChevronRight, ChevronUp } from "@dextinity/admin-icons";
import { ButtonBase, type ComponentsOverrides, css, ListItemText, Menu, MenuItem, type Theme, Typography, useThemeProps } from "@mui/material";
import { Fragment, type ReactNode, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { useStackApi } from "../../stack/Api";
import { useObservedWidth } from "../../utils/useObservedWidth";

export type ToolbarBreadcrumbsClassKey =
    | "root"
    | "breadcrumbsList"
    | "mobileBreadcrumbsButton"
    | "currentBreadcrumbsItem"
    | "breadcrumbsItem"
    | "mobileStandaloneCurrentBreadcrumbItem"
    | "breadcrumbsItemSeparator"
    | "breadcrumbsEllipsisItem"
    | "mobileMenu"
    | "mobileMenuIcon"
    | "mobileMenuItem"
    | "mobileMenuItemText"
    | "mobileMenuItemNestingIndicator";

export interface ToolbarBreadcrumbsProps extends ThemedComponentBaseProps<{
    root: "div";
    breadcrumbsList: "div";
    mobileBreadcrumbsButton: typeof ButtonBase;
    currentBreadcrumbsItem: typeof Typography;
    breadcrumbsItem: typeof Typography;
    mobileStandaloneCurrentBreadcrumbItem: "div";
    breadcrumbsItemSeparator: "div";
    breadcrumbsEllipsisItem: typeof Typography;
    mobileMenu: typeof Menu;
    mobileMenuIcon: "div";
    mobileMenuItem: typeof MenuItem;
    mobileMenuItemText: typeof ListItemText;
    mobileMenuItemNestingIndicator: "div";
}> {
    iconMapping?: {
        itemSeparator?: ReactNode;
        openMobileMenu?: ReactNode;
        closeMobileMenu?: ReactNode;
    };
}

export const ToolbarBreadcrumbs = (inProps: ToolbarBreadcrumbsProps) => {
    const { iconMapping = {}, slotProps, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminToolbarBreadcrumbs" });
    const {
        itemSeparator: itemSeparatorIcon = <ChevronRight />,
        openMobileMenu: openMobileMenuIcon = <ChevronDown />,
        closeMobileMenu: closeMobileMenuIcon = <ChevronUp />,
    } = iconMapping;
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const stackApi = useStackApi();

    const breadcrumbs = stackApi?.breadCrumbs ?? [];
    const menuWidth = useObservedWidth(rootRef);

    const toggleMobileMenu = () => {
        setShowMobileMenu((val) => !val);
    };

    const itemSeparator = <BreadcrumbsItemSeparator>{itemSeparatorIcon}</BreadcrumbsItemSeparator>;

    const lastBreadcrumbTitle = breadcrumbs.length ? breadcrumbs[breadcrumbs.length - 1].title : null;
    const currentBreadcrumbItem = (
        <CurrentBreadcrumbsItem variant="body2" {...slotProps?.currentBreadcrumbsItem}>
            {lastBreadcrumbTitle}
        </CurrentBreadcrumbsItem>
    );

    return (
        <>
            <Root ref={rootRef} {...slotProps?.root} {...restProps}>
                <BreadcrumbsList {...slotProps?.breadcrumbsList}>
                    {breadcrumbs.map(({ title, url }, index) => {
                        const isCurrentPage = index === breadcrumbs.length - 1;

                        const commonItemProps = {
                            variant: "body2",
                            title: typeof title === "string" ? title : undefined,
                        } as const;

                        return (
                            <Fragment key={index}>
                                {isCurrentPage ? (
                                    <CurrentBreadcrumbsItem {...commonItemProps} {...slotProps?.currentBreadcrumbsItem}>
                                        {title}
                                    </CurrentBreadcrumbsItem>
                                ) : (
                                    <>
                                        <BreadcrumbsItem
                                            {...commonItemProps}
                                            {...slotProps?.breadcrumbsItem}
                                            // @ts-expect-error The component prop does not work properly with MUIs `styled()`, see: https://mui.com/material-ui/guides/typescript/#complications-with-the-component-prop
                                            component={RouterLink}
                                            to={url}
                                        >
                                            {title}
                                        </BreadcrumbsItem>
                                        {itemSeparator}
                                    </>
                                )}
                            </Fragment>
                        );
                    })}
                </BreadcrumbsList>
                {breadcrumbs.length > 1 ? (
                    <MobileBreadcrumbsButton disableRipple {...slotProps?.mobileBreadcrumbsButton} onClick={toggleMobileMenu}>
                        <>
                            <BreadcrumbsEllipsisItem variant="body2" {...slotProps?.breadcrumbsEllipsisItem}>
                                …
                            </BreadcrumbsEllipsisItem>
                            {itemSeparator}
                        </>
                        {currentBreadcrumbItem}
                        <MobileMenuIcon {...slotProps?.mobileMenuIcon}>{showMobileMenu ? closeMobileMenuIcon : openMobileMenuIcon}</MobileMenuIcon>
                    </MobileBreadcrumbsButton>
                ) : (
                    <MobileStandaloneCurrentBreadcrumbItem {...slotProps?.mobileStandaloneCurrentBreadcrumbItem}>
                        {currentBreadcrumbItem}
                    </MobileStandaloneCurrentBreadcrumbItem>
                )}
            </Root>
            <MobileMenu
                open={showMobileMenu}
                anchorEl={rootRef.current}
                onClose={toggleMobileMenu}
                {...slotProps?.mobileMenu}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                    ...slotProps?.mobileMenu?.anchorOrigin,
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                    ...slotProps?.mobileMenu?.transformOrigin,
                }}
                MenuListProps={{
                    component: "div",
                    ...slotProps?.mobileMenu?.MenuListProps,
                }}
                PaperProps={{
                    ...slotProps?.mobileMenu?.PaperProps,
                    sx: {
                        width: menuWidth,
                        ...slotProps?.mobileMenu?.PaperProps?.sx,
                    },
                }}
            >
                {breadcrumbs.map(({ title, url }, nestingLevel) => {
                    const isCurrentPage = nestingLevel === breadcrumbs.length - 1;

                    return (
                        <MobileMenuItem
                            {...slotProps?.mobileMenuItem}
                            key={nestingLevel}
                            onClick={toggleMobileMenu}
                            selected={isCurrentPage}
                            // @ts-expect-error The component prop does not work properly with MUIs `styled()`, see: https://mui.com/material-ui/guides/typescript/#complications-with-the-component-prop
                            component={RouterLink}
                            to={url}
                        >
                            {nestingLevel > 0 && (
                                <MobileMenuItemNestingIndicator {...slotProps?.mobileMenuItemNestingIndicator} ownerState={{ nestingLevel }} />
                            )}
                            <MobileMenuItemText {...slotProps?.mobileMenuItemText} primary={title} ownerState={{ isCurrentPage }} />
                        </MobileMenuItem>
                    );
                })}
            </MobileMenu>
        </>
    );
};

const Root = createComponentSlot("div")<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "root",
})(
    ({ theme }) => css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing(2)};
    `,
);

const BreadcrumbsList = createComponentSlot("div")<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "breadcrumbsList",
})(
    ({ theme }) => css`
        display: none;
        align-items: center;
        gap: ${theme.spacing(1)};
        overflow: hidden;

        ${theme.breakpoints.up("md")} {
            display: flex;
        }
    `,
);

const MobileBreadcrumbsButton = createComponentSlot(ButtonBase)<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "mobileBreadcrumbsButton",
})(
    ({ theme }) => css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing(1)};
        flex-grow: 1;
        overflow: hidden;
        padding-top: ${theme.spacing(2)};
        padding-bottom: ${theme.spacing(2)};

        ${theme.breakpoints.up("md")} {
            display: none;
        }
    `,
);

const MobileStandaloneCurrentBreadcrumbItem = createComponentSlot("div")<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "mobileStandaloneCurrentBreadcrumbItem",
})(
    ({ theme }) => css`
        ${theme.breakpoints.up("md")} {
            display: none;
        }
    `,
);

const getCommonItemStyles = (theme: Theme) => css`
    color: ${theme.palette.grey[900]};
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    ${theme.breakpoints.up("md")} {
        padding-top: ${theme.spacing(2)};
        padding-bottom: ${theme.spacing(2)};
    }
`;

const CurrentBreadcrumbsItem = createComponentSlot(Typography)<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "currentBreadcrumbsItem",
})(
    ({ theme }) => css`
        ${getCommonItemStyles(theme)}
        font-weight: 600;
    `,
) as typeof Typography;

const BreadcrumbsItem = createComponentSlot(Typography)<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "breadcrumbsItem",
})(
    ({ theme }) => css`
        ${getCommonItemStyles(theme)}

        ${theme.breakpoints.up("md")} {
            display: block;
        }
    `,
);

const BreadcrumbsItemSeparator = createComponentSlot("div")<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "breadcrumbsItemSeparator",
})(
    ({ theme }) => css`
        line-height: 0;
        display: none;

        :nth-last-of-type(2) {
            display: block;
        }

        ${theme.breakpoints.up("md")} {
            display: block;
        }
    `,
);

const BreadcrumbsEllipsisItem = createComponentSlot(Typography)<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "breadcrumbsEllipsisItem",
})(
    ({ theme }) => css`
        color: ${theme.palette.grey[900]};
        text-decoration: underline;
        padding: ${theme.spacing(1)};
        margin-left: ${theme.spacing(-1)};
        margin-right: ${theme.spacing(-1)};
        cursor: pointer;

        ${theme.breakpoints.up("md")} {
            display: none;
        }
    `,
);

const MobileMenu = createComponentSlot(Menu)<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "mobileMenu",
})(
    ({ theme }) => css`
        .MuiPopover-paper {
            min-width: 220px;
        }

        .MuiMenu-list {
            padding-top: ${theme.spacing(3)};
            padding-bottom: ${theme.spacing(3)};
        }
    `,
);

const MobileMenuIcon = createComponentSlot("div")<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "mobileMenuIcon",
})(css`
    margin-left: auto;
    line-height: 0;
`);

const MobileMenuItem = createComponentSlot(MenuItem)<ToolbarBreadcrumbsClassKey>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "mobileMenuItem",
})(
    ({ theme }) => css`
        position: relative;
        min-height: auto;
        padding-left: ${theme.spacing(3)};
        padding-right: ${theme.spacing(3)};
        padding-top: 8px;
        padding-bottom: 8px;

        :hover,
        &.Mui-selected,
        &.Mui-focusVisible,
        &.Mui-selected.Mui-focusVisible,
        &.Mui-selected:hover {
            background-color: ${theme.palette.grey[50]};
        }
    `,
);

const MobileMenuItemText = createComponentSlot(ListItemText)<ToolbarBreadcrumbsClassKey, { isCurrentPage: boolean }>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "mobileMenuItemText",
})(
    ({ ownerState }) => css`
        .MuiListItemText-primary {
            font-weight: ${ownerState.isCurrentPage ? 600 : 300};
            text-overflow: ellipsis;
            overflow: hidden;
        }
    `,
);

const MobileMenuItemNestingIndicator = createComponentSlot("div")<ToolbarBreadcrumbsClassKey, { nestingLevel: number }>({
    componentName: "ToolbarBreadcrumbs",
    slotName: "mobileMenuItemNestingIndicator",
})(
    ({ theme, ownerState }) => css`
        position: relative;
        margin-left: ${17 * ownerState.nestingLevel}px;
        width: 12px;
        flex-shrink: 0;

        :before {
            content: "";
            position: absolute;
            top: -18px;
            left: 0;
            width: 5px;
            height: 15px;
            border-width: 0 0 1px 1px;
            border-style: solid;
            border-color: ${theme.palette.grey[100]};
            box-sizing: border-box;
        }
    `,
);

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
