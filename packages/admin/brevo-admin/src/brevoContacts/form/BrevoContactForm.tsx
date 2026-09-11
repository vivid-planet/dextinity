import { type DocumentNode, gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Alert,
    CheckboxField,
    FinalForm,
    FinalFormSaveButton,
    type FinalFormSubmitEvent,
    FormSection,
    Loading,
    MainContent,
    TextField,
    Toolbar,
    ToolbarActions,
    ToolbarFillSpace,
    ToolbarItem,
    ToolbarTitleItem,
    useErrorDialog,
    useFormApiRef,
    useStackApi,
} from "@dextinity/admin";
import { ArrowLeft } from "@dextinity/admin-icons";
import { type ContentScope, ContentScopeIndicator, resolveHasSaveConflict, useFormSaveConflict } from "@dextinity/cms-admin";
import { Card, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import type { FormApi } from "final-form";
import { type ReactElement, type ReactNode, useMemo } from "react";
import { FormattedMessage } from "react-intl";

import { useBrevoConfig } from "../../common/BrevoConfigProvider";
import {
    brevoContactFormCheckForChangesQuery,
    brevoContactFormQuery,
    createBrevoContactMutation,
    updateBrevoContactMutation,
} from "./BrevoContactForm.gql";
import type {
    GQLBrevoContactFormCheckForChangesQuery,
    GQLBrevoContactFormCheckForChangesQueryVariables,
    GQLBrevoContactFormQuery,
    GQLBrevoContactFormQueryVariables,
    GQLCreateBrevoContactMutation,
    GQLCreateBrevoContactMutationVariables,
    GQLUpdateBrevoContactMutation,
    GQLUpdateBrevoContactMutationVariables,
} from "./BrevoContactForm.gql.generated";

export type EditBrevoContactFormValues = {
    [key: string]: unknown;
};

type EditBrevoContactFormValuesWithAttributes = EditBrevoContactFormValues & {
    email: string;
    redirectionUrl: string;
    sendDoubleOptIn?: boolean;
};

interface FormProps {
    id?: number;
    scope: ContentScope;
    additionalFormFields?: ReactNode;
    additionalAttributesFragment?: { name: string; fragment: DocumentNode };
    input2State?: (values?: EditBrevoContactFormValues) => EditBrevoContactFormValues;
}

export function BrevoContactForm({ id, scope, input2State, additionalFormFields, additionalAttributesFragment }: FormProps): ReactElement {
    const stackApi = useStackApi();
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<EditBrevoContactFormValuesWithAttributes>();
    const { allowAddingContactsWithoutDoi } = useBrevoConfig();
    const errorDialog = useErrorDialog();

    const brevoContactFormFragment = gql`
        fragment BrevoContactForm on BrevoContact {
            email
            ${additionalAttributesFragment ? "...".concat(additionalAttributesFragment?.name) : ""}
        }
        ${additionalAttributesFragment?.fragment ?? ""}
`;
    const { data, loading, refetch } = useQuery<GQLBrevoContactFormQuery, GQLBrevoContactFormQueryVariables>(
        brevoContactFormQuery(brevoContactFormFragment),
        id ? { variables: { id, scope } } : { skip: true },
    );

    const initialValues = useMemo<Partial<EditBrevoContactFormValuesWithAttributes>>(() => {
        let baseInitialValues = {
            email: "",
            redirectionUrl: "",
            sendDoubleOptIn: true,
        };

        if (input2State) {
            baseInitialValues = {
                ...baseInitialValues,
                ...input2State(data?.brevoContact),
            };
        }

        return data?.brevoContact?.email ? { ...baseInitialValues, email: data.brevoContact.email } : baseInitialValues;
    }, [data?.brevoContact, input2State]);

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            if (!id) {
                return false;
            }
            const { data: updatedData } = await client.query<
                GQLBrevoContactFormCheckForChangesQuery,
                GQLBrevoContactFormCheckForChangesQueryVariables
            >({
                query: brevoContactFormCheckForChangesQuery,
                variables: { id, scope },
                fetchPolicy: "no-cache",
            });

            return resolveHasSaveConflict(data?.brevoContact?.modifiedAt, updatedData.brevoContact.modifiedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const handleSubmit = async (
        state: EditBrevoContactFormValuesWithAttributes,
        form: FormApi<EditBrevoContactFormValuesWithAttributes>,
        event: FinalFormSubmitEvent,
    ) => {
        try {
            if (await saveConflict.checkForConflicts()) {
                throw new Error("Conflicts detected");
            }

            const output = {
                ...state,
                blocked: false,
            };

            if (mode === "edit") {
                if (!id) {
                    throw new Error("Missing id in edit mode");
                }
                const { email, redirectionUrl, sendDoubleOptIn, ...rest } = output;
                await client.mutate<GQLUpdateBrevoContactMutation, GQLUpdateBrevoContactMutationVariables>({
                    mutation: updateBrevoContactMutation(brevoContactFormFragment),
                    variables: { id, input: rest, scope },
                });
            } else {
                const { data: mutationResponse } = await client.mutate<GQLCreateBrevoContactMutation, GQLCreateBrevoContactMutationVariables>({
                    mutation: createBrevoContactMutation,
                    variables: { scope, input: output },
                });
                if (!event.navigatingBack) {
                    const response = mutationResponse?.createBrevoContact;

                    if (response === "SUCCESSFUL") {
                        setTimeout(() => {
                            stackApi?.goBack();
                        });
                    } else if (response === "ERROR_CONTAINED_IN_ECG_RTR_LIST") {
                        throw new Error("Contact contained in ECG RTR list, cannot create contact");
                    } else if (response === "ERROR_CONTACT_IS_BLACKLISTED") {
                        throw new Error("Contact could not be created as it is blacklisted.");
                    } else if (response === "ERROR_CONTACT_ALREADY_EXISTS") {
                        throw new Error("A contact with this email already exists.");
                    } else {
                        throw new Error("Error creating contact");
                    }
                }
            }
        } catch (error) {
            errorDialog?.showError({
                title: "Error",
                userMessage: <Alert severity="error">{(error as Error).message}</Alert>,
                error: String(error),
            });
        }
    };

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    return (
        <FinalForm<EditBrevoContactFormValuesWithAttributes> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode} initialValues={initialValues}>
            {({ values }) => (
                <>
                    {saveConflict.dialogs}
                    <Toolbar scopeIndicator={<ContentScopeIndicator scope={scope} />}>
                        <ToolbarItem>
                            <IconButton onClick={stackApi?.goBack}>
                                <ArrowLeft />
                            </IconButton>
                        </ToolbarItem>
                        <ToolbarTitleItem>
                            <FormattedMessage id="dextinity.brevoContacts.brevoContact" defaultMessage="Contact" />
                        </ToolbarTitleItem>
                        <ToolbarFillSpace />
                        <ToolbarActions>
                            <FinalFormSaveButton hasConflict={saveConflict.hasConflict} />
                        </ToolbarActions>
                    </Toolbar>
                    <MainContent>
                        {mode === "edit" && (
                            <Box sx={{ marginBottom: 4 }}>
                                <Alert severity="warning">
                                    <FormattedMessage
                                        id="dextinity.brevoContact.contactEditAlert"
                                        defaultMessage="Editing a contact will affect all scopes and the target groups within those scopes."
                                    />
                                </Alert>
                            </Box>
                        )}
                        <TextField
                            required
                            fullWidth
                            name="email"
                            label={<FormattedMessage id="dextinity.brevoContact.email" defaultMessage="Email" />}
                            disabled={mode === "edit"}
                        />
                        {mode === "add" && (
                            <Card sx={{ padding: 4, marginBottom: 5 }}>
                                <FormSection title={<FormattedMessage id="dextinity.brevoContact.doubleOptIn" defaultMessage="Double Opt-in" />}>
                                    {allowAddingContactsWithoutDoi && (
                                        <CheckboxField
                                            name="sendDoubleOptIn"
                                            label={
                                                <FormattedMessage
                                                    id="dextinity.brevoContact.sendDoubleOptInMail"
                                                    defaultMessage="Send double opt-in email"
                                                />
                                            }
                                            fullWidth
                                        />
                                    )}
                                    {values.sendDoubleOptIn ? (
                                        <Alert severity="warning" sx={{ marginBottom: 5 }}>
                                            <FormattedMessage
                                                id="dextinity.brevoContact.contactAddAlert"
                                                defaultMessage="The contact will get a double opt-in email to confirm the subscription. After the contact's confirmation, the contact will be added to the corresponding target groups in this scope depending on the contact's attributes. Before the confirmation the contact will not be shown on the contacts page."
                                            />
                                        </Alert>
                                    ) : (
                                        <Alert severity="error" sx={{ marginBottom: 5 }}>
                                            <FormattedMessage
                                                id="dextinity.brevoContact.contactNoOptInAlert"
                                                defaultMessage="No Double Opt-In email will be sent. You are responsible for ensuring that recipients have provided their consent before proceeding. If consent has not been given, sending a Double Opt-In email is legally required.
                                                
                                                Additionally, the creation of the user will be tracked, and you may need to provide clarification if users report any issues."
                                            />
                                        </Alert>
                                    )}

                                    <TextField
                                        disabled={values.sendDoubleOptIn ? false : true}
                                        fullWidth
                                        name="redirectionUrl"
                                        label={
                                            <FormattedMessage
                                                id="dextinity.brevoContact.redirectionUrl"
                                                defaultMessage="Redirection Url (Contact will be redirected to this page after the confirmation in the double opt-in email)"
                                            />
                                        }
                                    />
                                </FormSection>
                            </Card>
                        )}
                        {additionalFormFields && (
                            <Card sx={{ padding: 4 }}>
                                <FormSection title={<FormattedMessage id="dextinity.brevoContact.attributes" defaultMessage="Attributes" />}>
                                    {additionalFormFields}
                                </FormSection>
                            </Card>
                        )}
                    </MainContent>
                </>
            )}
        </FinalForm>
    );
}
