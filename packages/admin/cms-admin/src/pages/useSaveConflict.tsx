import { Alert, useSnackbarApi } from "@dextinity/admin";
import { Snackbar } from "@mui/material";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

import { SaveConflictDialog } from "./SaveConflictDialog";

interface SaveConflictOptions {
    checkConflict: () => Promise<boolean>;
    hasChanges: () => boolean;
    loadLatestVersion: () => Promise<void>;
    onDiscardButtonPressed: () => Promise<void>;
}

export interface SaveConflictHookReturn {
    dialogs: ReactNode;
    checkForConflicts: () => Promise<boolean>;
    hasConflict: boolean;
}

export function useSaveConflict(options: SaveConflictOptions): SaveConflictHookReturn {
    const { checkConflict, hasChanges, loadLatestVersion, onDiscardButtonPressed } = options;
    const snackbarApi = useSnackbarApi();
    const pollingIntervalId = useRef<number | undefined>(undefined);

    const [showDialog, setShowDialog] = useState(false);
    const [hasConflict, setHasConflict] = useState(false);

    const checkChanges = useCallback(async () => {
        const newHasConflict = await checkConflict();
        //we don't need setHasConflict as that is used during save only
        if (newHasConflict) {
            if (!hasChanges()) {
                // No local changes, server changes available
                await loadLatestVersion();
                snackbarApi.showSnackbar(
                    <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "left" }} autoHideDuration={5000}>
                        <Alert severity="success">
                            <FormattedMessage
                                id="dextinity.saveConflict.autoReloadSuccessfull"
                                defaultMessage="This content has changed. We've refreshed the page for you."
                            />
                        </Alert>
                    </Snackbar>,
                );
            } else {
                // local changes, and server changes available: ask user what to do
                if (!hasConflict) {
                    setShowDialog(true);
                }
                setHasConflict(true);
            }
        } else {
            setShowDialog(false);
            setHasConflict(false);
        }
    }, [checkConflict, hasChanges, hasConflict, loadLatestVersion, snackbarApi]);

    const startPolling = useCallback(() => {
        if (!hasConflict) {
            window.clearInterval(pollingIntervalId.current);
            pollingIntervalId.current = window.setInterval(checkChanges, 10000);
        }
    }, [checkChanges, hasConflict]);

    const stopPolling = useCallback(() => {
        window.clearInterval(pollingIntervalId.current);
        pollingIntervalId.current = undefined;
    }, []);

    useEffect(() => {
        const handleFocus = () => {
            if (!hasConflict) {
                checkChanges();
            }
            startPolling();
        };

        const handleBlur = () => {
            stopPolling();
        };

        window.addEventListener("focus", handleFocus);
        window.addEventListener("blur", handleBlur);

        if (document.hasFocus()) {
            startPolling();
        }

        return () => {
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("blur", handleBlur);

            stopPolling();
        };
    }, [checkConflict, snackbarApi, loadLatestVersion, hasChanges, checkChanges, startPolling, stopPolling, hasConflict]);

    const checkForConflicts = useCallback(async () => {
        const newHasConflict = await checkConflict();
        if (newHasConflict) {
            setShowDialog(true);
            setHasConflict(true);
        }
        return newHasConflict;
    }, [checkConflict]);

    return {
        checkForConflicts,
        hasConflict,
        dialogs: (
            <SaveConflictDialog
                open={showDialog}
                onClosePressed={() => {
                    stopPolling();
                    setShowDialog(false);
                }}
                onDiscardChangesPressed={() => {
                    setHasConflict(false);
                    setShowDialog(false);
                    onDiscardButtonPressed();
                }}
            />
        ),
    };
}
