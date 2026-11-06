import type { SaveStateValue } from "@dextinity/ui";
import { useEffect, useRef, useState } from "react";
import { type Control, type FieldValues, useFormState, useWatch } from "react-hook-form";

interface SaveRelevantFormState {
    isSubmitting: boolean;
    isDirty: boolean;
    isSubmitted: boolean;
    isSubmitSuccessful: boolean;
    changedSinceLastSubmit: boolean;
}

export function hasUnsavedChanges({ isDirty, isSubmitSuccessful, changedSinceLastSubmit }: SaveRelevantFormState) {
    return isSubmitSuccessful ? changedSinceLastSubmit : isDirty;
}

export function toSaveState(formState: SaveRelevantFormState): SaveStateValue {
    if (formState.isSubmitting) {
        return "saving";
    }
    if (formState.isSubmitted && !formState.isSubmitSuccessful && !formState.changedSinceLastSubmit) {
        return "error";
    }
    return hasUnsavedChanges(formState) ? "dirty" : "saved";
}

function serializeValues(values: unknown) {
    return JSON.stringify(values) ?? "";
}

function useSaveRelevantFormState<TFieldValues extends FieldValues>(control: Control<TFieldValues> | undefined): SaveRelevantFormState {
    const { isSubmitting, isDirty, isSubmitted, isSubmitSuccessful, submitCount } = useFormState({ control });
    // React Hook Form compares with the default values only, so the values at the last submit tell whether something changed since
    const values = useWatch({ control, compute: serializeValues });
    const [lastSubmit, setLastSubmit] = useState({ isSubmitting, submitCount, values });
    if (isSubmitting && !lastSubmit.isSubmitting) {
        setLastSubmit({ isSubmitting, submitCount, values });
    } else if (!isSubmitting && (lastSubmit.isSubmitting || lastSubmit.submitCount !== submitCount)) {
        // reset() in a submit handler sets submitCount back, so a changed submitCount only catches submits that never rendered as submitting
        setLastSubmit({ isSubmitting, submitCount, values: lastSubmit.isSubmitting ? lastSubmit.values : values });
    }
    return { isSubmitting, isDirty, isSubmitted, isSubmitSuccessful, changedSinceLastSubmit: values !== lastSubmit.values };
}

/**
 * Options of the form state hooks.
 */
export interface FormStateHookOptions<TFieldValues extends FieldValues = FieldValues> {
    /** The form's `control` from `useForm`. Defaults to the one of the surrounding `FormProvider`. */
    control?: Control<TFieldValues>;
}

/**
 * The save state of the surrounding form, to spread on `SaveState`.
 */
export interface FormSaveState {
    /** `saving` while submitting, `error` when the last submit failed and nothing changed since, `dirty` with unsaved changes, otherwise `saved`. */
    state: SaveStateValue;
    /** When the form was last submitted successfully during this visit. */
    savedAt?: Date;
}

/**
 * The save state of the surrounding React Hook Form form, for `SaveState`: `<SaveState {...useFormSaveState()} />`.
 */
export function useFormSaveState<TFieldValues extends FieldValues = FieldValues>({
    control,
}: FormStateHookOptions<TFieldValues> = {}): FormSaveState {
    const formState = useSaveRelevantFormState(control);
    const [savedAt, setSavedAt] = useState<Date>();
    const wasSubmitting = useRef(false);

    useEffect(() => {
        if (wasSubmitting.current && !formState.isSubmitting && formState.isSubmitSuccessful) {
            setSavedAt(new Date());
        }
        wasSubmitting.current = formState.isSubmitting;
    }, [formState.isSubmitting, formState.isSubmitSuccessful]);

    return { state: toSaveState(formState), savedAt };
}

/**
 * Whether the surrounding React Hook Form form has changes that are not saved: changed since the default values, or since the last
 * successful submit. Use it to ask before leaving, e.g. with a `ConfirmDialog`.
 */
export function useHasUnsavedChanges<TFieldValues extends FieldValues = FieldValues>({ control }: FormStateHookOptions<TFieldValues> = {}): boolean {
    return hasUnsavedChanges(useSaveRelevantFormState(control));
}
