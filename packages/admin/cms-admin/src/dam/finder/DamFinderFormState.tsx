import { RouterPrompt } from "@dextinity/admin";
import { SaveState } from "@dextinity/ui";
import { useFormSaveState, useHasUnsavedChanges } from "@dextinity/ui-react-final-form";
import { useEffect, useMemo } from "react";
import { useForm } from "react-final-form";
import { useIntl } from "react-intl";

export interface DamFinderUnsavedChanges {
    save: () => Promise<boolean>;
    discard: () => void;
}

export function DamFinderFormSaveState() {
    const intl = useIntl();
    return (
        <SaveState
            {...useFormSaveState()}
            locale={intl.locale}
            labels={{
                saved: intl.formatMessage({ id: "dextinity.damFinder.saveState.saved", defaultMessage: "All changes saved" }),
                dirty: intl.formatMessage({ id: "dextinity.damFinder.saveState.dirty", defaultMessage: "Unsaved changes" }),
                saving: intl.formatMessage({ id: "dextinity.damFinder.saveState.saving", defaultMessage: "Saving …" }),
                error: intl.formatMessage({ id: "dextinity.damFinder.saveState.error", defaultMessage: "Not saved" }),
                savedAt: intl.formatMessage({ id: "dextinity.damFinder.saveState.savedAt", defaultMessage: "Saved '{time}'" }),
            }}
        />
    );
}

interface DamFinderUnsavedChangesGuardProps {
    onUnsavedChangesChange: (unsavedChanges: DamFinderUnsavedChanges | undefined) => void;
}

export function DamFinderUnsavedChangesGuard({ onUnsavedChangesChange }: DamFinderUnsavedChangesGuardProps) {
    const intl = useIntl();
    const form = useForm();
    const hasUnsavedChanges = useHasUnsavedChanges();

    const unsavedChanges = useMemo<DamFinderUnsavedChanges>(
        () => ({
            save: async () => {
                await form.submit();
                const { valid, hasSubmitErrors } = form.getState();
                return valid && !hasSubmitErrors;
            },
            discard: () => form.reset(),
        }),
        [form],
    );

    useEffect(() => {
        onUnsavedChangesChange(hasUnsavedChanges ? unsavedChanges : undefined);
    }, [hasUnsavedChanges, unsavedChanges, onUnsavedChangesChange]);

    useEffect(() => () => onUnsavedChangesChange(undefined), [onUnsavedChangesChange]);

    return (
        <RouterPrompt
            message={() =>
                hasUnsavedChanges
                    ? intl.formatMessage({ id: "dextinity.damFinder.unsavedChanges.prompt", defaultMessage: "Do you want to save your changes?" })
                    : true
            }
            saveAction={unsavedChanges.save}
            resetAction={unsavedChanges.discard}
        />
    );
}
