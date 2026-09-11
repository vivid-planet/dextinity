import { CancelButton, messages, SaveBoundary, SaveBoundarySaveButton } from "@dextinity/admin";
import { Add } from "@dextinity/admin-icons";
import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { FormattedMessage } from "react-intl";

import type { ContentScope } from "./ContentScopeDataGrid";
import { SelectScopesDialogContent } from "./selectScopesDialogContent/SelectScopesDialogContent";

interface AddContentScopeDialogProps {
    open: boolean;
    onClose: () => void;
    /** Called with the scope selected in the dialog. The dialog closes after this resolves. */
    onAdd: (scope: ContentScope) => Promise<void> | void;
}

export function AddContentScopeDialog({ open, onClose, onAdd }: AddContentScopeDialogProps) {
    return (
        <SaveBoundary onAfterSave={onClose}>
            <Dialog open={open} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <FormattedMessage id="dextinity.userPermissions.addScope" defaultMessage="Add scope" />
                </DialogTitle>
                <DialogContent>
                    <SelectScopesDialogContent onSubmit={onAdd} />
                </DialogContent>
                <DialogActions>
                    <CancelButton onClick={onClose}>
                        <FormattedMessage {...messages.close} />
                    </CancelButton>
                    <SaveBoundarySaveButton startIcon={<Add />}>
                        <FormattedMessage id="dextinity.userPermissions.addScope" defaultMessage="Add scope" />
                    </SaveBoundarySaveButton>
                </DialogActions>
            </Dialog>
        </SaveBoundary>
    );
}
