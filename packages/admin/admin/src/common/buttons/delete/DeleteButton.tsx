import { Delete } from "@dextinity/admin-icons";
import type { ComponentsOverrides } from "@mui/material";
import { type Theme, useThemeProps } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import { createComponentSlot } from "../../../helpers/createComponentSlot";
import { messages } from "../../../messages";
import { Button, type ButtonClassKey, type ButtonProps } from "../Button";

export type DeleteButtonClassKey = ButtonClassKey;
export type DeleteButtonProps = ButtonProps;

export function DeleteButton(inProps: DeleteButtonProps) {
    const {
        children = <FormattedMessage {...messages.delete} />,
        startIcon = <Delete />,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminDeleteButton" });

    return (
        <Root startIcon={startIcon} variant="destructive" {...restProps}>
            {children}
        </Root>
    );
}

const Root = createComponentSlot(Button)<DeleteButtonClassKey>({
    componentName: "DeleteButton",
    slotName: "root",
})();

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminDeleteButton: DeleteButtonClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminDeleteButton: DeleteButtonProps;
    }

    interface Components {
        DextinityAdminDeleteButton?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDeleteButton"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDeleteButton"];
        };
    }
}
