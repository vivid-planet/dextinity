import { RouterPrompt } from "@dextinity/admin";
import { ConfirmDialog, Icon } from "@dextinity/ui";
import type * as History from "history";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

export interface UnsavedChangesPromptProps {
    /** Whether there are unsaved changes. Without them, leaving isn't interrupted. */
    hasChanges: boolean;
    /** Saves the changes before leaving. Resolves `false` when saving failed, which keeps the user on the page. */
    onSave: () => Promise<boolean>;
    /** Discards the changes before leaving. */
    onDiscard: () => void;
    /** Navigating to this path or below it stays within the editor and isn't interrupted, e.g. switching tabs or opening a nested block. */
    allowWithin: string;
}

interface PendingNavigation {
    location: History.Location;
    action: History.Action;
}

/**
 * Asks whether to save or discard unsaved changes before the user leaves an editor, in a `ConfirmDialog` of `@dextinity/ui`. Closing or
 * reloading the browser tab shows the browser's own warning instead.
 */
export function UnsavedChangesPrompt({ hasChanges, onSave, onDiscard, allowWithin }: UnsavedChangesPromptProps) {
    const intl = useIntl();
    const history = useHistory();
    const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation>();
    const [saving, setSaving] = useState(false);
    const isLeavingConfirmedRef = useRef(false);
    const historyKeys = useHistoryKeys();

    useEffect(() => {
        if (!hasChanges) {
            return;
        }
        const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warnBeforeUnload);
        return () => window.removeEventListener("beforeunload", warnBeforeUnload);
    }, [hasChanges]);

    const leave = (navigation: PendingNavigation) => {
        isLeavingConfirmedRef.current = true;
        setPendingNavigation(undefined);
        if (navigation.action === "POP") {
            // The browser's back and forward buttons go through the history again instead of adding the target as a new entry. The
            // navigation happens asynchronously, so leaving stays confirmed until it did.
            const stopListening = history.listen(() => {
                stopListening();
                isLeavingConfirmedRef.current = false;
            });
            history.go(historyKeys.getDelta(navigation.location.key));
            return;
        }
        if (navigation.action === "REPLACE") {
            history.replace(navigation.location);
        } else {
            history.push(navigation.location);
        }
        isLeavingConfirmedRef.current = false;
    };

    const saveAndLeave = async () => {
        if (pendingNavigation == null) {
            return;
        }
        setSaving(true);
        let saved = false;
        try {
            saved = await onSave();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
        if (saved) {
            leave(pendingNavigation);
        } else {
            setPendingNavigation(undefined);
        }
    };

    const discardAndLeave = () => {
        if (pendingNavigation == null) {
            return;
        }
        onDiscard();
        leave(pendingNavigation);
    };

    return (
        <>
            <RouterPrompt
                message={(location, action) => {
                    if (!hasChanges || isLeavingConfirmedRef.current || location.pathname.startsWith(allowWithin)) {
                        return true;
                    }
                    setPendingNavigation({ location, action });
                    return false;
                }}
            />
            <ConfirmDialog
                open={pendingNavigation != null}
                onOpenChange={(open) => {
                    if (!open && !saving) {
                        setPendingNavigation(undefined);
                    }
                }}
                title={intl.formatMessage({ id: "dextinity.unsavedChanges.title", defaultMessage: "Save your changes?" })}
                description={intl.formatMessage({
                    id: "dextinity.unsavedChanges.description",
                    defaultMessage: "You have unsaved changes. Save them before leaving, or discard them.",
                })}
                confirmLabel={intl.formatMessage({ id: "dextinity.unsavedChanges.save", defaultMessage: "Save and leave" })}
                confirmIcon={<Icon name="check" />}
                onConfirm={() => void saveAndLeave()}
                secondaryLabel={intl.formatMessage({ id: "dextinity.unsavedChanges.discard", defaultMessage: "Discard changes" })}
                onSecondary={discardAndLeave}
                loading={saving}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.unsavedChanges.cancel", defaultMessage: "Stay" }) }}
            />
        </>
    );
}

/**
 * Follows the history entries visited while the editor is open, to find how far back or forward a blocked back or forward navigation
 * went. An entry from before the editor opened is taken to be the one right before the first entry seen.
 */
function useHistoryKeys() {
    const history = useHistory();
    const keysRef = useRef<Array<string | undefined>>([history.location.key]);
    const indexRef = useRef(0);

    useEffect(
        () =>
            history.listen((location, action) => {
                const keys = keysRef.current;
                // Reverting a blocked back or forward navigation notifies again with the current entry and the previous action
                if (location.key === keys[indexRef.current]) {
                    return;
                }
                if (action === "PUSH") {
                    keys.splice(indexRef.current + 1, keys.length, location.key);
                    indexRef.current = keys.length - 1;
                } else if (action === "REPLACE") {
                    keys[indexRef.current] = location.key;
                } else {
                    const index = keys.indexOf(location.key);
                    if (index === -1) {
                        keys.splice(0, indexRef.current, location.key);
                        indexRef.current = 0;
                    } else {
                        indexRef.current = index;
                    }
                }
            }),
        [history],
    );

    return {
        getDelta: (key: string | undefined) => {
            const index = key != null ? keysRef.current.indexOf(key) : -1;
            return index === -1 ? -(indexRef.current + 1) : index - indexRef.current;
        },
    };
}
