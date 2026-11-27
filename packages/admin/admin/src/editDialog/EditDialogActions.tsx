import { DialogActions, type DialogActionsProps } from "@mui/material";
import { createContext, useContext } from "react";

import { CancelButton } from "../common/buttons/cancel/CancelButton";
import { SaveBoundarySaveButton } from "../saveBoundary/SaveBoundarySaveButton";

interface EditDialogActionsContextValue {
    onCancel: () => void;
}

export const EditDialogActionsContext = createContext<EditDialogActionsContextValue | undefined>(undefined);

/**
 * The cancel and save actions of an `EditDialog` with `disableDialogActions`.
 *
 * Render it inside the form, so the save button is the form's submit button and pressing Enter in a field saves the dialog.
 */
export function EditDialogActions(props: DialogActionsProps) {
    const editDialogActionsContext = useContext(EditDialogActionsContext);
    if (!editDialogActionsContext) {
        throw new Error("EditDialogActions must be inside EditDialog");
    }

    return (
        <DialogActions {...props}>
            <CancelButton onClick={editDialogActionsContext.onCancel} />
            {/* Submitting the form saves the SaveBoundary, so the button must not save on click as well */}
            <SaveBoundarySaveButton disabled={false} type="submit" onClick={undefined} />
        </DialogActions>
    );
}
