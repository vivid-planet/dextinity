import { Close, Maximize } from "@dextinity/admin-icons";
import {
    ButtonBase,
    type ComponentsOverrides,
    css,
    // eslint-disable-next-line no-restricted-imports
    Dialog as MuiDialog,
    DialogContent as MuiDialogContent,
    DialogTitle as MuiDialogTitle,
    IconButton,
    Paper,
    type Theme,
    useThemeProps,
} from "@mui/material";
import { type PropsWithChildren, type ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";

import { createComponentSlot } from "./helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "./helpers/ThemedComponentBaseProps";

export type ContentOverflowClassKey =
    | "root"
    | "clickableContent"
    | "contentContainer"
    | "openDialogIcon"
    | "dialog"
    | "dialogPaper"
    | "dialogTitle"
    | "closeDialogButton"
    | "dialogContent"
    | "innerDialogContent";

export interface ContentOverflowProps
    extends ThemedComponentBaseProps<{
        root: "div";
        clickableContent: typeof ButtonBase;
        contentContainer: "div";
        openDialogIcon: "div";
        dialog: typeof MuiDialog;
        dialogPaper: typeof Paper;
        dialogTitle: typeof MuiDialogTitle;
        closeDialogButton: typeof IconButton;
        dialogContent: typeof MuiDialogContent;
        innerDialogContent: "div";
    }> {
    dialogTitle?: ReactNode;
    iconMapping?: {
        openDialog?: ReactNode;
        closeDialog?: ReactNode;
    };
}

export const ContentOverflow = (inProps: PropsWithChildren<ContentOverflowProps>) => {
    const {
        children,
        dialogTitle = <FormattedMessage id="dextinity.contentOverflow.dialogTitle" defaultMessage="Preview" />,
        iconMapping = {},
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminContentOverflow" });
    const { openDialog: openDialogIcon = <Maximize fontSize="inherit" />, closeDialog: closeDialogIcon = <Close /> } = iconMapping;

    const [open, setOpen] = useState(false);

    return (
        <>
            <Root {...slotProps?.root} {...restProps}>
                <ClickableContent {...slotProps?.clickableContent} onClick={() => setOpen(true)}>
                    <ContentContainer {...slotProps?.contentContainer}>{children}</ContentContainer>
                    <OpenDialogIcon {...slotProps?.openDialogIcon}>{openDialogIcon}</OpenDialogIcon>
                </ClickableContent>
            </Root>
            <Dialog PaperComponent={DialogPaper} {...slotProps?.dialog} open={open} onClose={() => setOpen(false)}>
                <DialogTitle {...slotProps?.dialogTitle}>
                    {dialogTitle}
                    <CloseDialogButton color="inherit" {...slotProps?.closeDialogButton} onClick={() => setOpen(false)}>
                        {closeDialogIcon}
                    </CloseDialogButton>
                </DialogTitle>
                <DialogContent {...slotProps?.dialogContent}>
                    <InnerDialogContent {...slotProps?.innerDialogContent}>{children}</InnerDialogContent>
                </DialogContent>
            </Dialog>
        </>
    );
};

const Root = createComponentSlot("div")<ContentOverflowClassKey>({
    componentName: "ContentOverflow",
    slotName: "root",
})(
    ({ theme }) => css`
        padding: ${theme.spacing(2)};
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    `,
);

const ClickableContent = createComponentSlot(ButtonBase)<ContentOverflowClassKey>({
    componentName: "ContentOverflow",
    slotName: "clickableContent",
})(
    ({ theme }) => css`
        position: relative;
        width: 100%;
        height: 100%;
        padding: ${theme.spacing(2, 2, 0, 2)};
        box-sizing: border-box;
        border: 1px dashed ${theme.palette.grey[100]};
        border-radius: 3px;
        background-color: white;
        white-space: normal;
    `,
);

const ContentContainer = createComponentSlot("div")<ContentOverflowClassKey>({
    componentName: "ContentOverflow",
    slotName: "contentContainer",
})(css`
    width: 100%;
    height: 100%;
    text-align: left;
    overflow: hidden;
    position: relative;

    // Prevent interacting with the content outside the dialog. A click should only open the dialog with the full content.
    // E.g. a link inside content would cause a page change, in addition to opening the dialog, which is not intended.
    pointer-events: none;
`);

const OpenDialogIcon = createComponentSlot("div")<ContentOverflowClassKey>({
    componentName: "ContentOverflow",
    slotName: "openDialogIcon",
})(css`
    position: absolute;
    top: 0;
    right: 0;
    padding: 6px;
    font-size: 12px;
    line-height: 0;
    background-color: inherit;
    border-bottom-left-radius: 3px;
`);

const Dialog = createComponentSlot(MuiDialog)<ContentOverflowClassKey>({
    componentName: "ContentOverflow",
    slotName: "dialog",
})();

const DialogPaper = createComponentSlot(Paper)<ContentOverflowClassKey>({
    componentName: "ContentOverflow",
    slotName: "dialogPaper",
})(css`
    overflow: hidden;

    // TODO: Consider a generic solution for height and max-height in dialogs.
    height: calc(100vh - 100px);

    && {
        max-height: 600px;
    }
`);

const DialogTitle = createComponentSlot(MuiDialogTitle)<ContentOverflowClassKey>({
    componentName: "ContentOverflow",
    slotName: "dialogTitle",
})(css`
    display: flex;
    align-items: center;
    justify-content: space-between;
`);

const CloseDialogButton = createComponentSlot(IconButton)<ContentOverflowClassKey>({
    componentName: "ContentOverflow",
    slotName: "closeDialogButton",
})();

const DialogContent = createComponentSlot(MuiDialogContent)<ContentOverflowClassKey>({
    componentName: "ContentOverflow",
    slotName: "dialogContent",
})(
    ({ theme }) => css`
        min-height: 0;
        box-sizing: border-box;
        overflow: visible;

        && {
            padding: ${theme.spacing(4)};
        }
    `,
);

const InnerDialogContent = createComponentSlot("div")<ContentOverflowClassKey>({
    componentName: "ContentOverflow",
    slotName: "innerDialogContent",
})(
    ({ theme }) => css`
        background-color: white;
        border: 1px dashed ${theme.palette.grey[100]};
        border-radius: 3px;
        padding: ${theme.spacing(2)};
        height: 100%;
        overflow: auto;
        box-sizing: border-box;
    `,
);

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminContentOverflow: ContentOverflowClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminContentOverflow: ContentOverflowProps;
    }

    interface Components {
        DextinityAdminContentOverflow?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminContentOverflow"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminContentOverflow"];
        };
    }
}
