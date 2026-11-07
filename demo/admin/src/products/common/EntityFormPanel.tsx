import { RouterPrompt } from "@dextinity/admin";
import { Banner, Button, Icon, IconButton, Panel, SaveState, useKeyboardShortcut } from "@dextinity/ui";
import { focusOnError, useFormSaveState, useHasUnsavedChanges } from "@dextinity/ui-react-final-form";
import { deepEqual } from "fast-equals";
import { FORM_ERROR, type FormApi, type SubmissionErrors } from "final-form";
import { type PropsWithChildren, type ReactNode, useEffect, useMemo } from "react";
import { Form, useForm, useFormState } from "react-final-form";
import { useIntl } from "react-intl";

import styles from "./EntityFormPanel.module.css";
import type { PanelUnsavedChanges } from "./usePanelSelection";

const formDecorators = [focusOnError];

interface EntityFormPanelProps<Values extends object> {
    title: string;
    description?: ReactNode;
    initialValues: Values;
    /** Saves the values; return submission errors, e.g. `{ [FORM_ERROR]: message }`, to keep the form unsaved. */
    onSubmit: (values: Values, form: FormApi<Values>) => Promise<SubmissionErrors | undefined>;
    onClose: () => void;
    onUnsavedChangesChange: (unsavedChanges: PanelUnsavedChanges | undefined) => void;
    /** Shown at the start of the footer, e.g. a delete button. */
    footerStart?: ReactNode;
    /** Shown below the form, e.g. details that can't be edited. */
    details?: ReactNode;
}

/**
 * The side panel of a list that creates or edits one entry with a React Final Form form: the fields, the save state, reset and save.
 */
export function EntityFormPanel<Values extends object>({
    title,
    description,
    initialValues,
    onSubmit,
    onClose,
    onUnsavedChangesChange,
    footerStart,
    details,
    children,
}: PropsWithChildren<EntityFormPanelProps<Values>>) {
    const intl = useIntl();
    return (
        <Panel
            title={title}
            description={description}
            actions={
                <IconButton
                    aria-label={intl.formatMessage({ id: "uiDemo.productsCommon.closePanel", defaultMessage: "Close panel" })}
                    variant="text"
                    color="secondary"
                    size="small"
                    onClick={onClose}
                >
                    <Icon name="close" />
                </IconButton>
            }
        >
            <div className={styles.body}>
                <Form<Values>
                    onSubmit={onSubmit}
                    initialValues={initialValues}
                    initialValuesEqual={deepEqual}
                    keepDirtyOnReinitialize
                    decorators={formDecorators}
                >
                    {({ handleSubmit }) => (
                        <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label={title}>
                            <EntityFormPanelContent onUnsavedChangesChange={onUnsavedChangesChange} footerStart={footerStart}>
                                {children}
                            </EntityFormPanelContent>
                        </form>
                    )}
                </Form>
                {details}
            </div>
        </Panel>
    );
}

interface EntityFormPanelContentProps {
    onUnsavedChangesChange: (unsavedChanges: PanelUnsavedChanges | undefined) => void;
    footerStart?: ReactNode;
}

function EntityFormPanelContent({ onUnsavedChangesChange, footerStart, children }: PropsWithChildren<EntityFormPanelContentProps>) {
    const intl = useIntl();
    const form = useForm();
    const { submitError, submitting } = useFormState({ subscription: { submitError: true, submitting: true } });
    const saveState = useFormSaveState();
    const hasUnsavedChanges = useHasUnsavedChanges();

    const unsavedChanges = useMemo<PanelUnsavedChanges>(
        () => ({
            save: async () => {
                await form.submit();
                const { hasValidationErrors, hasSubmitErrors } = form.getState();
                return !hasValidationErrors && !hasSubmitErrors;
            },
            discard: () => form.reset(),
        }),
        [form],
    );

    useEffect(() => {
        onUnsavedChangesChange(hasUnsavedChanges ? unsavedChanges : undefined);
    }, [hasUnsavedChanges, unsavedChanges, onUnsavedChangesChange]);

    useEffect(() => () => onUnsavedChangesChange(undefined), [onUnsavedChangesChange]);

    useEffect(() => {
        if (!hasUnsavedChanges) {
            return;
        }
        const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warnBeforeUnload);
        return () => window.removeEventListener("beforeunload", warnBeforeUnload);
    }, [hasUnsavedChanges]);

    useKeyboardShortcut("mod+s", () => void form.submit(), { allowInEditable: true });

    return (
        <RouterPrompt
            message={() =>
                hasUnsavedChanges
                    ? intl.formatMessage({ id: "uiDemo.productsCommon.unsavedChangesPrompt", defaultMessage: "Do you want to save your changes?" })
                    : true
            }
            saveAction={unsavedChanges.save}
            resetAction={unsavedChanges.discard}
        >
            {submitError != null && <Banner tone="error">{submitError}</Banner>}
            {children}
            <div className={styles.footer}>
                <SaveState
                    {...saveState}
                    locale={intl.locale}
                    labels={{
                        saved: intl.formatMessage({ id: "uiDemo.productsCommon.saveState.saved", defaultMessage: "All changes saved" }),
                        dirty: intl.formatMessage({ id: "uiDemo.productsCommon.saveState.dirty", defaultMessage: "Unsaved changes" }),
                        saving: intl.formatMessage({ id: "uiDemo.productsCommon.saveState.saving", defaultMessage: "Saving …" }),
                        error: intl.formatMessage({ id: "uiDemo.productsCommon.saveState.error", defaultMessage: "Not saved" }),
                        savedAt: intl.formatMessage({ id: "uiDemo.productsCommon.saveState.savedAt", defaultMessage: "Saved '{time}'" }),
                    }}
                />
                <span className={styles.actions}>
                    {footerStart}
                    <Button size="small" variant="text" color="secondary" disabled={!hasUnsavedChanges || submitting} onClick={() => form.reset()}>
                        {intl.formatMessage({ id: "uiDemo.productsCommon.reset", defaultMessage: "Reset" })}
                    </Button>
                    <Button type="submit" size="small" disabled={!hasUnsavedChanges} loading={submitting}>
                        {intl.formatMessage({ id: "uiDemo.productsCommon.save", defaultMessage: "Save" })}
                    </Button>
                </span>
            </div>
        </RouterPrompt>
    );
}

export function toSubmissionError(message: string): SubmissionErrors {
    return { [FORM_ERROR]: message };
}
