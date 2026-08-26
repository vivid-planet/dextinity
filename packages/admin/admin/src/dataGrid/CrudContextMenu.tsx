import { type ApolloClient, type RefetchQueriesOptions, useApolloClient } from "@apollo/client";
import { Copy, Delete as DeleteIcon, Domain, Paste, Remove as RemoveIcon, ThreeDotSaving } from "@dextinity/admin-icons";
import { type ComponentsOverrides, Divider, Snackbar, type Theme, useThemeProps } from "@mui/material";
import { type ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Alert } from "../alert/Alert";
import { readClipboardText } from "../clipboard/readClipboardText";
import { writeClipboardText } from "../clipboard/writeClipboardText";
import { DeleteDialog as CommonDeleteDialog } from "../common/DeleteDialog";
import { useErrorDialog } from "../error/errordialog/useErrorDialog";
import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";
import { messages } from "../messages";
import { RowActionsItem } from "../rowActions/RowActionsItem";
import { RowActionsMenu } from "../rowActions/RowActionsMenu";
import { useSnackbarApi } from "../snackbar/SnackbarProvider";

export type CrudContextMenuClassKey =
    | "root"
    | "itemsMenu"
    | "copyUrlItem"
    | "deleteItem"
    | "copyItem"
    | "pasteItem"
    | "itemsDivider"
    | "deleteDialog";

export interface CrudContextMenuProps<CopyData>
    extends ThemedComponentBaseProps<{
        root: typeof RowActionsMenu;
        itemsMenu: typeof RowActionsMenu;
        copyUrlItem: typeof RowActionsItem;
        copyItem: typeof RowActionsItem;
        pasteItem: typeof RowActionsItem;
        itemsDivider: typeof Divider;
        deleteItem: typeof RowActionsItem;
        deleteDialog: typeof CommonDeleteDialog;
    }> {
    iconMapping?: {
        copyUrl?: ReactNode;
        copy?: ReactNode;
        copyLoading?: ReactNode;
        paste?: ReactNode;
        pasteLoading?: ReactNode;
        delete?: ReactNode;
    };
    messagesMapping?: {
        copyUrl?: ReactNode;
        copy?: ReactNode;
        paste?: ReactNode;
        delete?: ReactNode;
    };
    url?: string;
    onPaste?: (options: { input: CopyData; client: ApolloClient<object> }) => Promise<void>;
    onDelete?: (options: { client: ApolloClient<object> }) => Promise<void>;
    deleteType?: "delete" | "remove";

    refetchQueries?: RefetchQueriesOptions<any, unknown>["include"];
    copyData?: () => Promise<CopyData> | CopyData;
    /**
     * Render custom `RowActionsItem` components to be added to the menu.
     */
    children?: ReactNode;
}

export function CrudContextMenu<CopyData>(inProps: CrudContextMenuProps<CopyData>) {
    const {
        url,
        onPaste,
        onDelete,
        deleteType = "delete",
        refetchQueries,
        copyData,
        slotProps,
        iconMapping = {},
        messagesMapping = {},
        children,
        ...restProp
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminCrudContextMenu",
    });

    const {
        copyUrl: copyUrlIcon = <Domain />,
        copy: copyIcon = <Copy />,
        copyLoading: copyLoadingIcon = <ThreeDotSaving />,
        paste: pasteIcon = <Paste />,
        pasteLoading: pasteLoadingIcon = <ThreeDotSaving />,
        delete: deleteIcon = deleteType === "delete" ? <DeleteIcon /> : <RemoveIcon />,
    } = iconMapping;

    const {
        copyUrl: copyUrlMessage = <FormattedMessage {...messages.copyUrl} />,
        copy: copyMessage = <FormattedMessage {...messages.copy} />,
        paste: pasteMessage = <FormattedMessage {...messages.paste} />,
        delete: deleteMessage = deleteType === "delete" ? <FormattedMessage {...messages.delete} /> : <FormattedMessage {...messages.remove} />,
    } = messagesMapping;

    const client = useApolloClient();
    const errorDialog = useErrorDialog();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [copyLoading, setCopyLoading] = useState(false);
    const [pasting, setPasting] = useState(false);
    const snackbarApi = useSnackbarApi();
    const handleDeleteClick = async () => {
        if (!onDelete) {
            return;
        }

        try {
            await onDelete({
                client,
            });
            if (refetchQueries) {
                await client.refetchQueries({ include: refetchQueries });
            }
            setDeleteDialogOpen(false);
        } catch {
            throw new Error("Delete failed");
        }
    };

    const handlePasteClick = async () => {
        if (!onPaste) {
            return;
        }
        const clipboard = await readClipboardText();

        if (clipboard) {
            let input;

            try {
                input = JSON.parse(clipboard);
            } catch (e) {
                errorDialog?.showError({
                    userMessage: (
                        <FormattedMessage id="dextinity.common.clipboardInvalidFormat" defaultMessage="Clipboard contains an invalid format" />
                    ),
                    error: e.toString(),
                });
            }

            if (input) {
                // TODO validate input?
                try {
                    await onPaste({
                        input,
                        client,
                    });
                    if (refetchQueries) {
                        await client.refetchQueries({ include: refetchQueries });
                    }
                } catch (e) {
                    errorDialog?.showError({
                        userMessage: (
                            <FormattedMessage
                                id="dextinity.common.pasteFailedInvalidFormat"
                                defaultMessage="Paste failed, probably due to an invalid format"
                            />
                        ),
                        error: e.toString(),
                    });
                    console.error("mutation failed", e);
                }
            }
        } else {
            console.error("Clidpboard is empty");
        }
    };

    const handleCopyClick = async () => {
        await writeClipboardText(JSON.stringify(await copyData!()));
    };

    return (
        <>
            <Root {...slotProps?.root} {...restProp}>
                <ItemsMenu {...slotProps?.itemsMenu}>
                    {children}
                    {url && (
                        <CopyUrlItem
                            icon={copyUrlIcon}
                            onClick={() => {
                                writeClipboardText(url);
                            }}
                            {...slotProps?.copyUrlItem}
                        >
                            {copyUrlMessage}
                        </CopyUrlItem>
                    )}
                    {copyData && (
                        <CopyItem
                            icon={copyLoading ? copyLoadingIcon : copyIcon}
                            onClick={async () => {
                                setCopyLoading(true);
                                try {
                                    await handleCopyClick();
                                } catch (error) {
                                    snackbarApi.showSnackbar(
                                        <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "left" }} autoHideDuration={5000}>
                                            <Alert severity="error">
                                                <FormattedMessage id="dextinity.crudContextMenu.copyFailed" defaultMessage="Copy failed" />
                                            </Alert>
                                        </Snackbar>,
                                    );

                                    console.error("Copy failed", error);
                                } finally {
                                    setCopyLoading(false);
                                }
                            }}
                            {...slotProps?.copyItem}
                        >
                            {copyMessage}
                        </CopyItem>
                    )}
                    {onPaste && (
                        <PasteItem
                            icon={pasting ? pasteLoadingIcon : pasteIcon}
                            onClick={async () => {
                                setPasting(true);
                                await handlePasteClick();
                                setPasting(false);
                            }}
                            {...slotProps?.pasteItem}
                        >
                            {pasteMessage}
                        </PasteItem>
                    )}
                    {onDelete && (onPaste || copyData || url) && <ItemsDivider {...slotProps?.itemsDivider} />}
                    {onDelete && (
                        <DeleteItem
                            icon={deleteIcon}
                            onClick={() => {
                                setDeleteDialogOpen(true);
                            }}
                            {...slotProps?.deleteItem}
                        >
                            {deleteMessage}
                        </DeleteItem>
                    )}
                </ItemsMenu>
            </Root>
            <DeleteDialog
                dialogOpen={deleteDialogOpen}
                onCancel={() => setDeleteDialogOpen(false)}
                onDelete={handleDeleteClick}
                deleteType={deleteType}
                {...slotProps?.deleteDialog}
            />
        </>
    );
}

const Root = createComponentSlot(RowActionsMenu)<CrudContextMenuClassKey>({
    componentName: "CrudContextMenu",
    slotName: "root",
})();

const ItemsMenu = createComponentSlot(RowActionsMenu)<CrudContextMenuClassKey>({
    componentName: "CrudContextMenu",
    slotName: "itemsMenu",
})();

const CopyUrlItem = createComponentSlot(RowActionsItem)<CrudContextMenuClassKey>({
    componentName: "CrudContextMenu",
    slotName: "copyUrlItem",
})();

const CopyItem = createComponentSlot(RowActionsItem)<CrudContextMenuClassKey>({
    componentName: "CrudContextMenu",
    slotName: "copyItem",
})();

const PasteItem = createComponentSlot(RowActionsItem)<CrudContextMenuClassKey>({
    componentName: "CrudContextMenu",
    slotName: "pasteItem",
})();

const ItemsDivider = createComponentSlot(Divider)<CrudContextMenuClassKey>({
    componentName: "CrudContextMenu",
    slotName: "itemsDivider",
})();

const DeleteItem = createComponentSlot(RowActionsItem)<CrudContextMenuClassKey>({
    componentName: "CrudContextMenu",
    slotName: "deleteItem",
})();

const DeleteDialog = createComponentSlot(CommonDeleteDialog)<CrudContextMenuClassKey>({
    componentName: "CrudContextMenu",
    slotName: "deleteDialog",
})();

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminCrudContextMenu: CrudContextMenuProps<unknown>;
    }

    interface ComponentNameToClassKey {
        DextinityAdminCrudContextMenu: CrudContextMenuClassKey;
    }

    interface Components {
        DextinityAdminCrudContextMenu?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminCrudContextMenu"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminCrudContextMenu"];
        };
    }
}
