import { ChevronRight } from "@dextinity/admin-icons";
import { type ComponentsOverrides, css, type Theme, useTheme, useThemeProps } from "@mui/material/styles";
import type Typography from "@mui/material/Typography";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { Link } from "react-router-dom";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { useObservedWidth } from "../../utils/useObservedWidth";
import { useStackApi } from "../Api";
import { getElementOuterWidth, useItemsToRender } from "./utils";

export type StackBreadcrumbsClassKey =
    | "root"
    | "breadcrumbs"
    | "listItem"
    | "link"
    | "disabledLink"
    | "overflowLink"
    | "separator"
    | "backButton"
    | "backButtonSeparator";

const Root = createComponentSlot("div")<StackBreadcrumbsClassKey>({
    componentName: "StackBreadcrumbs",
    slotName: "root",
})(css`
    position: relative;
`);

const Breadcrumbs = createComponentSlot("div")<StackBreadcrumbsClassKey>({
    componentName: "StackBreadcrumbs",
    slotName: "breadcrumbs",
})(
    ({ theme }) => css`
        display: flex;
        height: 50px;
        border-bottom: 1px solid ${theme.palette.divider};
        box-sizing: border-box;
        flex-wrap: nowrap;
        overflow-x: auto; // Make the breadcrumbs scrollable, if they still take up too much space, when only the first, last & the overflow link are visible.
    `,
);

const ListItem = createComponentSlot("div")<StackBreadcrumbsClassKey>({
    componentName: "StackBreadcrumbs",
    slotName: "listItem",
})(css`
    display: flex;
    align-items: center;
    flex-shrink: 0;
    white-space: nowrap;
`);

const Separator = createComponentSlot("div")<StackBreadcrumbsClassKey>({
    componentName: "StackBreadcrumbs",
    slotName: "separator",
})(css`
    font-size: 12px;
    line-height: 0;
    margin-left: 8px;
    margin-right: 8px;
`);

export const BackButtonSeparator = createComponentSlot("div")<StackBreadcrumbsClassKey>({
    componentName: "StackBreadcrumbs",
    slotName: "backButtonSeparator",
})(
    ({ theme }) => css`
        height: 30px;
        width: 1px;
        background-color: ${theme.palette.divider};
        margin-right: 12px;
    `,
);

export interface StackBreadcrumbsProps
    extends ThemedComponentBaseProps<{
        root: "div";
        breadcrumbs: "div";
        listItem: "div";
        link: typeof Link;
        disabledLink: typeof Typography;
        overflowLink: typeof Link;
        separator: "div";
        backButton: typeof Link;
        backButtonSeparator: "div";
    }> {
    separator?: ReactNode;
    overflowLinkText?: ReactNode;
}

export function StackBreadcrumbs(inProps: StackBreadcrumbsProps) {
    const {
        separator,
        overflowLinkText = ". . .",
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminStackBreadcrumbs" });
    const stackApi = useStackApi();
    const { palette } = useTheme();
    const breadcrumbsRef = useRef<HTMLDivElement>(null);
    const containerWidth = useObservedWidth(breadcrumbsRef);
    const [itemWidths, setItemWidths] = useState<number[] | undefined>();

    const breadcrumbItems = useMemo(() => stackApi?.breadCrumbs ?? [], [stackApi]);
    const combinedTitlesOfBreadcrumbs = breadcrumbItems.map(({ title }) => title).join("");

    useEffect(() => {
        setItemWidths(undefined);
    }, [breadcrumbItems?.length, combinedTitlesOfBreadcrumbs]);

    useEffect(() => {
        if (breadcrumbItems?.length && !itemWidths?.length) {
            const listItems = breadcrumbsRef.current?.children;
            const newItemWidths = listItems ? Object.values(listItems).map((listItem) => getElementOuterWidth(listItem)) : [];
            setItemWidths(newItemWidths);
        }
    }, [breadcrumbItems?.length, combinedTitlesOfBreadcrumbs, itemWidths]);

    const backButtonUrl = breadcrumbItems.length > 1 ? breadcrumbItems[breadcrumbItems.length - 2].url : undefined;
    const itemsToRender = useItemsToRender(breadcrumbItems, containerWidth ?? 0, itemWidths, overflowLinkText, backButtonUrl, slotProps);

    if (!breadcrumbItems) {
        return null;
    }

    return (
        <Root {...slotProps?.root} {...restProps}>
            <Breadcrumbs {...slotProps?.breadcrumbs} ref={breadcrumbsRef}>
                {itemsToRender.map((item, index) => (
                    <ListItem {...slotProps?.listItem} key={index}>
                        {item}
                        {index < itemsToRender.length - 1 && (
                            <Separator {...slotProps?.separator}>
                                {separator ?? <ChevronRight fontSize="inherit" htmlColor={palette.grey[300]} />}
                            </Separator>
                        )}
                    </ListItem>
                ))}
            </Breadcrumbs>
        </Root>
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
