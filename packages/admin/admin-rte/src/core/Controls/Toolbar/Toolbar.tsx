import type { ThemedComponentBaseProps } from "@dextinity/admin";
import type { ComponentsOverrides, Theme } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { createElement, type JSX } from "react";

import type { IControlProps } from "../../types";
import { Root, type RteToolbarClassKey, Slot } from "./Toolbar.styles";

interface RteToolbarProps
    extends IControlProps,
        ThemedComponentBaseProps<{
            root: "div";
            slot: "div";
        }> {
    children: Array<(p: IControlProps) => JSX.Element | null>;
}

export function Toolbar(inProps: RteToolbarProps) {
    const { children, slotProps, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminRteToolbar" });

    const childrenElements = children
        .filter((c) => {
            const Comp = c;
            return Comp(restProps) !== null; // filter out unused control components
        })
        .map((c) => {
            const Comp = c;
            return createElement(Comp, restProps);
        });

    return (
        // TODO: Find alternative to className
        <Root {...slotProps?.root} {...restProps} className="DextinityAdminRteToolbar-root">
            {childrenElements.map((c, idx) => {
                return (
                    <Slot key={idx} {...slotProps?.slot}>
                        {c}
                    </Slot>
                );
            })}
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminRteToolbar: RteToolbarProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminRteToolbar: RteToolbarClassKey;
    }

    interface Components {
        DextinityAdminRteToolbar?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminRteToolbar"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminRteToolbar"];
        };
    }
}
