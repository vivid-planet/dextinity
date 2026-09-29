import { Clear } from "@dextinity/admin-icons";
import {
    ButtonBase,
    type ComponentsOverrides,
    css,
    InputAdornment,
    type InputAdornmentClassKey,
    type InputAdornmentProps,
    selectClasses,
    type Theme,
    useThemeProps,
} from "@mui/material";
import type { ReactNode } from "react";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

export interface ClearInputAdornmentProps
    extends InputAdornmentProps,
        ThemedComponentBaseProps<{
            root: typeof InputAdornment;
            buttonBase: typeof ButtonBase;
        }> {
    icon?: ReactNode;
    onClick: () => void;
}

type OwnerState = Pick<ClearInputAdornmentProps, "position">;

export type ClearInputAdornmentClassKey = InputAdornmentClassKey | "buttonBase";

export const ClearInputAdornment = (inProps: ClearInputAdornmentProps) => {
    const {
        onClick,
        position,
        icon = <Clear fontSize="inherit" />,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminClearInputAdornment" });

    const ownerState: OwnerState = {
        position,
    };

    return (
        <Root position={position} ownerState={ownerState} {...slotProps?.root} {...restProps}>
            <Button
                onClick={(event) => {
                    // Prevent the click from bubbling to the surrounding input, which could trigger its own click handler.
                    event.stopPropagation();
                    onClick();
                }}
                focusRipple
                {...slotProps?.buttonBase}
            >
                {icon}
            </Button>
        </Root>
    );
};

const Root = createComponentSlot(InputAdornment)<ClearInputAdornmentClassKey, OwnerState>({
    componentName: "ClearInputAdornment",
    slotName: "root",
})(
    ({ theme, ownerState }) => css`
        ${ownerState.position === "start" &&
        css`
            &:last-child {
                margin-left: ${theme.spacing(-2)};
            }
        `}

        ${ownerState.position === "end" &&
        css`
            &:last-child {
                margin-right: ${theme.spacing(-2)};
            }

            .${selectClasses.select} ~ &:last-child {
                // Reset the margin when used inside a MuiSelect, as MuiSelect-icon is moved to the end of the input using 'order' and is, therefore, the "real" last-child.
                margin-right: 0;
            }
        `}
    `,
);

const Button = createComponentSlot(ButtonBase)<ClearInputAdornmentClassKey>({
    componentName: "ClearInputAdornment",
    slotName: "buttonBase",
})(
    ({ theme }) => css`
        padding-left: 10px;
        padding-right: 10px;
        height: 100%;
        color: ${theme.palette.grey[300]};
        font-size: 12px;
    `,
);

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminClearInputAdornment: ClearInputAdornmentClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminClearInputAdornment: ClearInputAdornmentProps;
    }

    interface Components {
        DextinityAdminClearInputAdornment?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminClearInputAdornment"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminClearInputAdornment"];
        };
    }
}
