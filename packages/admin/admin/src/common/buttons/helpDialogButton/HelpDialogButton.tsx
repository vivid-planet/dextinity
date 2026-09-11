import { QuestionMark } from "@dextinity/admin-icons";
import { type ComponentsOverrides, type IconButton, type Theme, useThemeProps } from "@mui/material";
import { type FunctionComponent, type ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";

import type { ThemedComponentBaseProps } from "../../../helpers/ThemedComponentBaseProps";
import { Button, Dialog, DialogContent } from "./HelpDialogButton.sc";

export type HelpDialogButtonClassKey = "button" | "dialog" | "dialogContent";

export type HelpDialogButtonProps = ThemedComponentBaseProps<{
    button: typeof IconButton;
    dialog: typeof Dialog;
    dialogContent: typeof DialogContent;
}> & {
    dialogTitle?: ReactNode;
    dialogDescription: ReactNode;
    icon?: ReactNode;
};

export const HelpDialogButton: FunctionComponent<HelpDialogButtonProps> = (inProps) => {
    const {
        dialogTitle = <FormattedMessage id="dextinity.helpDialogButton.title" defaultMessage="Help" />,
        dialogDescription,
        icon = <QuestionMark />,
        slotProps = {},
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminHelpDialogButton" });
    const [showHelp, setShowHelp] = useState(false);

    return (
        <>
            <Button
                onClick={() => {
                    setShowHelp(!showHelp);
                }}
                {...slotProps?.button}
                {...restProps}
            >
                {icon}
            </Button>
            <Dialog
                open={showHelp}
                onClose={() => {
                    setShowHelp(false);
                }}
                title={dialogTitle}
                {...slotProps?.dialog}
            >
                <DialogContent {...slotProps?.dialogContent}>{dialogDescription}</DialogContent>
            </Dialog>
        </>
    );
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminHelpDialogButton: HelpDialogButtonProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminHelpDialogButton: HelpDialogButtonClassKey;
    }

    interface Components {
        DextinityAdminHelpDialogButton?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminHelpDialogButton"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminHelpDialogButton"];
        };
    }
}
