import { Close, Delete, Save, Warning } from "@dextinity/admin-icons";
import {
    type ComponentsOverrides,
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    type Theme,
    Typography,
} from "@mui/material";
import { css, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { Button } from "../common/buttons/Button";
import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";
import { messages } from "../messages";

export type RouterConfirmationDialogClassKey =
    | "root"
    | "closeButton"
    | "messageWrapper"
    | "messageWarningIcon"
    | "messageText"
    | "actionButton"
    | "saveButton"
    | "discardButton";

const StyledDialog = createComponentSlot(Dialog)<RouterConfirmationDialogClassKey>({
    componentName: "RouterConfirmationDialog",
    slotName: "root",
})(css`
    z-index: 1301;
`);

const CloseButton = createComponentSlot(IconButton)<RouterConfirmationDialogClassKey>({
    componentName: "RouterConfirmationDialog",
    slotName: "closeButton",
})(css`
    position: absolute;
    right: 14px;
    top: 14px;
    color: #fff;
`);

const MessageWrapper = createComponentSlot("div")<RouterConfirmationDialogClassKey>({
    componentName: "RouterConfirmationDialog",
    slotName: "messageWrapper",
})(css`
    display: flex;
`);

const StyledWarning = createComponentSlot(Warning)<RouterConfirmationDialogClassKey>({
    componentName: "RouterConfirmationDialog",
    slotName: "messageWarningIcon",
})(css`
    font-size: 20px;
`);

const MessageText = createComponentSlot(Typography)<RouterConfirmationDialogClassKey>({
    componentName: "RouterConfirmationDialog",
    slotName: "messageText",
})(css`
    padding-left: 10px;
`);

const SaveButton = createComponentSlot(Button)<RouterConfirmationDialogClassKey>({
    componentName: "RouterConfirmationDialog",
    slotName: "saveButton",
    classesResolver() {
        return ["actionButton"];
    },
})(
    ({ theme }) => css`
        flex-grow: 1;
        flex-basis: 50%;
        margin-left: ${theme.spacing(2)};
    `,
);

const DiscardButton = createComponentSlot(Button)<RouterConfirmationDialogClassKey>({
    componentName: "RouterConfirmationDialog",
    slotName: "discardButton",
    classesResolver() {
        return ["actionButton"];
    },
})(
    ({ theme }) => css`
        flex-grow: 1;
        flex-basis: 50%;
        margin-right: ${theme.spacing(2)};
    `,
);

export enum PromptAction {
    Cancel = "Cancel",
    Discard = "Discard",
    Save = "Save",
}

export interface RouterConfirmationDialogProps
    extends ThemedComponentBaseProps<{
        root: typeof Dialog;
        closeButton: typeof IconButton;
        messageWrapper: "div";
        messageWarningIcon: typeof Warning;
        messageText: typeof Typography;
        saveButton: typeof Button;
        discardButton: typeof Button;
    }> {
    isOpen: boolean;
    message?: ReactNode; // typically a string or a FormattedMessage (intl) is passed
    handleClose: (action: PromptAction) => void;
    showSaveButton?: boolean;
}

export function RouterConfirmationDialog(inProps: RouterConfirmationDialogProps) {
    const {
        message,
        handleClose,
        isOpen,
        showSaveButton = false,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminRouterConfirmationDialog" });

    return (
        <StyledDialog open={isOpen} onClose={() => handleClose(PromptAction.Cancel)} maxWidth="sm" {...slotProps?.root} {...restProps}>
            <DialogTitle>
                <FormattedMessage {...messages.saveUnsavedChanges} />
                <CloseButton onClick={() => handleClose(PromptAction.Cancel)} {...slotProps?.closeButton}>
                    <Close />
                </CloseButton>
            </DialogTitle>
            <DialogContent>
                <MessageWrapper {...slotProps?.messageWrapper}>
                    <StyledWarning {...slotProps?.messageWarningIcon} />
                    <MessageText {...slotProps?.messageText}>{message ?? <FormattedMessage {...messages.saveUnsavedChanges} />}</MessageText>
                </MessageWrapper>
            </DialogContent>
            <DialogActions>
                <DiscardButton
                    startIcon={<Delete />}
                    variant="destructive"
                    onClick={() => handleClose(PromptAction.Discard)}
                    {...slotProps?.discardButton}
                >
                    <FormattedMessage {...messages.discard} />
                </DiscardButton>
                {showSaveButton && (
                    <SaveButton startIcon={<Save />} onClick={() => handleClose(PromptAction.Save)} {...slotProps?.saveButton}>
                        <FormattedMessage {...messages.save} />
                    </SaveButton>
                )}
            </DialogActions>
        </StyledDialog>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminRouterConfirmationDialog: RouterConfirmationDialogClassKey;
    }

    interface Components {
        DextinityAdminRouterConfirmationDialog?: {
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminRouterConfirmationDialog"];
        };
    }
}
