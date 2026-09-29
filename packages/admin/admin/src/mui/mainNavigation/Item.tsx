import {
    type ComponentsOverrides,
    type ListItemButton,
    type ListItemButtonProps,
    type ListItemIcon,
    type ListItemText,
    type Theme,
    useThemeProps,
} from "@mui/material";
import type { ReactElement, ReactNode } from "react";

import { Tooltip as CommonTooltip } from "../../common/Tooltip";
import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { useMainNavigation } from "./Context";
import { Icon, type MainNavigationItemClassKey, type OwnerState, Root, Text } from "./Item.styles";

const Tooltip = createComponentSlot(CommonTooltip)<MainNavigationItemClassKey>({
    componentName: "MainNavigationItem",
    slotName: "tooltip",
})();

export type MainNavigationItemLevel = 1 | 2 | 3;

export interface MainNavigationItemProps
    extends ThemedComponentBaseProps<{
            root: typeof ListItemButton;
            icon: typeof ListItemIcon;
            text: typeof ListItemText;
            tooltip: typeof CommonTooltip;
        }>,
        ListItemButtonProps {
    level?: MainNavigationItemLevel;
    primary: ReactNode;
    secondary?: ReactNode;
    icon?: ReactElement;
    secondaryAction?: ReactNode;
    isMenuOpen?: boolean;
    isCollapsibleOpen?: boolean;
    hasSubitems?: boolean;
}

export const MainNavigationItem = (inProps: MainNavigationItemProps) => {
    const {
        primary,
        secondary,
        icon,
        level = 1,
        secondaryAction,
        isMenuOpen,
        hasSubitems,
        isCollapsibleOpen,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminMainNavigationItem" });

    const { drawerVariant } = useMainNavigation();

    if (level > 3) {
        throw new Error("Maximum nesting level of 2 exceeded.");
    }

    const showIcon = !!icon && level === 1;

    const ownerState: OwnerState = {
        level,
        open: Boolean(isMenuOpen),
        hasIcon: Boolean(icon),
        collapsibleOpen: Boolean(isCollapsibleOpen),
        hasSecondaryText: Boolean(secondary),
        hasSecondaryAction: Boolean(secondaryAction),
        hasSubItems: Boolean(hasSubitems),
        variant: drawerVariant,
    };

    const showTooltip = !isMenuOpen && !hasSubitems && level === 1;

    return (
        <Tooltip
            placement="right"
            disableHoverListener={!showTooltip}
            disableFocusListener={!showTooltip}
            disableTouchListener={!showTooltip}
            title={primary}
            {...slotProps?.tooltip}
        >
            <Root component="div" ownerState={ownerState} {...slotProps?.root} {...restProps}>
                {showIcon && (
                    <Icon ownerState={ownerState} {...slotProps?.icon}>
                        {icon}
                    </Icon>
                )}
                <Text ownerState={ownerState} primary={primary} secondary={secondary} inset={!icon} {...slotProps?.text} />
                {!!secondaryAction && secondaryAction}
            </Root>
        </Tooltip>
    );
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminMainNavigationItem: MainNavigationItemProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminMainNavigationItem: MainNavigationItemClassKey;
    }

    interface Components {
        DextinityAdminMainNavigationItem?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminMainNavigationItem"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminMainNavigationItem"];
        };
    }
}
