import { Close } from "@dextinity/admin-icons";
import {
    type ComponentsOverrides,
    css,
    // eslint-disable-next-line no-restricted-imports
    Dialog as MuiDialog,
    type DialogProps as MuiDialogProps,
    DialogTitle as MuiDialogTitle,
    IconButton,
    type Theme,
    useThemeProps,
} from "@mui/material";
import type { ReactNode } from "react";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

export type DialogClassKey = "root" | "closeButton" | "dialogTitle";

export type DialogProps = ThemedComponentBaseProps<{
    closeButton: typeof IconButton;
    root: typeof MuiDialog;
    dialogTitle: typeof MuiDialogTitle;
}> & {
    title?: ReactNode;
    iconMapping?: {
        closeIcon?: ReactNode;
    };
} & Omit<MuiDialogProps, "title">;

type OwnerState = {
    hasCloseButton: boolean;
};

export function Dialog(inProps: DialogProps) {
    const {
        slotProps,
        open = false,
        title,
        iconMapping = {},
        children,
        onClose,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminDialog" });
    const { closeIcon = <Close color="inherit" /> } = iconMapping;

    const ownerState: OwnerState = {
        hasCloseButton: Boolean(onClose),
    };

    return (
        <Root open={open} onClose={onClose} {...slotProps?.root} {...restProps}>
            {onClose && (
                <CloseButton {...slotProps?.closeButton} onClick={(event) => onClose(event, "escapeKeyDown")}>
                    {closeIcon}
                </CloseButton>
            )}
            <DialogTitle ownerState={ownerState} {...slotProps?.dialogTitle}>
                {title}
            </DialogTitle>
            {children}
        </Root>
    );
}

const Root = createComponentSlot(MuiDialog)<DialogClassKey>({
    componentName: "Dialog",
    slotName: "root",
})();

const DialogTitle = createComponentSlot(MuiDialogTitle)<DialogClassKey, OwnerState>({
    componentName: "Dialog",
    slotName: "dialogTitle",
})(
    ({ ownerState, theme }) => css`
        ${
            ownerState.hasCloseButton &&
            css`
                padding-right: ${theme.spacing(10)};
            `
        }
    `,
);

const CloseButton = createComponentSlot(IconButton)<DialogClassKey>({
    componentName: "Dialog",
    slotName: "closeButton",
})(
    ({ theme }) => css`
        position: absolute;
        right: 12px;
        top: 9px;
        color: ${theme.palette.secondary.contrastText};

        ${theme.breakpoints.up("sm")} {
            top: 14px;
        }
    `,
);

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminDialog: DialogProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminDialog: DialogClassKey;
    }

    interface Components {
        DextinityAdminDialog?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDialog"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDialog"];
        };
    }
}
