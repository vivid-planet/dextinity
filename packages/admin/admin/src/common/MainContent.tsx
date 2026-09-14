import { type ComponentsOverrides, css, type Theme, useThemeProps } from "@mui/material";
import { type ReactNode, useRef } from "react";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";
import { useTopOffset } from "../helpers/useTopOffset";
import { useIsActiveStackSwitch } from "../stack/useIsActiveStackSwitch";

export type MainContentClassKey = "root" | "disablePaddingTop" | "disablePaddingBottom" | "disablePadding" | "fullHeight";

type OwnerState = Pick<MainContentProps, "disablePaddingTop" | "disablePaddingBottom" | "disablePadding" | "fullHeight"> & {
    topOffset: number;
};

const Root = createComponentSlot("main")<MainContentClassKey, OwnerState>({
    componentName: "MainContent",
    slotName: "root",
    classesResolver(ownerState) {
        return [
            ownerState.disablePaddingTop && "disablePaddingTop",
            ownerState.disablePaddingBottom && "disablePaddingBottom",
            ownerState.disablePadding && "disablePadding",
            ownerState.fullHeight && "fullHeight",
        ];
    },
})(
    ({ theme, ownerState }) => css`
        position: relative;
        z-index: 5;
        padding: ${theme.spacing(2)};

        ${theme.breakpoints.up("md")} {
            padding: ${theme.spacing(4)};
        }

        ${ownerState.fullHeight &&
        css`
            height: calc(100vh - ${ownerState.topOffset}px);
        `}

        ${ownerState.disablePaddingTop &&
        css`
            padding-top: 0;

            ${theme.breakpoints.up("md")} {
                padding-top: 0;
            }
        `}

        ${ownerState.disablePaddingBottom &&
        css`
            padding-bottom: 0;

            ${theme.breakpoints.up("md")} {
                padding-bottom: 0;
            }
        `}

        ${ownerState.disablePadding &&
        css`
            padding: 0;

            ${theme.breakpoints.up("md")} {
                padding: 0;
            }
        `}
    `,
);

export interface MainContentProps extends ThemedComponentBaseProps {
    children?: ReactNode;
    disablePaddingTop?: boolean;
    disablePaddingBottom?: boolean;
    disablePadding?: boolean;
    fullHeight?: boolean;
}

export function MainContent(inProps: MainContentProps) {
    const { children, fullHeight, disablePaddingTop, disablePaddingBottom, disablePadding, ...restProps } = useThemeProps({
        props: inProps,
        name: "DextinityAdminMainContent",
    });

    const mainRef = useRef<HTMLElement>(null);
    const ownerState: OwnerState = {
        fullHeight,
        disablePaddingTop,
        disablePaddingBottom,
        disablePadding,
        topOffset: useTopOffset(mainRef),
    };

    return (
        <Root ownerState={ownerState} ref={mainRef} {...restProps}>
            {children}
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminMainContent: MainContentClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminMainContent: MainContentProps;
    }

    interface Components {
        DextinityAdminMainContent?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminMainContent"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminMainContent"];
        };
    }
}

export const StackMainContent = ({ children, ...props }: MainContentProps) => {
    const isActiveStackSwitch = useIsActiveStackSwitch();

    // When inside a Stack, only the last MainContent should add content-spacing and height
    if (!isActiveStackSwitch) {
        return <>{children}</>;
    }

    return <MainContent {...props}>{children}</MainContent>;
};
