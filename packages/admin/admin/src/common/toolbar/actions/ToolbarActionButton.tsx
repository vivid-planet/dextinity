// eslint-disable-next-line no-restricted-imports
import { Button, type ButtonProps, type ComponentsOverrides, IconButton } from "@mui/material";
import { css, type Theme, useTheme, useThemeProps } from "@mui/material/styles";

import { createComponentSlot } from "../../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../../helpers/ThemedComponentBaseProps";
import { useWindowSize } from "../../../helpers/useWindowSize";
import { Tooltip } from "../../Tooltip";

export type ToolbarActionButtonClassKey = "root" | "tooltip" | "button" | "iconButton" | "text" | "outlined" | "contained";

type ToolbarActionButtonProps = Omit<ButtonProps, "loading"> &
    ThemedComponentBaseProps<{
        tooltip: typeof Tooltip;
        iconButton: typeof IconButton;
        button: typeof Button;
    }>;

type OwnerState = {
    variant: "text" | "outlined" | "contained";
};

const StyledTooltip = createComponentSlot(Tooltip)<ToolbarActionButtonClassKey>({
    componentName: "ToolbarActionButton",
    slotName: "tooltip",
})();

const StyledIconButton = createComponentSlot(IconButton)<ToolbarActionButtonClassKey, OwnerState>({
    componentName: "ToolbarActionButton",
    slotName: "iconButton",
    classesResolver(ownerState) {
        return [ownerState.variant];
    },
})(
    ({ theme, ownerState }) => css`
        ${
            ownerState.variant === "contained" &&
            css`
                background: ${theme.palette.primary.main};
                color: ${theme.palette.primary.contrastText};
                border-radius: 4px;
                &:hover {
                    background: ${theme.palette.primary.dark};
                }
            `
        }
        ${
            ownerState.variant === "outlined" &&
            css`
                border-radius: 4px;
                border-width: 1px;
                border-style: solid;
                border-color: ${theme.palette.grey[200]};
                &:hover {
                    background-color: ${theme.palette.grey[50]};
                    border-color: ${theme.palette.grey[200]};
                }
            `
        }
    `,
);

const StyledButton = createComponentSlot(Button)<ToolbarActionButtonClassKey, OwnerState>({
    componentName: "ToolbarActionButton",
    slotName: "button",
    classesResolver(ownerState) {
        return [ownerState.variant];
    },
})();

/**
 * @deprecated Use `Button` from `@dextinity/admin` with the `responsive` prop instead.
 */
export const ToolbarActionButton = (props: ToolbarActionButtonProps) => {
    const { children, slotProps = {}, ...restProps } = useThemeProps({ props, name: "DextinityAdminToolbarActionButton" });
    const { iconButton: iconButtonProps, tooltip: tooltipProps, button: buttonProps } = slotProps;

    const windowSize = useWindowSize();
    const theme = useTheme();
    const useIconButton: boolean = windowSize.width < theme.breakpoints.values.sm;

    const icon = restProps.startIcon ?? restProps.endIcon;
    const ownerState = { variant: restProps.variant ?? "text" };

    return useIconButton && icon ? (
        <StyledTooltip title={children} {...tooltipProps}>
            <StyledIconButton ownerState={ownerState} {...restProps} {...iconButtonProps}>
                {icon}
            </StyledIconButton>
        </StyledTooltip>
    ) : (
        <StyledButton ownerState={ownerState} {...restProps} {...buttonProps}>
            {children}
        </StyledButton>
    );
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminToolbarActionButton: ToolbarActionButtonProps;
    }
    interface ComponentNameToClassKey {
        DextinityAdminToolbarActionButton: ToolbarActionButtonClassKey;
    }
    interface Components {
        DextinityAdminToolbarActionButton?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminToolbarActionButton"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminToolbarActionButton"];
        };
    }
}
