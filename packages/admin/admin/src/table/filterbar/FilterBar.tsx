import { type ComponentsOverrides, css, type Theme, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export type FilterBarClassKey = "root" | "barWrapper";

const Root = createComponentSlot("div")<FilterBarClassKey>({
    componentName: "FilterBar",
    slotName: "root",
})(css`
    .DextinityAdminFormFieldContainer-root {
        margin-bottom: 0;
    }
`);

const BarWrapper = createComponentSlot("div")<FilterBarClassKey>({
    componentName: "FilterBar",
    slotName: "barWrapper",
})(css`
    flex-wrap: wrap;
    display: flex;
`);

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface FilterBarProps
    extends ThemedComponentBaseProps<{
        root: "div";
        barWrapper: "div";
    }> {
    children?: ReactNode;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function FilterBar(inProps: FilterBarProps) {
    const { children, slotProps, ...restProps } = useThemeProps({
        props: inProps,
        name: "DextinityAdminFilterBar",
    });

    return (
        <Root {...slotProps?.root} {...restProps}>
            <BarWrapper {...slotProps?.barWrapper}>{children}</BarWrapper>
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminFilterBar: FilterBarClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminFilterBar: FilterBarProps;
    }

    interface Components {
        DextinityAdminFilterBar?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminFilterBar"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminFilterBar"];
        };
    }
}
