import { Clear } from "@dextinity/admin-icons";
import { type ComponentsOverrides, type Theme, useThemeProps } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import { createComponentSlot } from "../../../helpers/createComponentSlot";
import { messages } from "../../../messages";
import { Button, type ButtonClassKey, type ButtonProps } from "../Button";

export type CancelButtonProps = ButtonProps;
export type CancelButtonClassKey = ButtonClassKey;

export function CancelButton(inProps: CancelButtonProps) {
    const {
        children = <FormattedMessage {...messages.cancel} />,
        startIcon = <Clear />,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminCancelButton" });

    return (
        <Root variant="textDark" startIcon={startIcon} {...restProps}>
            {children}
        </Root>
    );
}

const Root = createComponentSlot(Button)<CancelButtonClassKey>({
    componentName: "CancelButton",
    slotName: "root",
})();

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminCancelButton: CancelButtonClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminCancelButton: CancelButtonProps;
    }

    interface Components {
        DextinityAdminCancelButton?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminCancelButton"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminCancelButton"];
        };
    }
}
