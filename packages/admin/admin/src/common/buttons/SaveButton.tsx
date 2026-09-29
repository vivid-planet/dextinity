import { Save } from "@dextinity/admin-icons";
import type { ComponentsOverrides } from "@mui/material";
import { type Theme, useThemeProps } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import { messages } from "../../messages";
import { FeedbackButton, type FeedbackButtonClassKey, type FeedbackButtonProps } from "./feedback/FeedbackButton";

export type SaveButtonClassKey = FeedbackButtonClassKey;
export type SaveButtonProps = FeedbackButtonProps;

export function SaveButton(inProps: SaveButtonProps) {
    const {
        children = <FormattedMessage {...messages.save} />,
        startIcon = <Save />,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminSaveButton",
    });

    return (
        <Root {...restProps} startIcon={startIcon}>
            {children}
        </Root>
    );
}

const Root = createComponentSlot(FeedbackButton)<SaveButtonClassKey>({
    componentName: "SaveButton",
    slotName: "root",
})();

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminSaveButton: SaveButtonClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminSaveButton: SaveButtonProps;
    }

    interface Components {
        DextinityAdminSaveButton?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminSaveButton"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminSaveButton"];
        };
    }
}
