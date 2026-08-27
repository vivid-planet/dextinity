import { Check } from "@dextinity/admin-icons";
import type { ComponentsOverrides } from "@mui/material";
import { type Theme, useThemeProps } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import { createComponentSlot } from "../../../helpers/createComponentSlot";
import { messages } from "../../../messages";
import { Button, type ButtonClassKey, type ButtonProps } from "../Button";

export type OkayButtonClassKey = ButtonClassKey;
export type OkayButtonProps = ButtonProps;

export function OkayButton(inProps: OkayButtonProps) {
    const {
        children = <FormattedMessage {...messages.ok} />,
        startIcon = <Check />,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminOkayButton" });

    return (
        <Root startIcon={startIcon} {...restProps}>
            {children}
        </Root>
    );
}

const Root = createComponentSlot(Button)<OkayButtonClassKey>({
    componentName: "OkayButton",
    slotName: "root",
})();

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminOkayButton: OkayButtonClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminOkayButton: OkayButtonProps;
    }

    interface Components {
        DextinityAdminOkayButton?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminOkayButton"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminOkayButton"];
        };
    }
}
