import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, RouterPrompt } from "@dextinity/admin";
import { type ContentScope, resolveHasSaveConflict, useFormSaveConflict } from "@dextinity/cms-admin";
import { Banner, Button, EditLayout, formatShortcut, Icon, isApplePlatform, PageHeader, Panel, Tooltip, useKeyboardShortcut } from "@dextinity/ui";
import { focusOnError, InputField, NumberField, SelectField, useHasUnsavedChanges } from "@dextinity/ui-react-final-form";
import { FORM_ERROR, type FormApi, type SubmissionErrors } from "final-form";
import { type ReactElement, type ReactNode, useMemo, useRef } from "react";
import { Form, useForm, useFormState } from "react-final-form";
import { useIntl } from "react-intl";

import { BrevoFormSaveState } from "../common/form/BrevoFormSaveState";
import { FormSection } from "../common/form/FormSection";
import {
    brevoConfigFormQuery,
    brevoConfigUpdatedAtQuery,
    createBrevoConfigMutation,
    doubleOptInTemplatesSelectQuery,
    sendersSelectQuery,
    updateBrevoConfigMutation,
} from "./BrevoConfigForm.gql";
import type {
    GQLBrevoConfigFormQuery,
    GQLBrevoConfigFormQueryVariables,
    GQLBrevoConfigUpdatedAtQuery,
    GQLBrevoConfigUpdatedAtQueryVariables,
    GQLCreateBrevoConfigMutation,
    GQLCreateBrevoConfigMutationVariables,
    GQLDoubleOptInTemplatesSelectQuery,
    GQLDoubleOptInTemplatesSelectQueryVariables,
    GQLSendersSelectQuery,
    GQLSendersSelectQueryVariables,
    GQLUpdateBrevoConfigMutation,
    GQLUpdateBrevoConfigMutationVariables,
} from "./BrevoConfigForm.gql.generated";
import { EditorContent, HeaderActions } from "./BrevoConfigForm.sc";

interface FormValues {
    senderMail: string | null;
    doubleOptInTemplateId: string | null;
    folderId: number | null;
    allowedRedirectionUrl: string;
    unsubscriptionPageId: string;
}

interface FormProps {
    scope: ContentScope;
    scopeLabel: string;
}

const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d{1,5})?(\/[^\s]*)?$/;
const unsubscriptionPageIdPattern = /^[a-zA-Z0-9]{24}$/;
const formDecorators = [focusOnError];

export function BrevoConfigForm({ scope, scopeLabel }: FormProps): ReactElement {
    const intl = useIntl();
    const client = useApolloClient();
    const formApiRef = useRef<FormApi<FormValues>>(undefined);

    const { data, error, loading, refetch } = useQuery<GQLBrevoConfigFormQuery, GQLBrevoConfigFormQueryVariables>(brevoConfigFormQuery, {
        variables: { scope },
    });
    const senders = useQuery<GQLSendersSelectQuery, GQLSendersSelectQueryVariables>(sendersSelectQuery, {
        variables: { scope },
        context: LocalErrorScopeApolloContext,
    });
    const doubleOptInTemplates = useQuery<GQLDoubleOptInTemplatesSelectQuery, GQLDoubleOptInTemplatesSelectQueryVariables>(
        doubleOptInTemplatesSelectQuery,
        { variables: { scope }, context: LocalErrorScopeApolloContext },
    );

    const brevoConfig = data?.brevoConfig;

    const initialValues = useMemo<FormValues>(
        () => ({
            senderMail: brevoConfig?.senderMail ?? null,
            doubleOptInTemplateId: brevoConfig?.doubleOptInTemplateId != null ? String(brevoConfig.doubleOptInTemplateId) : null,
            folderId: brevoConfig?.folderId ?? 1,
            allowedRedirectionUrl: brevoConfig?.allowedRedirectionUrl ?? "",
            unsubscriptionPageId: brevoConfig?.unsubscriptionPageId ?? "",
        }),
        [brevoConfig],
    );

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            if (!brevoConfig) {
                return false;
            }
            const { data: latest } = await client.query<GQLBrevoConfigUpdatedAtQuery, GQLBrevoConfigUpdatedAtQueryVariables>({
                query: brevoConfigUpdatedAtQuery,
                variables: { scope },
                fetchPolicy: "no-cache",
            });
            return resolveHasSaveConflict(brevoConfig.updatedAt, latest.brevoConfig?.updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    if (error) {
        throw error;
    }

    if (loading && !data) {
        return (
            <EditLayout header={<BrevoConfigHeader scopeLabel={scopeLabel} />} loading>
                {null}
            </EditLayout>
        );
    }

    const save = async (values: FormValues): Promise<SubmissionErrors | undefined> => {
        if (await saveConflict.checkForConflicts()) {
            return {
                [FORM_ERROR]: intl.formatMessage({
                    id: "dextinity.brevoConfig.saveConflict",
                    defaultMessage: "Someone else changed the config in the meantime",
                }),
            };
        }
        const sender = senders.data?.brevoSenders?.find((candidate) => candidate.email === values.senderMail);
        if (!sender || values.doubleOptInTemplateId == null) {
            return undefined;
        }
        const input = {
            senderName: sender.name,
            senderMail: sender.email,
            doubleOptInTemplateId: Number(values.doubleOptInTemplateId),
            folderId: values.folderId ?? 1,
            allowedRedirectionUrl: values.allowedRedirectionUrl,
            unsubscriptionPageId: values.unsubscriptionPageId,
        };
        try {
            if (brevoConfig) {
                await client.mutate<GQLUpdateBrevoConfigMutation, GQLUpdateBrevoConfigMutationVariables>({
                    mutation: updateBrevoConfigMutation,
                    variables: { id: brevoConfig.id, input, lastUpdatedAt: brevoConfig.updatedAt },
                    context: LocalErrorScopeApolloContext,
                });
            } else {
                await client.mutate<GQLCreateBrevoConfigMutation, GQLCreateBrevoConfigMutationVariables>({
                    mutation: createBrevoConfigMutation,
                    variables: { scope, input },
                    context: LocalErrorScopeApolloContext,
                    refetchQueries: ["BrevoConfigForm"],
                    awaitRefetchQueries: true,
                });
            }
            return undefined;
        } catch (saveError) {
            return {
                [FORM_ERROR]: intl.formatMessage(
                    { id: "dextinity.brevoConfig.saveFailed", defaultMessage: "Saving failed: {reason}" },
                    { reason: saveError instanceof Error ? saveError.message : String(saveError) },
                ),
            };
        }
    };

    return (
        <Form<FormValues> onSubmit={save} initialValues={initialValues} decorators={formDecorators}>
            {({ handleSubmit, form }) => {
                formApiRef.current = form;
                return (
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        aria-label={intl.formatMessage({ id: "dextinity.brevoConfig.title", defaultMessage: "Brevo config" })}
                    >
                        {saveConflict.dialogs}
                        <BrevoConfigFormContent
                            scopeLabel={scopeLabel}
                            senders={senders.data?.brevoSenders ?? []}
                            sendersLoading={senders.loading}
                            sendersFailed={senders.error != null}
                            doubleOptInTemplates={doubleOptInTemplates.data?.brevoDoubleOptInTemplates ?? []}
                            doubleOptInTemplatesLoading={doubleOptInTemplates.loading}
                            doubleOptInTemplatesFailed={doubleOptInTemplates.error != null}
                            hasConflict={saveConflict.hasConflict}
                        />
                    </form>
                );
            }}
        </Form>
    );
}

function BrevoConfigHeader({ scopeLabel, actions }: { scopeLabel: string; actions?: ReactNode }) {
    const intl = useIntl();
    return (
        <PageHeader
            eyebrow={scopeLabel}
            title={intl.formatMessage({ id: "dextinity.brevoConfig.title", defaultMessage: "Brevo config" })}
            subtitle={intl.formatMessage({
                id: "dextinity.brevoConfig.subtitle",
                defaultMessage: "Sender, double opt-in and unsubscription of the newsletter in this scope",
            })}
            actions={actions}
        />
    );
}

interface BrevoConfigFormContentProps {
    scopeLabel: string;
    senders: NonNullable<GQLSendersSelectQuery["brevoSenders"]>;
    sendersLoading: boolean;
    sendersFailed: boolean;
    doubleOptInTemplates: NonNullable<GQLDoubleOptInTemplatesSelectQuery["brevoDoubleOptInTemplates"]>;
    doubleOptInTemplatesLoading: boolean;
    doubleOptInTemplatesFailed: boolean;
    hasConflict: boolean;
}

function BrevoConfigFormContent({
    scopeLabel,
    senders,
    sendersLoading,
    sendersFailed,
    doubleOptInTemplates,
    doubleOptInTemplatesLoading,
    doubleOptInTemplatesFailed,
    hasConflict,
}: BrevoConfigFormContentProps) {
    const intl = useIntl();
    const form = useForm<FormValues>();
    const hasUnsavedChanges = useHasUnsavedChanges();
    const { submitting, submitError } = useFormState({ subscription: { submitting: true, submitError: true } });

    useKeyboardShortcut("mod+s", () => void form.submit(), { allowInEditable: true });
    const saveShortcut = formatShortcut("mod+s").join(isApplePlatform() ? "" : "+");
    const requiredMessage = intl.formatMessage({ id: "dextinity.brevoConfig.required", defaultMessage: "Required" });

    const submitAndReportSuccess = async () => {
        await form.submit();
        const { hasValidationErrors, hasSubmitErrors } = form.getState();
        return !hasValidationErrors && !hasSubmitErrors;
    };

    return (
        <RouterPrompt
            message={() =>
                hasUnsavedChanges
                    ? intl.formatMessage({ id: "dextinity.brevoConfig.unsavedChanges", defaultMessage: "Do you want to save your changes?" })
                    : true
            }
            saveAction={submitAndReportSuccess}
            resetAction={() => form.reset()}
        >
            <EditLayout
                header={
                    <BrevoConfigHeader
                        scopeLabel={scopeLabel}
                        actions={
                            <HeaderActions>
                                <BrevoFormSaveState />
                                <Tooltip
                                    content={intl.formatMessage({ id: "dextinity.brevoConfig.saveTooltip", defaultMessage: "Saves the config" })}
                                    shortcut={saveShortcut}
                                >
                                    <Button
                                        type="submit"
                                        startIcon={<Icon name="check" />}
                                        loading={submitting}
                                        disabled={!hasUnsavedChanges || hasConflict}
                                    >
                                        {intl.formatMessage({ id: "dextinity.brevoConfig.save", defaultMessage: "Save" })}
                                    </Button>
                                </Tooltip>
                            </HeaderActions>
                        }
                    />
                }
            >
                <Panel>
                    <EditorContent>
                        {submitError ? <Banner tone="error">{submitError}</Banner> : null}
                        <FormSection
                            title={intl.formatMessage({ id: "dextinity.brevoConfig.section.sending", defaultMessage: "Sending" })}
                            description={intl.formatMessage({
                                id: "dextinity.brevoConfig.section.sending.description",
                                defaultMessage: "The sender of the newsletters and the email that confirms a subscription.",
                            })}
                        >
                            {sendersFailed ? (
                                <Banner tone="error">
                                    {intl.formatMessage({
                                        id: "dextinity.brevoConfig.sendersFailed",
                                        defaultMessage:
                                            "The senders couldn't be loaded from Brevo. Make sure a valid Brevo API key is configured and the API's IP address is authorized in Brevo.",
                                    })}
                                </Banner>
                            ) : null}
                            <SelectField
                                name="senderMail"
                                label={intl.formatMessage({ id: "dextinity.brevoConfig.sender", defaultMessage: "Sender" })}
                                options={senders.map((sender) => ({ value: sender.email, label: `${sender.name} (${sender.email})` }))}
                                loading={sendersLoading}
                                searchable
                                required
                                requiredMessage={requiredMessage}
                            />
                            {doubleOptInTemplatesFailed ? (
                                <Banner tone="error">
                                    {intl.formatMessage({
                                        id: "dextinity.brevoConfig.doubleOptInTemplatesFailed",
                                        defaultMessage:
                                            "The email templates couldn't be loaded from Brevo. Make sure a valid Brevo API key is configured and the API's IP address is authorized in Brevo.",
                                    })}
                                </Banner>
                            ) : null}
                            <SelectField
                                name="doubleOptInTemplateId"
                                label={intl.formatMessage({
                                    id: "dextinity.brevoConfig.doubleOptInTemplate",
                                    defaultMessage: "Double opt-in template",
                                })}
                                options={doubleOptInTemplates.map((template) => ({ value: template.id, label: `${template.id}: ${template.name}` }))}
                                loading={doubleOptInTemplatesLoading}
                                searchable
                                required
                                requiredMessage={requiredMessage}
                            />
                        </FormSection>
                        <FormSection title={intl.formatMessage({ id: "dextinity.brevoConfig.section.contacts", defaultMessage: "Contacts" })} columns>
                            <NumberField
                                name="folderId"
                                label={intl.formatMessage({ id: "dextinity.brevoConfig.folderId", defaultMessage: "Folder ID" })}
                                helperText={intl.formatMessage({
                                    id: "dextinity.brevoConfig.folderId.info",
                                    defaultMessage:
                                        "By default, the folder ID should be set to 1 unless you have specifically configured another folder in Brevo.",
                                })}
                                min={1}
                                required
                                requiredMessage={requiredMessage}
                            />
                            <InputField
                                name="allowedRedirectionUrl"
                                label={intl.formatMessage({
                                    id: "dextinity.brevoConfig.allowedRedirectionUrl",
                                    defaultMessage: "Allowed redirection URL",
                                })}
                                helperText={intl.formatMessage({
                                    id: "dextinity.brevoConfig.allowedRedirectionUrl.info",
                                    defaultMessage: "Defines the schema of a valid redirection URL that is set when creating or importing contacts.",
                                })}
                                required
                                requiredMessage={requiredMessage}
                                spellCheck={false}
                                validate={(value: string) =>
                                    !value || urlPattern.test(value)
                                        ? undefined
                                        : intl.formatMessage({
                                              id: "dextinity.brevoConfig.allowedRedirectionUrl.validationError",
                                              defaultMessage: "Please enter a valid URL.",
                                          })
                                }
                            />
                            <InputField
                                name="unsubscriptionPageId"
                                label={intl.formatMessage({
                                    id: "dextinity.brevoConfig.unsubscriptionPageId",
                                    defaultMessage: "Unsubscription page ID",
                                })}
                                required
                                requiredMessage={requiredMessage}
                                spellCheck={false}
                                validate={(value: string) =>
                                    !value || unsubscriptionPageIdPattern.test(value)
                                        ? undefined
                                        : intl.formatMessage({
                                              id: "dextinity.brevoConfig.unsubscriptionPageId.validation",
                                              defaultMessage: "Must be a 24-digit alphanumeric ID",
                                          })
                                }
                            />
                        </FormSection>
                    </EditorContent>
                </Panel>
            </EditLayout>
        </RouterPrompt>
    );
}
