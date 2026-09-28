import { type ComponentsOverrides, css, type Theme, useThemeProps } from "@mui/material";
import { type ReactNode, useRef } from "react";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";
import { useTopOffset } from "../helpers/useTopOffset";

export type FullHeightContentClassKey = "root" | "disableBottomContentSpacing";

type OwnerState = {
    topOffset: number;
    disableBottomContentSpacing?: boolean;
};

export type FullHeightContentProps = ThemedComponentBaseProps<{
    root: "div";
}> & {
    children?: ReactNode;
    disableBottomContentSpacing?: boolean;
};

export const FullHeightContent = (inProps: FullHeightContentProps) => {
    const { children, slotProps, disableBottomContentSpacing, ...restProps } = useThemeProps({
        props: inProps,
        name: "DextinityAdminFullHeightContent",
    });

    const elementRef = useRef<HTMLDivElement>(null);
    const ownerState: OwnerState = {
        topOffset: useTopOffset(elementRef),
        disableBottomContentSpacing,
    };

    return (
        <Root {...slotProps?.root} {...restProps} ref={elementRef} ownerState={ownerState}>
            {children}
        </Root>
    );
};

const Root = createComponentSlot("div")<FullHeightContentClassKey, OwnerState>({
    componentName: "FullHeightContent",
    slotName: "root",
    classesResolver(ownerState) {
        return [ownerState.disableBottomContentSpacing && "disableBottomContentSpacing"];
    },
})(
    ({ theme, ownerState }) => css`
        position: relative;
        height: calc(100vh - ${ownerState.topOffset}px - ${theme.spacing(4)});

        ${ownerState.disableBottomContentSpacing &&
        css`
            height: calc(100vh - ${ownerState.topOffset}px);
        `}
    `,
);

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminFullHeightContent: FullHeightContentClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminFullHeightContent: FullHeightContentProps;
    }

    interface Components {
        DextinityAdminFullHeightContent?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminFullHeightContent"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminFullHeightContent"];
        };
    }
}
