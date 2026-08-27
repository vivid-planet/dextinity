import { ChevronDown, ChevronUp } from "@dextinity/admin-icons";
import { type ComponentsOverrides, Popover as MuiPopover, type Theme } from "@mui/material";
import { css, useThemeProps } from "@mui/material/styles";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { AppHeaderButton, type AppHeaderButtonProps } from "../button/AppHeaderButton";

export type AppHeaderDropdownClassKey = "root" | "popover" | "button";

export interface AppHeaderDropdownProps
    extends Omit<AppHeaderButtonProps, "children" | "slotProps">,
        ThemedComponentBaseProps<{
            root: "div";
            popover: typeof Popover;
            button: typeof AppHeaderButton;
        }> {
    children?: ((closeDropdown: () => void) => ReactNode) | ReactNode;
    buttonChildren?: ReactNode;
    dropdownArrow?: ((isOpen: boolean) => ReactNode) | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const Root = createComponentSlot("div")<AppHeaderDropdownClassKey>({
    componentName: "AppHeaderDropdown",
    slotName: "root",
})(css`
    height: 100%;
`);

const Button = createComponentSlot(AppHeaderButton)<AppHeaderDropdownClassKey>({
    componentName: "AppHeaderDropdown",
    slotName: "button",
})();

const Popover = createComponentSlot(MuiPopover)<AppHeaderDropdownClassKey>({
    componentName: "AppHeaderDropdown",
    slotName: "popover",
})();

export function AppHeaderDropdown(inProps: AppHeaderDropdownProps) {
    const {
        children,
        buttonChildren,
        dropdownArrow = (isOpen: boolean) => (isOpen ? <ChevronUp /> : <ChevronDown />),
        open,
        onOpenChange,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminAppHeaderDropdown" });

    const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(false);

    const _open = open !== undefined ? open : uncontrolledOpen;
    const _onOpenChange =
        onOpenChange !== undefined
            ? onOpenChange
            : (open: boolean) => {
                  setUncontrolledOpen(open);
              };

    const [itemWidth, setItemWidth] = useState<number>(0);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (rootRef.current) {
            setItemWidth(rootRef.current.clientWidth);
        }
    }, []);

    return (
        <Root ref={rootRef} {...slotProps?.root}>
            <Button
                endIcon={dropdownArrow !== null ? dropdownArrow(_open) : undefined}
                {...restProps}
                {...slotProps?.button}
                onClick={() => _onOpenChange(true)}
            >
                {buttonChildren}
            </Button>
            <Popover
                open={_open}
                anchorEl={rootRef.current}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                onClose={() => _onOpenChange(false)}
                marginThreshold={0}
                PaperProps={{
                    sx: {
                        minWidth: itemWidth,
                    },
                }}
                {...slotProps?.popover}
            >
                {typeof children === "function" ? children(() => _onOpenChange(false)) : children}
            </Popover>
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminAppHeaderDropdown: AppHeaderDropdownProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminAppHeaderDropdown: AppHeaderDropdownClassKey;
    }

    interface Components {
        DextinityAdminAppHeaderDropdown?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminAppHeaderDropdown"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminAppHeaderDropdown"];
        };
    }
}
