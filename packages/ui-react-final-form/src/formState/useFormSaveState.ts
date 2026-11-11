import type { SaveStateValue } from "@dextinity/ui";
import type { FormState } from "final-form";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-final-form";

const subscription = { submitting: true, dirty: true, dirtySinceLastSubmit: true, submitSucceeded: true, hasSubmitErrors: true } as const;

type SaveRelevantFormState = Pick<FormState<object>, keyof typeof subscription>;

export function hasUnsavedChanges({ dirty, dirtySinceLastSubmit, submitSucceeded }: SaveRelevantFormState) {
    return submitSucceeded ? dirtySinceLastSubmit : dirty;
}

export function toSaveState(formState: SaveRelevantFormState): SaveStateValue {
    if (formState.submitting) {
        return "saving";
    }
    if (formState.hasSubmitErrors && !formState.dirtySinceLastSubmit) {
        return "error";
    }
    return hasUnsavedChanges(formState) ? "dirty" : "saved";
}

/**
 * The save state of the surrounding form, to spread on `SaveState`.
 */
export interface FormSaveState {
    /** `saving` while submitting, `error` when the last submit failed with submit errors and nothing changed since, `dirty` with unsaved changes, otherwise `saved`. */
    state: SaveStateValue;
    /** When the form was last submitted successfully during this visit. */
    savedAt?: Date;
}

/**
 * The save state of the surrounding React Final Form form, for `SaveState`: `<SaveState {...useFormSaveState()} />`.
 */
export function useFormSaveState(): FormSaveState {
    const formState = useFormState({ subscription });
    const [savedAt, setSavedAt] = useState<Date>();
    const wasSubmitting = useRef(false);

    useEffect(() => {
        if (wasSubmitting.current && !formState.submitting && formState.submitSucceeded) {
            setSavedAt(new Date());
        }
        wasSubmitting.current = formState.submitting;
    }, [formState.submitting, formState.submitSucceeded]);

    return { state: toSaveState(formState), savedAt };
}

/**
 * Whether the surrounding React Final Form form has changes that are not saved: changed since the initial values, or since the last
 * successful submit. Use it to ask before leaving, e.g. with a `ConfirmDialog`.
 */
export function useHasUnsavedChanges(): boolean {
    return hasUnsavedChanges(useFormState({ subscription }));
}
