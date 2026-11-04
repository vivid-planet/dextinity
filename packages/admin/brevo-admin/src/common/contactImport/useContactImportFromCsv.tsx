import { useApolloClient } from "@apollo/client";
import type { RefetchQueriesInclude } from "@apollo/client/core/types";
import { Alert, Button, CheckboxField, Dialog, downloadFile, FinalForm, Loading, messages, useErrorDialog } from "@dextinity/admin";
import { Upload } from "@dextinity/admin-icons";
import { Box, DialogActions, DialogContent, DialogTitle, type MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type ComponentProps, type ReactNode, type RefObject, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FormattedMessage, useIntl } from "react-intl";

import type { GQLCsvImportInformation, GQLEmailCampaignContentScopeInput } from "../../graphql.generated";
import { useBrevoConfig } from "../BrevoConfigProvider";
import { startBrevoContactImportMutation } from "./useContactImportFromCsv.gql";
import type { GQLStartBrevoContactImportMutation, GQLStartBrevoContactImportMutationVariables } from "./useContactImportFromCsv.gql.generated";

interface UseContactImportProps {
    scope: GQLEmailCampaignContentScopeInput;
    sendDoubleOptIn: boolean;
    targetGroupId?: string;
    refetchQueries?: RefetchQueriesInclude;
}

type ContactImportFromCsvForm = {
    sendDoubleOptIn: boolean;
};

interface ActionItem extends ComponentProps<typeof MenuItem> {
    type: "action";
    label: ReactNode;
    startAdornment?: ReactNode;
}

export const useContactImportFromCsv = ({ scope, targetGroupId, refetchQueries }: UseContactImportProps): [ActionItem, ReactNode] => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [sendDoubleOptIn, setSendDoubleOptIn] = useState(true);
    const { allowAddingContactsWithoutDoi } = useBrevoConfig();

    const moreActionsMenuItem: ActionItem = useMemo(
        () => ({
            type: "action",
            label: <FormattedMessage id="dextinity.targetGroup.assignedContacts.actions.importFromCsv" defaultMessage="Import contacts from CSV" />,
            startAdornment: <Upload />,
            onClick: () => setOpen(true),
        }),
        [],
    );

    const handleClose = () => setOpen(false);

    const dialog = (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>
                <FormattedMessage id="dextinity.contactImport.title" defaultMessage="Importing contacts from CSV" />
            </DialogTitle>
            <DialogContent>
                <FinalForm<ContactImportFromCsvForm>
                    onSubmit={(values) => {
                        fileInputRef.current?.click();
                    }}
                    mode="add"
                    initialValues={{ sendDoubleOptIn: true }}
                >
                    {({ values }) => {
                        setSendDoubleOptIn(values.sendDoubleOptIn);

                        return (
                            <>
                                {values.sendDoubleOptIn ? (
                                    <Alert severity="warning" sx={{ marginBottom: 5 }}>
                                        <FormattedMessage
                                            id="dextinity.contactImport.contactAddAlert"
                                            defaultMessage="The contact will get a double opt-in email to confirm the subscription. After the contact's confirmation, the contact will be added to the corresponding target groups in this scope depending on the contact's attributes. Before the confirmation the contact will not be shown on the contacts page."
                                        />
                                    </Alert>
                                ) : (
                                    <Alert severity="error" sx={{ marginBottom: 5 }}>
                                        <FormattedMessage
                                            id="dextinity.contactImport.contactNoOptInAlert"
                                            defaultMessage="No Double Opt-In email will be sent. Please ensure recipients have given their consent before proceeding."
                                        />
                                    </Alert>
                                )}
                                {allowAddingContactsWithoutDoi && (
                                    <CheckboxField
                                        name="sendDoubleOptIn"
                                        label={
                                            <FormattedMessage
                                                id="dextinity.contactImport.sendDoubleOptInMail"
                                                defaultMessage="Send double opt-in email"
                                            />
                                        }
                                        fullWidth
                                    />
                                )}
                            </>
                        );
                    }}
                </FinalForm>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    <FormattedMessage {...messages.cancel} />
                </Button>
                <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
                    <FormattedMessage id="dextinity.contactImport.importContacts" defaultMessage="Import Contacts" />
                </Button>
            </DialogActions>
        </Dialog>
    );

    const component = useMemo(
        () => (
            <ContactImportComponent
                scope={scope}
                targetGroupId={targetGroupId}
                fileInputRef={fileInputRef}
                sendDoubleOptIn={sendDoubleOptIn}
                refetchQueries={refetchQueries}
            />
        ),
        [refetchQueries, scope, targetGroupId, sendDoubleOptIn],
    );

    return [
        moreActionsMenuItem,
        <>
            {dialog}
            {component}
        </>,
    ];
};

interface UseContactComponentProps extends UseContactImportProps {
    fileInputRef: RefObject<HTMLInputElement | null>;
}

const ContactImportComponent = ({ scope, targetGroupId, fileInputRef, sendDoubleOptIn, refetchQueries }: UseContactComponentProps) => {
    const apolloClient = useApolloClient();
    const [importingCsv, setImportingCsv] = useState(false);
    const [importInformation, setImportInformation] = useState<GQLCsvImportInformation | null>(null);
    const dialogOpen = importingCsv || !!importInformation;
    const errorDialog = useErrorDialog();
    const config = useBrevoConfig();
    const intl = useIntl();
    const client = useApolloClient();

    async function upload(file: File, scope: GQLEmailCampaignContentScopeInput, listIds?: string[]): Promise<GQLCsvImportInformation> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${config.apiUrl}/file-uploads/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(intl.formatMessage({ id: "dextinity.useContactImport.error.fileUpload", defaultMessage: "Could not upload file" }));
        }

        const fileUploadId = (await response.json()).id;

        const { data } = await client.mutate<GQLStartBrevoContactImportMutation, GQLStartBrevoContactImportMutationVariables>({
            mutation: startBrevoContactImportMutation,
            variables: {
                fileId: fileUploadId,
                scope,
                sendDoubleOptIn,
                targetGroupIds: listIds,
            },
        });

        if (!data) {
            throw new Error(
                intl.formatMessage({
                    id: "dextinity.useContactImport.error.defaultMessage",
                    defaultMessage:
                        "An error occurred during the import. Please try again in a while or contact your administrator if the error persists.",
                }),
            );
        }
        return data.startBrevoContactImport;
    }

    const saveErrorFile = () => {
        const failedColumns = importInformation?.failedColumns;
        if (!failedColumns || failedColumns.length === 0) {
            throw new Error(intl.formatMessage({ id: "dextinity.export", defaultMessage: "No failed columns to save" }));
        }

        let errorData = "";

        // Add headers to the file without trailing semicolon
        const headers = Object.keys(failedColumns[0]);
        const headerStr = headers.join(";");
        errorData = `${headerStr.replace(/;+$/, "")}\n`; // Remove trailing semicolon from the header

        // Add each row of failed columns data
        for (const column of failedColumns) {
            // Use Object.values to get the values of each column
            const row = Object.values(column); // No need to check for undefined/null

            // Join row values and remove the trailing semicolon if not needed
            const rowStr = row.join(";");
            errorData += `${rowStr.replace(/;+$/, "")}\n`;
        }

        // Create and download the file
        downloadFile(new Blob([errorData], { type: "text/csv;charset=utf-8" }), `error-log-${new Date().toISOString()}.csv`);
    };

    const saveBlacklistedContactsFile = () => {
        const blacklistedContactsColumns = importInformation?.blacklistedColumns;
        if (!blacklistedContactsColumns || blacklistedContactsColumns.length === 0) {
            throw new Error(intl.formatMessage({ id: "dextinity.export", defaultMessage: "No failed columns to save" }));
        }

        let blacklistedContactsData = "";

        // Add headers to the file without trailing semicolon
        const headers = Object.keys(blacklistedContactsColumns[0]);
        const headerStr = headers.join(";");
        blacklistedContactsData = `${headerStr.replace(/;+$/, "")}\n`; // Remove trailing semicolon from the header

        // Add each row of failed columns data
        for (const column of blacklistedContactsColumns) {
            // Use Object.values to get the values of each column
            const row = Object.values(column); // No need to check for undefined/null

            // Join row values and remove the trailing semicolon if not needed
            const rowStr = row.join(";");
            blacklistedContactsData += `${rowStr.replace(/;+$/, "")}\n`;
        }

        // Create and download the file
        downloadFile(
            new Blob([blacklistedContactsData], { type: "text/csv;charset=utf-8" }),
            `blacklisted-contact-log-${new Date().toISOString()}.csv`,
        );
    };

    const { getInputProps } = useDropzone({
        accept: { "text/csv": [] },
        multiple: false,
        onDrop: async (acceptedFiles: File[]) => {
            setImportingCsv(true);

            try {
                const file = acceptedFiles[0];
                const data = await upload(file, scope, targetGroupId ? [targetGroupId] : []);
                apolloClient.refetchQueries({ include: refetchQueries });

                if (data) {
                    setImportingCsv(false);

                    if (data.errorMessage) {
                        errorDialog?.showError({
                            title: <FormattedMessage {...messages.error} />,
                            userMessage: data.errorMessage,
                            error: data.errorMessage,
                        });
                    } else {
                        setImportInformation(data);
                    }
                } else {
                    throw new Error(JSON.stringify(data));
                }
            } catch (e) {
                setImportingCsv(false);

                const userMessage = (
                    <FormattedMessage
                        id="dextinity.useContactImport.error.defaultMessage"
                        defaultMessage="An error occurred during the import. Please try again in a while or contact your administrator if the error persists."
                    />
                );

                errorDialog?.showError({
                    title: <FormattedMessage {...messages.error} />,
                    userMessage,
                    error: String(e),
                });
            }
        },
    });

    return (
        <>
            <input type="file" hidden {...getInputProps()} ref={fileInputRef} />
            <Dialog open={dialogOpen}>
                <DialogTitle>
                    {importingCsv && (
                        <FormattedMessage id="dextinity.useContactImport.importing.title" defaultMessage="Importing contacts from CSV..." />
                    )}
                    {importInformation && (
                        <FormattedMessage id="dextinity.useContactImport.importSuccessful.title" defaultMessage="Import successful" />
                    )}
                </DialogTitle>
                <DialogContent>
                    {importingCsv && <Loading />}
                    {importInformation && (
                        <>
                            {importInformation.created > 0 && (
                                <FormattedMessage
                                    id="dextinity.useContactImport.importSuccessful.contactsImported"
                                    defaultMessage="{amount} contact(s) have been created successfully."
                                    values={{ amount: importInformation.created }}
                                />
                            )}
                            {importInformation.updated > 0 && (
                                <FormattedMessage
                                    id="dextinity.useContactImport.importSuccessful.contactsUpdated"
                                    defaultMessage="{amount} contact(s) have been updated."
                                    values={{ amount: importInformation.updated }}
                                />
                            )}

                            {importInformation.failed > 0 && (
                                <Box mt={2}>
                                    <Alert severity="error">
                                        <FormattedMessage
                                            id="dextinity.useContactImport.error.contactsCouldNotBeImported"
                                            defaultMessage="{amount} contact(s) could not be imported. <link>Download this file</link> to get the failing row(s)."
                                            values={{
                                                amount: importInformation.failed,
                                                link: (chunks: ReactNode) => <CsvDownloadLink onClick={saveErrorFile}>{chunks}</CsvDownloadLink>,
                                            }}
                                        />
                                    </Alert>
                                </Box>
                            )}

                            {importInformation.blacklisted > 0 && (
                                <Box mt={2}>
                                    <Alert severity="error">
                                        <FormattedMessage
                                            id="dextinity.useContactImport.error.contactsAreBlacklisted"
                                            defaultMessage="{amount} contacts could not be imported as they are blacklisted.  <link>Download this file</link> to get the blacklisted contact(s)."
                                            values={{
                                                amount: importInformation.blacklisted,
                                                link: (chunks: ReactNode) => (
                                                    <CsvDownloadLink onClick={saveBlacklistedContactsFile}>{chunks}</CsvDownloadLink>
                                                ),
                                            }}
                                        />
                                    </Alert>
                                </Box>
                            )}

                            {(importInformation.created > 0 || importInformation.updated > 0) && sendDoubleOptIn && (
                                <Box mt={2}>
                                    <Alert severity="warning">
                                        <FormattedMessage
                                            id="dextinity.useContactImport.importSuccessful.doiNotice"
                                            defaultMessage="Contacts who have not yet confirmed their subscription will receive a double opt-in email to complete the process. These contacts will not appear in this list until they confirm their subscription. Once confirmed, they will automatically be added to the appropriate target group(s)."
                                        />
                                    </Alert>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {importInformation && (
                        <Button onClick={() => setImportInformation(null)} variant="primary">
                            <FormattedMessage {...messages.ok} />
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

const CsvDownloadLink = styled("span")`
    color: ${({ theme }) => theme.palette.info.main};
    text-decoration: underline;
    cursor: pointer;
`;
