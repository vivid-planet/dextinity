import { type ComponentsOverrides, css, Grow, type Theme, useThemeProps } from "@mui/material";
import { type ReactNode, useState } from "react";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

export interface HoverActionsProps extends ThemedComponentBaseProps<{
    root: "div";
    hoverAreaExpansion: "div";
    actions: "div";
    children: "div";
}> {
    actions?: ReactNode;
    children?: ReactNode;
}

export type HoverActionsClassKey = "root" | "hoverAreaExpansion" | "actions" | "children";

export const HoverActions = (inProps: HoverActionsProps) => {
    const { actions, children, slotProps, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminHoverActions" });
    const [isHovering, setIsHovering] = useState<boolean>(false);

    return (
        <Root onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} {...slotProps?.root} {...restProps}>
            <HoverAreaExpansion {...slotProps?.hoverAreaExpansion} />
            <Grow in={Boolean(actions) && isHovering}>
                <Actions {...slotProps?.actions}>{actions}</Actions>
            </Grow>
            <Children {...slotProps?.children}>{children}</Children>
        </Root>
    );
};

const Root = createComponentSlot("div")<HoverActionsClassKey>({
    componentName: "HoverActions",
    slotName: "root",
})();

const HoverAreaExpansion = createComponentSlot("div")<HoverActionsClassKey>({
    componentName: "HoverActions",
    slotName: "hoverAreaExpansion",
})(css`
    // This element expands the root's hover area to include the parent's full size, including padding.
    // For example, when used inside a MuiTableCell, the whole cell can be hovered instead of only its text content.
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
`);

const Actions = createComponentSlot("div")<HoverActionsClassKey>({
    componentName: "HoverActions",
    slotName: "actions",
})(
    ({ theme }) => css`
        position: absolute;
        z-index: 2;
        top: 0;
        bottom: 0;
        right: 0;
        display: flex;
        align-items: center;
        padding-left: ${theme.spacing(2)};
        padding-right: ${theme.spacing(2)};
        background-color: rgba(255, 255, 255, 0.9);
    `,
);

const Children = createComponentSlot("div")<HoverActionsClassKey>({
    componentName: "HoverActions",
    slotName: "children",
})(css`
    position: relative;
    z-index: 1;
`);

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminHoverActions: HoverActionsClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminHoverActions: HoverActionsProps;
    }

    interface Components {
        DextinityAdminHoverActions?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminHoverActions"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminHoverActions"];
        };
    }
}
