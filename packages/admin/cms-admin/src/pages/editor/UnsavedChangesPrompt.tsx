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
        const saved = await onSave();
        setSaving(false);
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
