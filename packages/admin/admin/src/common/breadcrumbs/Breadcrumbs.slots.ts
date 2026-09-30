import { ButtonBase, Popover as MuiPopover, Typography } from "@mui/material";
import { alpha, css, styled, type Theme } from "@mui/material/styles";

import { createComponentSlot } from "../../helpers/createComponentSlot";

export type BreadcrumbsClassKey =
    | "root"
    | "item"
    | "activeItem"
    | "separator"
    | "ellipsis"
    | "overflowButton"
    | "overflowMenu"
    | "overflowMenuItem"
    | "menuContainer"
    | "toolbarContainer"
    | "expandedMenu"
    | "expandedMenuItem"
    | "expandedMenuActiveItem"
    | "expandedMenuActiveItemWrapper"
    | "pageTreeVerticalLine"
    | "expandedMenuSubitemWrapper"
    | "mobileMenuIcon"
    | "mobileRootButton";

export const Root = createComponentSlot("div")<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "root",
})(
    ({ theme }) => css`
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        padding: 0 ${theme.spacing(2)};
        cursor: pointer;

        &::after {
            content: "";
            position: absolute;
            left: ${theme.spacing(2)};
            right: ${theme.spacing(2)};
            bottom: 0;
            height: 1px;
            background-color: ${theme.palette.grey[100]};
        }

        ${theme.breakpoints.up("sm")} {
            height: 50px;
            cursor: default;

            &::after {
                content: none;
            }
        }
    `,
);

export const Item = createComponentSlot(Typography)<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "item",
})(
    ({ theme }) => css`
        color: ${theme.palette.grey[900]};
        white-space: nowrap;

        &:not(:last-child):hover {
            color: ${theme.palette.primary.main};
        }

        &:last-child {
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `,
) as typeof Typography;

export const ActiveItem = createComponentSlot(Typography)<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "activeItem",
})(
    ({ theme }) => css`
        color: ${theme.palette.grey[900]};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
        line-height: 16px;
        font-weight: 600;

        ${theme.breakpoints.up("sm")} {
            font-size: 16px;
            line-height: 20px;
            font-weight: bold;
        }
    `,
) as typeof Typography;

export const Separator = createComponentSlot("div")<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "separator",
})(css`
    margin: 0 5px;
    display: flex;
    align-items: flex-end;
`);

/**
 * Content of the `Ellipsis` slot. It labels the overflow button on desktop and replaces all parent items on mobile.
 */
export const ellipsisLabel = ". . .";

export const Ellipsis = createComponentSlot(Typography)<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "ellipsis",
})(
    ({ theme }) => css`
        margin-right: 5px;
        color: inherit;
        font-size: 14px;
        line-height: 16px;

        ${theme.breakpoints.up("sm")} {
            font-size: 16px;
            line-height: 20px;
        }
    `,
);

export const OverflowButton = createComponentSlot(ButtonBase)<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "overflowButton",
})(
    ({ theme }) => css`
        color: ${theme.palette.grey[900]};

        &:hover {
            color: ${theme.palette.primary.main};
        }
    `,
);

export const OverflowMenu = createComponentSlot(MuiPopover)<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "overflowMenu",
})(
    ({ theme }) => css`
        & .MuiPaper-root {
            min-width: 220px;
            padding: 10px 0;
            border-radius: 4px;
            background-color: ${theme.palette.background.paper};
            box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1);
        }
    `,
);

export const OverflowMenuItem = createComponentSlot("a")<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "overflowMenuItem",
})(
    ({ theme }) => css`
        display: flex;
        gap: 10px;
        align-items: center;
        height: 35px;
        padding: 8px 15px;
        color: ${theme.palette.grey[900]};
        text-decoration: none;

        & > svg {
            font-size: 16px;
        }

        &:hover {
            color: ${theme.palette.primary.main};
        }
    `,
);

type MenuContainerOwnerState = { isCurrentItem: boolean };

export const MenuContainer = createComponentSlot("div")<BreadcrumbsClassKey, MenuContainerOwnerState>({
    componentName: "Breadcrumbs",
    slotName: "menuContainer",
})(
    ({ ownerState }) => css`
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-shrink: ${ownerState.isCurrentItem ? 1 : 0};
        min-width: ${ownerState.isCurrentItem ? 0 : "auto"};
    `,
);

export const MeasureLayer = styled("div")`
    position: absolute;
    display: flex;
    width: max-content;
    visibility: hidden;
    pointer-events: none;
    height: 0;
    overflow: hidden;
    white-space: nowrap;
`;

export const ToolbarContainer = createComponentSlot("div")<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "toolbarContainer",
})(
    ({ theme }) => css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        padding: 0;

        ${theme.breakpoints.up("sm")} {
            flex: 1;
            min-width: 0;
            justify-content: flex-start;
            overflow: hidden;
            height: 50px;
        }
    `,
);

export const ExpandedMenu = createComponentSlot("div")<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "expandedMenu",
})(
    ({ theme }) => css`
        position: absolute;
        left: 0;
        right: 0;
        top: 100%;
        display: flex;
        flex-direction: column;
        background-color: ${theme.palette.background.paper};
        z-index: 1;
    `,
);

export const ExpandedMenuItem = createComponentSlot(Typography)<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "expandedMenuItem",
})(
    ({ theme }) => css`
        color: ${theme.palette.grey[900]};
    `,
) as typeof Typography;

export const ExpandedMenuActiveItem = createComponentSlot(Typography)<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "expandedMenuActiveItem",
})(
    ({ theme }) => css`
        color: ${theme.palette.grey[900]};
    `,
) as typeof Typography;

type WrapperOwnerState = { indentation: number };

const wrapperPaddingLeft = (theme: Theme, indentation: number) =>
    indentation === 0 ? theme.spacing(3) : `calc(${theme.spacing(1)} + 17px * ${indentation})`;

export const ExpandedMenuActiveItemWrapper = createComponentSlot("div")<BreadcrumbsClassKey, WrapperOwnerState>({
    componentName: "Breadcrumbs",
    slotName: "expandedMenuActiveItemWrapper",
})(
    ({ theme, ownerState }) => css`
        display: flex;
        align-items: center;
        gap: 5px;
        height: 45px;
        padding-left: ${wrapperPaddingLeft(theme, ownerState.indentation)};
        padding-right: ${theme.spacing(3)};
        background-color: ${alpha(theme.palette.primary.main, 0.1)};
    `,
);

export const ExpandedMenuSubitemWrapper = createComponentSlot("div")<BreadcrumbsClassKey, WrapperOwnerState>({
    componentName: "Breadcrumbs",
    slotName: "expandedMenuSubitemWrapper",
})(
    ({ theme, ownerState }) => css`
        display: flex;
        align-items: center;
        gap: 5px;
        height: 45px;
        padding-left: ${wrapperPaddingLeft(theme, ownerState.indentation)};
        padding-right: ${theme.spacing(3)};
    `,
);

export const MobileMenuIcon = createComponentSlot("div")<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "mobileMenuIcon",
})(css`
    display: flex;
    align-items: center;
`);

export const MobileRootButton = createComponentSlot(ButtonBase)<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "mobileRootButton",
})(css`
    display: block;
    width: 100%;
    text-align: left;
`);

export const PageTreeVerticalLine = createComponentSlot("div")<BreadcrumbsClassKey>({
    componentName: "Breadcrumbs",
    slotName: "pageTreeVerticalLine",
})(
    ({ theme }) => css`
        width: 4px;
        height: 25px;
        border-left: 1px solid ${theme.palette.grey[100]};
        border-bottom: 1px solid ${theme.palette.grey[100]};
        align-self: flex-start;
    `,
);
