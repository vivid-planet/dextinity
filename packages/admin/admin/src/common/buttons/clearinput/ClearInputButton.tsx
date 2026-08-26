import { Clear } from "@dextinity/admin-icons";
import { ButtonBase, type ButtonBaseProps, type ComponentsOverrides, inputAdornmentClasses } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";

import { createComponentSlot } from "../../../helpers/createComponentSlot";

/**
 * @deprecated Use `ClearInputAdornment` directly as the InputAdornment
 */
export type ClearInputButtonClassKey = "root" | "focusVisible";

const Root = createComponentSlot(ButtonBase)<ClearInputButtonClassKey>({
    componentName: "ClearInputButton",
    slotName: "root",
})(
    ({ theme }) => css`
        height: 100%;
        width: 40px;
        color: ${theme.palette.action.active};

        ${`.${inputAdornmentClasses.positionEnd}`}:last-child & {
            margin-right: ${theme.spacing(-2)};
        }

        ${`.${inputAdornmentClasses.positionStart}`}:first-of-type & {
            margin-left: ${theme.spacing(-2)};
        }

        &:disabled {
            color: ${theme.palette.action.disabled};
        }
    `,
);

/**
 * @deprecated Use `ClearInputAdornment` directly as the InputAdornment
 */
export interface ClearInputButtonProps extends ButtonBaseProps {
    icon?: ReactNode;
}

/**
 * @deprecated Use `ClearInputAdornment` directly as the InputAdornment
 */
export function ClearInputButton(inProps: ClearInputButtonProps) {
    const { icon = <Clear />, ...restProps } = useThemeProps({
        props: inProps,
        name: "DextinityAdminClearInputButton",
    });
    return (
        <Root tabIndex={-1} {...restProps}>
            {icon}
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminClearInputButton: ClearInputButtonClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminClearInputButton: ClearInputButtonProps;
    }

    interface Components {
        DextinityAdminClearInputButton?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminClearInputButton"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminClearInputButton"];
        };
    }
}
