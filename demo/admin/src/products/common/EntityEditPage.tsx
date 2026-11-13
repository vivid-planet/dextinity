import { RouterPrompt } from "@dextinity/admin";
import { useRouterLinkClick } from "@dextinity/cms-admin";
import {
    Banner,
    Button,
    EditLayout,
    EmptyState,
    Icon,
    PageHeader,
    Panel,
    SaveState,
    Skeleton,
    ToastViewport,
    Tooltip,
    useKeyboardShortcut,
    useToasts,
} from "@dextinity/ui";
import { focusOnError, useFormSaveState, useHasUnsavedChanges } from "@dextinity/ui-react-final-form";
import { deepEqual } from "fast-equals";
import { FORM_ERROR, type FormApi, type SubmissionErrors } from "final-form";
import { type PropsWithChildren, type ReactNode, useEffect, useRef, useState } from "react";
import { Form, useForm, useFormState } from "react-final-form";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

import styles from "./EntityEditPage.module.css";

const formDecorators = [focusOnError];

interface EntityEditPageSaveResult {
    /** The id of the entry that was created, to open its edit page. */
    createdId?: string;
    /** Errors of fields, or `[FORM_ERROR]`, that keep the form unsaved. */
    errors?: SubmissionErrors;
}

interface EntityEditPageProps<Values extends object> {
    listUrl: string;
    listLabel: string;
    /** The URL of the page; navigating within it, e.g. between tabs, keeps the unsaved changes without asking. */
    pageUrl: string;
    /**
     * Whether a path still shows this page's form, so leaving the unsaved changes there needs no confirmation.
     * @defaultValue the `pageUrl` and the paths below it
     */
    isPathOfPage?: (pathname: string) => boolean;
    title: string;
    subtitle?: ReactNode;
    initialValues: Values;
    /** Whether someone else saved the entry since it was loaded; the user can then overwrite it. */
    hasSaveConflict?: () => Promise<boolean>;
    save: (values: Values, form: FormApi<Values>) => Promise<EntityEditPageSaveResult>;
    /** The URL of the edit page of a created entry. */
    getEditUrl: (id: string) => string;
    savedAt?: Date;
    isNew: boolean;
    aside?: ReactNode;
    asideLabel?: string;
    /** Content between the header and the form, e.g. tabs. */
    beforeContent?: ReactNode;
}

/**
 * An edit page of the handmade product screens: the header with back link, save state and save button, the form in an `EditLayout`,
 * the save conflict check, notifications, and the guards against losing unsaved changes.
 */
export function EntityEditPage<Values extends object>({
    listUrl,
    listLabel,
    pageUrl,
    isPathOfPage = (pathname) => pathname === pageUrl || pathname.startsWith(`${pageUrl}/`),
    title,
    subtitle,
    initialValues,
    hasSaveConflict,
    save,
    getEditUrl,
    savedAt,
    isNew,
    aside,
    asideLabel,
    beforeContent,
    children,
}: PropsWithChildren<EntityEditPageProps<Values>>) {
    const intl = useIntl();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const shouldOverwriteNewerVersion = useRef(false);
    const [createdId, setCreatedId] = useState<string>();

    const submit = async (values: Values, form: FormApi<Values>): Promise<SubmissionErrors | undefined> => {
        const overwriteNewerVersion = shouldOverwriteNewerVersion.current;
        shouldOverwriteNewerVersion.current = false;
        try {
            if (hasSaveConflict && !overwriteNewerVersion && (await hasSaveConflict())) {
                const conflictMessage = intl.formatMessage({
                    id: "uiDemo.productsCommon.saveConflict",
                    defaultMessage: "Not saved: someone else saved this in the meantime",
                });
                addToast({
                    tone: "error",
                    message: conflictMessage,
                    action: {
                        label: intl.formatMessage({ id: "uiDemo.productsCommon.overwrite", defaultMessage: "Overwrite" }),
                        onClick: () => {
                            shouldOverwriteNewerVersion.current = true;
                            void form.submit();
                        },
                    },
                });
                return { [FORM_ERROR]: conflictMessage };
            }
            const result = await save(values, form);
            if (result.errors) {
                return result.errors;
            }
            if (result.createdId) {
                setCreatedId(result.createdId);
            }
            addToast({ message: intl.formatMessage({ id: "uiDemo.productsCommon.saved", defaultMessage: "Saved" }) });
            return undefined;
        } catch (error) {
            const failureMessage = intl.formatMessage(
                { id: "uiDemo.productsCommon.saveFailed", defaultMessage: "Saving failed: {reason}" },
                { reason: error instanceof Error ? error.message : String(error) },
            );
            addToast({ tone: "error", message: failureMessage });
            return { [FORM_ERROR]: failureMessage };
        }
    };

    return (
        <>
            <Form<Values>
                onSubmit={submit}
                initialValues={initialValues}
                initialValuesEqual={deepEqual}
                keepDirtyOnReinitialize
                decorators={formDecorators}
            >
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <EntityEditPageContent
                            listUrl={listUrl}
                            listLabel={listLabel}
                            isPathOfPage={isPathOfPage}
                            title={title}
                            subtitle={subtitle}
                            createdUrl={createdId ? getEditUrl(createdId) : undefined}
                            savedAt={savedAt}
                            isNew={isNew}
                            aside={aside}
                            asideLabel={asideLabel}
                            beforeContent={beforeContent}
                        >
                            {children}
                        </EntityEditPageContent>
                    </form>
                )}
            </Form>
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "uiDemo.productsCommon.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}

interface EntityEditPageContentProps {
    listUrl: string;
    listLabel: string;
    isPathOfPage: (pathname: string) => boolean;
    title: string;
    subtitle?: ReactNode;
    createdUrl?: string;
    savedAt?: Date;
    isNew: boolean;
    aside?: ReactNode;
    asideLabel?: string;
    beforeContent?: ReactNode;
}

function EntityEditPageContent({
    listUrl,
    listLabel,
    isPathOfPage,
    title,
    subtitle,
    createdUrl,
    savedAt,
    isNew,
    aside,
    asideLabel,
    beforeContent,
    children,
}: PropsWithChildren<EntityEditPageContentProps>) {
    const intl = useIntl();
    const history = useHistory();
    const form = useForm();
    const navigateWithRouter = useRouterLinkClick();
    const { state: saveState } = useFormSaveState();
    const hasUnsavedChanges = useHasUnsavedChanges();
    const { submitError } = useFormState({ subscription: { submitError: true } });

    useEffect(() => {
        if (createdUrl && !hasUnsavedChanges) {
            history.replace(createdUrl);
        }
    }, [createdUrl, hasUnsavedChanges, history]);

    useEffect(() => {
        if (!hasUnsavedChanges) {
            return;
        }
        const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warnBeforeUnload);
        return () => window.removeEventListener("beforeunload", warnBeforeUnload);
    }, [hasUnsavedChanges]);

    useKeyboardShortcut("mod+s", () => void form.submit(), { allowInEditable: true });

    const submitAndReportSuccess = async () => {
        await form.submit();
        const { hasValidationErrors, hasSubmitErrors } = form.getState();
        return !hasValidationErrors && !hasSubmitErrors;
    };

    return (
        <RouterPrompt
            message={(location) =>
                hasUnsavedChanges && !isPathOfPage(location.pathname)
                    ? intl.formatMessage({ id: "uiDemo.productsCommon.unsavedChangesPrompt", defaultMessage: "Do you want to save your changes?" })
                    : true
            }
            saveAction={submitAndReportSuccess}
            resetAction={() => form.reset()}
        >
            <EditLayout
                variant="form"
                header={
                    <PageHeader
                        back={{ label: listLabel, href: listUrl }}
                        slotProps={{ back: { onClick: navigateWithRouter } }}
                        title={title}
                        subtitle={subtitle}
                        actions={
                            <>
                                <SaveState
                                    state={saveState}
                                    savedAt={savedAt}
                                    locale={intl.locale}
                                    labels={{
                                        saved: intl.formatMessage({
                                            id: "uiDemo.productsCommon.saveState.saved",
                                            defaultMessage: "All changes saved",
                                        }),
                                        dirty: intl.formatMessage({ id: "uiDemo.productsCommon.saveState.dirty", defaultMessage: "Unsaved changes" }),
                                        saving: intl.formatMessage({ id: "uiDemo.productsCommon.saveState.saving", defaultMessage: "Saving …" }),
                                        error: intl.formatMessage({ id: "uiDemo.productsCommon.saveState.error", defaultMessage: "Not saved" }),
                                        savedAt: intl.formatMessage({
                                            id: "uiDemo.productsCommon.saveState.lastSaved",
                                            defaultMessage: "Last saved",
                                        }),
                                    }}
                                />
                                <Tooltip
                                    content={intl.formatMessage({ id: "uiDemo.productsCommon.saveTooltip", defaultMessage: "Save the changes" })}
                                    shortcut="mod+s"
                                >
                                    <Button
                                        type="submit"
                                        startIcon={<Icon name="check" />}
                                        loading={saveState === "saving"}
                                        disabled={!hasUnsavedChanges && !isNew}
                                    >
                                        {intl.formatMessage({ id: "uiDemo.productsCommon.save", defaultMessage: "Save" })}
                                    </Button>
                                </Tooltip>
                            </>
                        }
                    />
                }
                aside={aside}
                asideLabel={asideLabel}
            >
                <div className={styles.content}>
                    {beforeContent}
                    {submitError != null && <Banner tone="error">{submitError}</Banner>}
                    {children}
                </div>
            </EditLayout>
        </RouterPrompt>
    );
}

interface EntityEditPageStatusProps {
    listUrl: string;
    listLabel: string;
    /** The reason the entry can't be shown; without it, the page is loading. */
    loadError?: string;
}

/** The edit page while its entry loads, or when it can't be loaded. */
export function EntityEditPageStatus({ listUrl, listLabel, loadError }: EntityEditPageStatusProps) {
    const intl = useIntl();
    const navigateWithRouter = useRouterLinkClick();
    if (loadError === undefined) {
        return (
            <EditLayout header={<Skeleton variant="text" width="40%" />} loading>
                <Panel>
                    <Skeleton variant="row" count={5} />
                </Panel>
            </EditLayout>
        );
    }
    return (
        <EditLayout
            header={
                <PageHeader
                    back={{ label: listLabel, href: listUrl }}
                    slotProps={{ back: { onClick: navigateWithRouter } }}
                    title={intl.formatMessage({ id: "uiDemo.productsCommon.loadFailed", defaultMessage: "This entry can't be opened" })}
                />
            }
        >
            <Panel>
                <EmptyState
                    icon={<Icon name="warning-triangle" />}
                    title={loadError}
                    actions={
                        <Button variant="outlined" color="secondary" size="small" href={listUrl} onClick={navigateWithRouter}>
                            {intl.formatMessage({ id: "uiDemo.productsCommon.backToList", defaultMessage: "Back to the list" })}
                        </Button>
                    }
                />
            </Panel>
        </EditLayout>
    );
}
