import { useApolloClient } from "@apollo/client";
import { type IEditDialogApi, RowActionsItem, RowActionsMenu, useStackSwitchApi, writeClipboardText } from "@dextinity/admin";
import { Add, Delete, Domain, Edit, Preview, PreviewUnavailable, Settings, Translate } from "@dextinity/admin-icons";
import { Divider } from "@mui/material";
import { type PropsWithChildren, useState } from "react";
import { FormattedMessage } from "react-intl";

import { useContentScope } from "../../contentScope/Provider";
import { serializeInitialValues } from "../../form/serializeInitialValues";
import { openSitePreviewWindow } from "../../preview/openSitePreviewWindow";
import { usePageTreeConfig } from "../pageTreeConfig";
import { CopyPasteMenuItem } from "./CopyPasteMenuItem";
import { MovePageMenuItem } from "./MovePageMenuItem";
import { deletePageMutation, type GQLDeletePageTreeNodeMutation, type GQLDeletePageTreeNodeMutationVariables } from "./Page";
import { PageDeleteDialog } from "./PageDeleteDialog";
import { subTreeFromNode, traverse } from "./treemap/TreeMapUtils";
import type { GQLPageTreePageFragment, PageTreePage } from "./usePageTree";
import { usePageTreeContext } from "./usePageTreeContext";
import { useTranslatePagesAction } from "./useTranslatePagesAction";

interface Props {
    page: PageTreePage;
    editDialog: IEditDialogApi;
    siteUrl: string;
}

export default function PageActions({ page, editDialog, children, siteUrl }: PropsWithChildren<Props>) {
    const { tree } = usePageTreeContext();
    const { match: contentScopeMatch } = useContentScope();
    const { documentTypes, allowPageDelete = true } = usePageTreeConfig();
    const stackSwitchApi = useStackSwitchApi();
    const client = useApolloClient();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const documentType = documentTypes[page.documentType];
    const {
        dialogs: translateDialogs,
        enabled: translateEnabled,
        hasTranslatableContent,
        translating,
        openDialog: openTranslateDialog,
    } = useTranslatePagesAction({
        pages: [page],
        documentTypes,
    });
    const isEditable = !!(page.visibility !== "Archived" && documentType.editComponent);

    const handleDeleteClick = async () => {
        const subTree = subTreeFromNode(page, tree);
        const deletedOrderedNodes: GQLPageTreePageFragment[] = [];
        traverse(
            subTree,
            (element) => {
                deletedOrderedNodes.push(element);
            },
            "post-order",
        );
        for (const node of deletedOrderedNodes) {
            await client.mutate<GQLDeletePageTreeNodeMutation, GQLDeletePageTreeNodeMutationVariables>({
                mutation: deletePageMutation,
                variables: { id: node.id },
                refetchQueries: ["Pages"],
            });
        }
        setDeleteDialogOpen(false);
    };

    return (
        <>
            <RowActionsMenu>
                {children}
                {page.visibility !== "Archived" && [
                    <RowActionsItem
                        key="edit"
                        disabled={!isEditable}
                        icon={<Edit />}
                        onClick={() => {
                            stackSwitchApi.activatePage("edit", String(page.id));
                        }}
                        componentsProps={{
                            iconButton: {
                                color: "primary",
                            },
                        }}
                    >
                        <FormattedMessage id="dextinity.pages.pages.page.editContent" defaultMessage="Edit content" />
                    </RowActionsItem>,
                    documentType.SitePreviewAction ? (
                        <documentType.SitePreviewAction key="preview" pageTreeNode={page} />
                    ) : (
                        <RowActionsItem
                            key="preview"
                            icon={documentType.hasNoSitePreview ? <PreviewUnavailable /> : <Preview />}
                            onClick={() => {
                                openSitePreviewWindow(page.path, contentScopeMatch.url);
                            }}
                            disabled={documentType.hasNoSitePreview}
                        >
                            <FormattedMessage id="dextinity.pages.pages.page.openPreview" defaultMessage="Open preview" />
                        </RowActionsItem>
                    ),
                ]}
                <RowActionsMenu>
                    {page.visibility !== "Archived" && [
                        <RowActionsItem
                            key="pageProperties"
                            icon={<Settings />}
                            onClick={() => {
                                editDialog?.openEditDialog(page.id);
                            }}
                        >
                            <FormattedMessage id="dextinity.pages.pages.page.properties" defaultMessage="Page properties" />
                        </RowActionsItem>,
                        <RowActionsItem
                            key="copyUrl"
                            icon={<Domain />}
                            onClick={() => {
                                writeClipboardText(`${siteUrl}${page.path}`);
                            }}
                        >
                            <FormattedMessage id="dextinity.pages.pages.page.copyUrl" defaultMessage="Copy URL" />
                        </RowActionsItem>,
                        <Divider key="divider1" />,
                        <RowActionsItem
                            key="newSubpage"
                            icon={<Add />}
                            onClick={() => {
                                editDialog?.openAddDialog(serializeInitialValues({ parent: page.id }));
                            }}
                        >
                            <FormattedMessage id="dextinity.pages.pages.page.newSubpage" defaultMessage="New subpage" />
                        </RowActionsItem>,
                        <MovePageMenuItem key="movePage" page={page} />,
                        <Divider key="divider2" />,
                        <CopyPasteMenuItem key="copyPaste" page={page} />,
                        translateEnabled && (
                            <RowActionsItem
                                key="translate"
                                icon={<Translate />}
                                disabled={translating || !hasTranslatableContent}
                                onClick={openTranslateDialog}
                            >
                                <FormattedMessage id="dextinity.translator.translate" defaultMessage="Translate" />
                            </RowActionsItem>
                        ),
                        <Divider key="divider3" />,
                    ]}
                    {allowPageDelete && (
                        <RowActionsItem
                            icon={<Delete />}
                            disabled={page.slug === "home"}
                            onClick={() => {
                                setDeleteDialogOpen(true);
                            }}
                        >
                            <FormattedMessage id="dextinity.pages.pages.page.delete" defaultMessage="Delete" />
                        </RowActionsItem>
                    )}
                </RowActionsMenu>
            </RowActionsMenu>
            {translateDialogs}
            <PageDeleteDialog
                dialogOpen={deleteDialogOpen}
                handleCancelClick={() => {
                    setDeleteDialogOpen(false);
                }}
                handleDeleteClick={handleDeleteClick}
                selectedNodes={[page]}
            />
        </>
    );
}
