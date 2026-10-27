import { DeleteDialog, RowActionsItem, RowActionsMenu, useStackSwitchApi } from "@dextinity/admin";
import { Archive, Delete, Download, Edit, Restore } from "@dextinity/admin-icons";
import { Divider } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { type DamFileItem, type DamFolderItem, type DamItem, damQueryKeys } from "./damApi.types.js";
import { useDamApi } from "./DamApiProvider.js";
import { FolderDialog } from "./FolderDialog.js";

export function DamItemActions({ item }: { item: DamItem }) {
    return item.__typename === "DamFile" ? <FileActions file={item} /> : <FolderActions folder={item} />;
}

function FileActions({ file }: { file: DamFileItem }) {
    const { client, resolveUrl } = useDamApi();
    const queryClient = useQueryClient();
    const stackSwitchApi = useStackSwitchApi();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const setArchived = async (archived: boolean) => {
        const json = { ids: [file.id] };
        await parseResponse(archived ? client.files.archive.$post({ json }) : client.files.restore.$post({ json }));
        await queryClient.invalidateQueries({ queryKey: damQueryKeys.all });
    };

    return (
        <>
            <RowActionsMenu>
                <RowActionsMenu>
                    <RowActionsItem icon={<Edit />} onClick={() => stackSwitchApi.activatePage("edit", file.id)}>
                        <FormattedMessage id="dextinity.dam.edit" defaultMessage="Edit" />
                    </RowActionsItem>
                    <RowActionsItem
                        icon={<Download />}
                        onClick={() => {
                            // The response has `Content-Disposition: attachment`, so the browser downloads the file and stays on the page
                            window.location.assign(resolveUrl(file.downloadUrl));
                        }}
                    >
                        <FormattedMessage id="dextinity.dam.download" defaultMessage="Download" />
                    </RowActionsItem>
                    <RowActionsItem icon={file.archived ? <Restore /> : <Archive />} onClick={() => setArchived(!file.archived)}>
                        {file.archived ? (
                            <FormattedMessage id="dextinity.dam.restore" defaultMessage="Restore" />
                        ) : (
                            <FormattedMessage id="dextinity.dam.archive" defaultMessage="Archive" />
                        )}
                    </RowActionsItem>
                    <Divider />
                    <RowActionsItem icon={<Delete />} onClick={() => setDeleteDialogOpen(true)}>
                        <FormattedMessage id="dextinity.dam.delete" defaultMessage="Delete" />
                    </RowActionsItem>
                </RowActionsMenu>
            </RowActionsMenu>
            <DeleteDialog
                dialogOpen={deleteDialogOpen}
                onCancel={() => setDeleteDialogOpen(false)}
                onDelete={async () => {
                    await parseResponse(client.files[":id"].$delete({ param: { id: file.id } }));
                    await queryClient.invalidateQueries({ queryKey: damQueryKeys.all });
                    setDeleteDialogOpen(false);
                }}
            />
        </>
    );
}

function FolderActions({ folder }: { folder: DamFolderItem }) {
    const { client } = useDamApi();
    const queryClient = useQueryClient();
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    return (
        <>
            <RowActionsMenu>
                <RowActionsMenu>
                    <RowActionsItem icon={<Edit />} onClick={() => setRenameDialogOpen(true)}>
                        <FormattedMessage id="dextinity.dam.rename" defaultMessage="Rename" />
                    </RowActionsItem>
                    <Divider />
                    <RowActionsItem icon={<Delete />} onClick={() => setDeleteDialogOpen(true)}>
                        <FormattedMessage id="dextinity.dam.delete" defaultMessage="Delete" />
                    </RowActionsItem>
                </RowActionsMenu>
            </RowActionsMenu>
            {renameDialogOpen && <FolderDialog open onClose={() => setRenameDialogOpen(false)} folder={folder} />}
            <DeleteDialog
                dialogOpen={deleteDialogOpen}
                onCancel={() => setDeleteDialogOpen(false)}
                onDelete={async () => {
                    await parseResponse(client.folders[":id"].$delete({ param: { id: folder.id } }));
                    await queryClient.invalidateQueries({ queryKey: damQueryKeys.all });
                    setDeleteDialogOpen(false);
                }}
            />
        </>
    );
}
