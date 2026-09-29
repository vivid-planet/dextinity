import { messages, SaveButton } from "@dextinity/admin";
import { type ComponentProps, type JSX, type ReactNode, useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";

interface SaveStateOptions<TData> {
    hasChanges: boolean;
    saveConflict: {
        dialogs: ReactNode;
        checkForConflicts: () => Promise<boolean>;
    };
    mode: "edit" | "add";
    save: () => Promise<TData>;
    navigateToEditPage: (data: TData) => Promise<void>;
    validate: () => Promise<boolean>;
    updateReferenceContent: (data: TData) => void;
}
interface SaveStateReturn {
    handleSaveClick: () => Promise<void>;
    saving: boolean;
    saveError: "invalid" | "conflict" | "error" | undefined;
    saveButton: JSX.Element;
}

export function useSaveState<TData>(options: SaveStateOptions<TData>): SaveStateReturn {
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<"invalid" | "conflict" | "error" | undefined>();

    const handleSaveClick = useCallback(
        async (canNavigate = false) => {
            setSaving(true);
            setSaveError(undefined);
            const isValid = await options.validate();

            if (!isValid) {
                //onValidationFailed && onValidationFailed();
                setSaving(false);
                setSaveError("invalid");
                return;
            }

            if (options.mode === "edit") {
                const hasSaveConflict = await options.saveConflict.checkForConflicts();
                if (hasSaveConflict) {
                    setSaving(false);
                    setSaveError("conflict");
                    return; // dialogs open for the user to handle the conflict
                }
            }

            try {
                const data = await options.save();
                options.updateReferenceContent(data);
                setTimeout(() => {
                    if (canNavigate) {
                        options.navigateToEditPage(data);
                    }
                }, 0);
            } catch (error) {
                console.error(error);
                setSaveError("error");
            } finally {
                setSaving(false);
            }
        },
        [options],
    );

    const saveButton = (
        <SaveStateSaveButton hasChanges={options.hasChanges} handleSaveClick={handleSaveClick} saveError={saveError} loading={saving} />
    );

    return {
        handleSaveClick,
        saving,
        saveError,
        saveButton,
    };
}

interface SaveStateSaveButtonProps {
    handleSaveClick: (canNavigate?: boolean) => Promise<void>;
    hasChanges?: boolean;
    loading: boolean;
    saveError: "invalid" | "conflict" | "error" | undefined;
}

function SaveStateSaveButton({ handleSaveClick, hasChanges, loading, saveError }: SaveStateSaveButtonProps): JSX.Element {
    const saveButtonProps: Omit<ComponentProps<typeof SaveButton>, "children" | "onClick"> = {
        loading,
        hasErrors: !!saveError,
        tooltipErrorMessage:
            saveError == "invalid" ? (
                <FormattedMessage {...messages.invalidData} />
            ) : saveError == "conflict" ? (
                <FormattedMessage {...messages.saveConflict} />
            ) : undefined,
    };

    return (
        <SaveButton
            disabled={!hasChanges}
            onClick={async () => {
                await handleSaveClick(true);
            }}
            {...saveButtonProps}
        />
    );
}
