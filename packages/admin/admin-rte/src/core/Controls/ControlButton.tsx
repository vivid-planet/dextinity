import { createComponentSlot, type ThemedComponentBaseProps } from "@dextinity/admin";
import type { ComponentsOverrides } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ForwardRefExoticComponent, MouseEvent, PropsWithChildren, RefAttributes } from "react";

import getRteTheme from "../utils/getRteTheme";

export type RteControlButtonClassKey = "root" | "selected" | "renderAsIcon";

type OwnerState = Pick<IProps, "selected" | "Icon">;

const Root = createComponentSlot("button")<RteControlButtonClassKey, OwnerState>({
    componentName: "RteControlButton",
    slotName: "root",
    classesResolver(ownerState) {
        return [ownerState.selected && "selected", Boolean(ownerState.Icon) && "renderAsIcon"];
    },
})(({ ownerState, theme }) => {
    const rteTheme = getRteTheme(theme.components?.DextinityAdminRte?.defaultProps);
    return css`
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        height: 24px;
        background-color: transparent;
        border: 1px solid transparent;
        box-sizing: border-box;
        transition:
            background-color 200ms,
            border-color 200ms,
            color 200ms;
        font-size: 20px;
        color: ${rteTheme.colors?.buttonIcon};

        &:hover {
            background-color: ${rteTheme.colors?.buttonBackgroundHover};
            border-color: ${rteTheme.colors?.buttonBorderHover};
        }

        &:disabled {
            cursor: not-allowed;

            &,
            &:hover {
                background-color: transparent;
                border-color: transparent;
                color: ${rteTheme.colors?.buttonIconDisabled};
            }
        }

        ${ownerState.selected &&
        css`
            &:not(:disabled),
            &:not(:disabled):hover {
                border-color: ${rteTheme.colors?.buttonBorderHover};
                background-color: white;
            }
        `}

        ${Boolean(ownerState.Icon) &&
        css`
            width: 24px;
        `}
    `;
});

export interface IProps
    extends ThemedComponentBaseProps<{
        root: "button";
    }> {
    disabled?: boolean;
    selected?: boolean;
    onButtonClick?: (e: MouseEvent) => void;
    icon?: ForwardRefExoticComponent<Omit<SvgIconProps, "ref"> & RefAttributes<SVGSVGElement>>;

    /** @deprecated use icon instead */
    Icon?: ForwardRefExoticComponent<Omit<SvgIconProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export function ControlButton(inProps: PropsWithChildren<IProps>) {
    const {
        disabled = false,
        selected = false,
        onButtonClick,
        icon,
        children,
        Icon: deprecatedIcon,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminRteControlButton" });

    const Icon = icon || deprecatedIcon;

    const ownerState: OwnerState = {
        selected,
        Icon,
    };

    return (
        <Root type="button" disabled={disabled} onMouseDown={onButtonClick} ownerState={ownerState} {...slotProps?.root} {...restProps}>
            {!!Icon && <Icon sx={{ fontSize: 15 }} color="inherit" />}
            {children}
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminRteControlButton: RteControlButtonClassKey;
    }

    interface Components {
        DextinityAdminRteControlButton?: {
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminRteControlButton"];
        };
    }
}
