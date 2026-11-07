import { useApolloClient } from "@apollo/client";
import { downloadFile, LocalErrorScopeApolloContext } from "@dextinity/admin";
import type { ContentScope } from "@dextinity/cms-admin";
import { Banner, Button, Dialog, DialogFormActions, type FileUploadFile, Icon, ProgressBar } from "@dextinity/ui";
import { CheckboxField, FileUploadField } from "@dextinity/ui-react-final-form";
import { FORM_ERROR, type SubmissionErrors } from "final-form";
import { type JSX, useId, useState } from "react";
import { Form } from "react-final-form";
import { useIntl } from "react-intl";

import type { GQLCsvImportInformation } from "../../graphql.generated";
import { useBrevoConfig } from "../BrevoConfigProvider";
import { startBrevoContactImportMutation } from "./ContactImportDialog.gql";
import type { GQLStartContactImportMutation, GQLStartContactImportMutationVariables } from "./ContactImportDialog.gql.generated";
import { DialogBody, ResultSummary } from "./ContactImportDialog.sc";

interface ContactImportFormValues {
    files: FileUploadFile[];
    sendDoubleOptIn: boolean;
}

type ImportResult = Pick<GQLCsvImportInformation, "created" | "updated" | "failed" | "blacklisted" | "failedColumns" | "blacklistedColumns">;

interface ContactImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scope: ContentScope;
    /** Also adds the imported contacts to this target group. */
    targetGroupId?: string;
    /** Called after contacts were imported, e.g. to reload the list. */
    onImported: () => void;
}

/**
 * Imports contacts from a CSV file: the file is uploaded first, then Brevo imports it. Afterwards, the dialog shows how many contacts
 * were created or updated and offers the rows that failed as a CSV file.
 */
export function ContactImportDialog({ open, onOpenChange, scope, targetGroupId, onImported }: ContactImportDialogProps): JSX.Element {
    const intl = useIntl();
    const client = useApolloClient();
    const { apiUrl, allowAddingContactsWithoutDoi } = useBrevoConfig();
    const formId = useId();
    const [result, setResult] = useState<{ information: ImportResult; sendDoubleOptIn: boolean }>();
    const [formKey, setFormKey] = useState(0);

    const close = () => {
        onOpenChange(false);
        setResult(undefined);
        setFormKey((key) => key + 1);
    };

    const uploadFile = async (file: File, { signal }: { signal: AbortSignal }): Promise<FileUploadFile> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`${apiUrl}/file-uploads/upload`, { method: "POST", body: formData, signal });
        if (!response.ok) {
            throw new Error(intl.formatMessage({ id: "dextinity.useContactImport.error.fileUpload", defaultMessage: "Could not upload file" }));
        }
        const { id } = await response.json();
        return { id, name: file.name, size: file.size };
    };

    const startImport = async ({ files, sendDoubleOptIn }: ContactImportFormValues): Promise<SubmissionErrors | undefined> => {
        const defaultError = intl.formatMessage({
            id: "dextinity.useContactImport.error.defaultMessage",
            defaultMessage: "An error occurred during the import. Please try again in a while or contact your administrator if the error persists.",
        });
        try {
            const { data } = await client.mutate<GQLStartContactImportMutation, GQLStartContactImportMutationVariables>({
                mutation: startBrevoContactImportMutation,
                variables: { fileId: files[0].id, scope, sendDoubleOptIn, targetGroupIds: targetGroupId ? [targetGroupId] : [] },
                context: LocalErrorScopeApolloContext,
            });
            const information = data?.startBrevoContactImport;
            if (!information) {
                return { [FORM_ERROR]: defaultError };
            }
            if (information.errorMessage) {
                return { [FORM_ERROR]: information.errorMessage };
            }
            onImported();
            setResult({ information, sendDoubleOptIn });
            return undefined;
        } catch {
            return { [FORM_ERROR]: defaultError };
        }
    };

    const title = intl.formatMessage({ id: "dextinity.contactImport.title", defaultMessage: "Import contacts from CSV" });

    if (result) {
        return (
            <Dialog
                open={open}
                onOpenChange={(isOpen) => !isOpen && close()}
                title={intl.formatMessage({ id: "dextinity.useContactImport.importSuccessful.title", defaultMessage: "Import finished" })}
                footer={<Button onClick={close}>{intl.formatMessage({ id: "dextinity.contactImport.done", defaultMessage: "Done" })}</Button>}
            >
                <ImportResultSummary information={result.information} sendDoubleOptIn={result.sendDoubleOptIn} />
            </Dialog>
        );
    }

    return (
        <Form<ContactImportFormValues> key={formKey} onSubmit={startImport} initialValues={{ files: [], sendDoubleOptIn: true }}>
            {({ handleSubmit, submitting, submitError, values }) => (
                <Dialog
                    open={open}
                    onOpenChange={(isOpen) => !isOpen && close()}
                    title={title}
                    dismissible={!submitting}
                    footer={
                        <DialogFormActions
                            formId={formId}
                            submitLabel={intl.formatMessage({ id: "dextinity.contactImport.importContacts", defaultMessage: "Import contacts" })}
                            onCancel={close}
                            submitting={submitting}
                            submitDisabled={values.files.length === 0}
                            labels={{ cancel: intl.formatMessage({ id: "dextinity.contactImport.cancel", defaultMessage: "Cancel" }) }}
                        />
                    }
                >
                    <form id={formId} onSubmit={handleSubmit} noValidate aria-label={title}>
                        <DialogBody>
                            {submitError ? <Banner tone="error">{submitError}</Banner> : null}
                            <FileUploadField
                                name="files"
                                label={intl.formatMessage({ id: "dextinity.contactImport.file", defaultMessage: "CSV file" })}
                                accept=".csv,text/csv"
                                hint={intl.formatMessage({
                                    id: "dextinity.contactImport.fileHint",
                                    defaultMessage: "One contact per row, with the email address and the attributes as columns",
                                })}
                                onUpload={uploadFile}
                                disabled={submitting}
                                required
                                requiredMessage={intl.formatMessage({
                                    id: "dextinity.contactImport.fileRequired",
                                    defaultMessage: "Choose a CSV file",
                                })}
                                labels={{
                                    remove: intl.formatMessage({ id: "dextinity.contactImport.removeFile", defaultMessage: "Remove" }),
                                    cancel: intl.formatMessage({ id: "dextinity.contactImport.cancelUpload", defaultMessage: "Cancel upload" }),
                                    retry: intl.formatMessage({ id: "dextinity.contactImport.retryUpload", defaultMessage: "Try again" }),
                                    dismiss: intl.formatMessage({ id: "dextinity.contactImport.dismissFile", defaultMessage: "Dismiss" }),
                                    rejectedType: intl.formatMessage({
                                        id: "dextinity.contactImport.rejectedType",
                                        defaultMessage: "Only CSV files can be imported",
                                    }),
                                    rejectedSize: intl.formatMessage({
                                        id: "dextinity.contactImport.rejectedSize",
                                        defaultMessage: "The file is too large",
                                    }),
                                    rejectedCount: intl.formatMessage({
                                        id: "dextinity.contactImport.rejectedCount",
                                        defaultMessage: "Import one file at a time",
                                    }),
                                    uploadFailed: intl.formatMessage({
                                        id: "dextinity.useContactImport.error.fileUpload",
                                        defaultMessage: "Could not upload file",
                                    }),
                                }}
                            />
                            {allowAddingContactsWithoutDoi ? (
                                <CheckboxField name="sendDoubleOptIn" disabled={submitting}>
                                    {intl.formatMessage({
                                        id: "dextinity.contactImport.sendDoubleOptInMail",
                                        defaultMessage: "Send double opt-in email",
                                    })}
                                </CheckboxField>
                            ) : null}
                            {values.sendDoubleOptIn ? (
                                <Banner tone="info">
                                    {intl.formatMessage({
                                        id: "dextinity.contactImport.contactAddAlert",
                                        defaultMessage:
                                            "The contact will get a double opt-in email to confirm the subscription. After the contact's confirmation, the contact will be added to the corresponding target groups in this scope depending on the contact's attributes. Before the confirmation the contact will not be shown on the contacts page.",
                                    })}
                                </Banner>
                            ) : (
                                <Banner tone="warning">
                                    {intl.formatMessage({
                                        id: "dextinity.contactImport.contactNoOptInAlert",
                                        defaultMessage:
                                            "No Double Opt-In email will be sent. Please ensure recipients have given their consent before proceeding.",
                                    })}
                                </Banner>
                            )}
                            {submitting ? (
                                <ProgressBar
                                    value={null}
                                    label={intl.formatMessage({
                                        id: "dextinity.useContactImport.importing.title",
                                        defaultMessage: "Importing contacts from CSV...",
                                    })}
                                />
                            ) : null}
                        </DialogBody>
                    </form>
                </Dialog>
            )}
        </Form>
    );
}

function ImportResultSummary({ information, sendDoubleOptIn }: { information: ImportResult; sendDoubleOptIn: boolean }) {
    const intl = useIntl();
    const timestamp = new Date().toISOString();
    return (
        <DialogBody>
            <ResultSummary>
                {intl.formatMessage(
                    {
                        id: "dextinity.contactImport.result.summary",
                        defaultMessage:
                            "{created, plural, one {# contact} other {# contacts}} created, {updated, plural, one {# contact} other {# contacts}} updated.",
                    },
                    { created: information.created, updated: information.updated },
                )}
            </ResultSummary>
            {information.failed > 0 ? (
                <Banner
                    tone="error"
                    action={
                        information.failedColumns?.length ? (
                            <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                startIcon={<Icon name="download" />}
                                onClick={() => downloadRows(information.failedColumns ?? [], `error-log-${timestamp}.csv`)}
                            >
                                {intl.formatMessage({ id: "dextinity.contactImport.result.downloadFailed", defaultMessage: "Download rows" })}
                            </Button>
                        ) : undefined
                    }
                >
                    {intl.formatMessage(
                        {
                            id: "dextinity.contactImport.result.failed",
                            defaultMessage: "{amount, plural, one {# row} other {# rows}} couldn't be imported.",
                        },
                        { amount: information.failed },
                    )}
                </Banner>
            ) : null}
            {information.blacklisted > 0 ? (
                <Banner
                    tone="warning"
                    action={
                        information.blacklistedColumns?.length ? (
                            <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                startIcon={<Icon name="download" />}
                                onClick={() => downloadRows(information.blacklistedColumns ?? [], `blacklisted-contact-log-${timestamp}.csv`)}
                            >
                                {intl.formatMessage({ id: "dextinity.contactImport.result.downloadBlocked", defaultMessage: "Download contacts" })}
                            </Button>
                        ) : undefined
                    }
                >
                    {intl.formatMessage(
                        {
                            id: "dextinity.contactImport.result.blocked",
                            defaultMessage: "{amount, plural, one {# contact wasn't} other {# contacts weren't}} imported because they are blocked.",
                        },
                        { amount: information.blacklisted },
                    )}
                </Banner>
            ) : null}
            {(information.created > 0 || information.updated > 0) && sendDoubleOptIn ? (
                <Banner tone="info">
                    {intl.formatMessage({
                        id: "dextinity.useContactImport.importSuccessful.doiNotice",
                        defaultMessage:
                            "Contacts who have not yet confirmed their subscription will receive a double opt-in email to complete the process. These contacts will not appear in this list until they confirm their subscription. Once confirmed, they will automatically be added to the appropriate target group(s).",
                    })}
                </Banner>
            ) : null}
        </DialogBody>
    );
}

function downloadRows(rows: Array<Record<string, unknown>>, fileName: string) {
    const headers = Object.keys(rows[0] ?? {});
    const lines = [headers.join(";"), ...rows.map((row) => headers.map((header) => String(row[header] ?? "")).join(";"))];
    downloadFile(new Blob([`${lines.join("\n")}\n`], { type: "text/csv;charset=utf-8" }), fileName);
}
