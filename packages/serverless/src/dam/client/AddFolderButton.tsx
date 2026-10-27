import { Button } from "@dextinity/admin";
import { Add } from "@dextinity/admin-icons";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { FolderDialog } from "./FolderDialog.js";

export function AddFolderButton({ parentId }: { parentId?: string }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <Button variant="secondary" responsive startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                <FormattedMessage id="dextinity.dam.addFolder" defaultMessage="Add folder" />
            </Button>
            {dialogOpen && <FolderDialog open onClose={() => setDialogOpen(false)} parentId={parentId} />}
        </>
    );
}
