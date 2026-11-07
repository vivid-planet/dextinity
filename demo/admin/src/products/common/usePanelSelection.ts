import { useCallback, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router";

export interface PanelUnsavedChanges {
    save: () => Promise<boolean>;
    discard: () => void;
}

/** The value of the selection parameter while the panel creates a new entry. */
export const newEntrySelection = "new";

/**
 * The entry shown in the side panel of a list, kept in the URL so that a link or a reload opens it again. Changing it while the panel
 * has unsaved changes waits for the user to save or discard them.
 */
export function usePanelSelection(paramName = "selected") {
    const location = useLocation();
    const history = useHistory();
    const [unsavedChanges, setUnsavedChanges] = useState<PanelUnsavedChanges>();
    const [pendingSelection, setPendingSelection] = useState<{ id: string | null }>();

    const selectedId = useMemo(() => new URLSearchParams(location.search).get(paramName), [location.search, paramName]);

    const applySelection = useCallback(
        (id: string | null) => {
            const params = new URLSearchParams(location.search);
            if (id === null) {
                params.delete(paramName);
            } else {
                params.set(paramName, id);
            }
            const search = params.toString();
            history.replace({ pathname: location.pathname, search: search ? `?${search}` : "", hash: location.hash });
        },
        [history, location.pathname, location.search, location.hash, paramName],
    );

    const select = useCallback(
        (id: string | null) => {
            if (id === selectedId) {
                return;
            }
            if (unsavedChanges) {
                setPendingSelection({ id });
            } else {
                applySelection(id);
            }
        },
        [selectedId, unsavedChanges, applySelection],
    );

    return {
        selectedId,
        select,
        /** Replaces the selection without asking, e.g. with the id of an entry the panel just created. */
        replaceSelection: applySelection,
        onUnsavedChangesChange: setUnsavedChanges,
        unsavedChangesDialog: {
            open: pendingSelection != null,
            onCancel: () => setPendingSelection(undefined),
            onDiscard: () => {
                unsavedChanges?.discard();
                setUnsavedChanges(undefined);
                if (pendingSelection) {
                    applySelection(pendingSelection.id);
                }
                setPendingSelection(undefined);
            },
            onSave: async () => {
                const nextSelection = pendingSelection;
                setPendingSelection(undefined);
                const isSaved = (await unsavedChanges?.save()) ?? true;
                if (isSaved && nextSelection) {
                    applySelection(nextSelection.id);
                }
            },
        },
    };
}
