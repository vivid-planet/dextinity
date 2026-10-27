import { CancelButton, Dialog, FinalForm, SaveButton, TextField } from "@dextinity/admin";
import { DialogActions, DialogContent } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { FormattedMessage, useIntl } from "react-intl";

import { type DamFolderItem, damQueryKeys } from "./damApi.types.js";
import { useDamApi } from "./DamApiProvider.js";

interface FolderDialogProps {
    open: boolean;
    onClose: () => void;
    /** Renames the folder. Without it, the dialog creates a new folder in `parentId`. */
    folder?: Pick<DamFolderItem, "id" | "name">;
    parentId?: string;
}

export function FolderDialog({ open, onClose, folder, parentId }: FolderDialogProps) {
    const intl = useIntl();
    const { client, scope } = useDamApi();
    const queryClient = useQueryClient();

    const handleSubmit = async ({ name }: { name: string }) => {
        if (folder) {
            await parseResponse(client.folders[":id"].$patch({ param: { id: folder.id }, json: { name } }));
        } else {
            await parseResponse(client.folders.$post({ json: { name, parentId, scope } }));
        }
        await queryClient.invalidateQueries({ queryKey: damQueryKeys.all });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            title={
                folder ? (
                    <FormattedMessage id="dextinity.dam.renameFolder" defaultMessage="Rename folder" />
                ) : (
                    <FormattedMessage id="dextinity.dam.addFolder" defaultMessage="Add folder" />
                )
            }
        >
            <FinalForm<{ name: string }> mode={folder ? "edit" : "add"} initialValues={{ name: folder?.name ?? "" }} onSubmit={handleSubmit}>
                {({ submitting }) => (
                    <>
                        <DialogContent>
                            <TextField
                                name="name"
                                label={intl.formatMessage({ id: "dextinity.dam.folderName", defaultMessage: "Name" })}
                                required
                                fullWidth
                                autoFocus
                            />
                        </DialogContent>
                        <DialogActions>
                            <CancelButton onClick={onClose} />
                            <SaveButton type="submit" loading={submitting} />
                        </DialogActions>
                    </>
                )}
            </FinalForm>
        </Dialog>
    );
}
