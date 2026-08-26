import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Field,
    FillSpace,
    FinalForm,
    FinalFormAutocomplete,
    FinalFormSaveButton,
    type FinalFormSubmitEvent,
    Loading,
    MainContent,
    NumberField,
    TextField,
    Toolbar,
    ToolbarActions,
    ToolbarTitleItem,
    Tooltip,
    useFormApiRef,
    useStackSwitchApi,
} from "@dextinity/admin";
import { Info } from "@dextinity/admin-icons";
import { type ContentScope, ContentScopeIndicator, resolveHasSaveConflict, useFormSaveConflict } from "@dextinity/cms-admin";
import type { FormApi } from "final-form";
import { type ReactElement, type ReactNode, useMemo } from "react";
import { FormattedMessage } from "react-intl";

import {
    brevoConfigFormQuery,
    createBrevoConfigMutation,
    doubleOptInTemplatesSelectQuery,
    sendersSelectQuery,
    updateBrevoConfigMutation,
} from "./BrevoConfigForm.gql";
import type {
    GQLBrevoConfigFormQuery,
    GQLBrevoConfigFormQueryVariables,
    GQLCreateBrevoConfigMutation,
    GQLCreateBrevoConfigMutationVariables,
    GQLDoubleOptInTemplatesSelectQuery,
    GQLDoubleOptInTemplatesSelectQueryVariables,
    GQLSendersSelectQuery,
    GQLSendersSelectQueryVariables,
    GQLUpdateBrevoConfigMutation,
    GQLUpdateBrevoConfigMutationVariables,
} from "./BrevoConfigForm.gql.generated";

interface Option {
    value: string;
    label: string;
}
type FormValues = {
    sender: Option;
    doubleOptInTemplate: Option;
    folderId: number;
    allowedRedirectionUrl: string;
    unsubscriptionPageId: string;
};

interface FormProps {
    scope: ContentScope;
}

function validateUrl(value: string): ReactNode | undefined {
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d{1,5})?(\/[^\s]*)?$/;
    if (!urlPattern.test(value)) {
        return <FormattedMessage id="dextinity.brevoConfig.allowedRedirectionUrl.validationError" defaultMessage="Please enter a valid URL." />;
    }
    return undefined;
}

export function BrevoConfigForm({ scope }: FormProps): ReactElement {
    const client = useApolloClient();
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();

    const { data, error, loading, refetch } = useQuery<GQLBrevoConfigFormQuery, GQLBrevoConfigFormQueryVariables>(brevoConfigFormQuery, {
        variables: { scope },
    });

    const mode = data?.brevoConfig?.id ? "edit" : "add";

    const {
        data: sendersData,
        error: senderError,
        loading: senderLoading,
    } = useQuery<GQLSendersSelectQuery, GQLSendersSelectQueryVariables>(sendersSelectQuery, {
        variables: { scope },
    });

    const {
        data: doubleOptInTemplatesData,
        error: doubleOptInTemplatesError,
        loading: doubleOptInTemplatesLoading,
    } = useQuery<GQLDoubleOptInTemplatesSelectQuery, GQLDoubleOptInTemplatesSelectQueryVariables>(doubleOptInTemplatesSelectQuery, {
        variables: { scope },
    });

    const senderOptions =
        sendersData?.brevoSenders?.map((sender) => ({
            value: sender.email,
            label: `${sender.name} (${sender.email})`,
        })) ?? [];

    const doubleOptInTemplateOptions =
        doubleOptInTemplatesData?.brevoDoubleOptInTemplates?.map((doubleOptInTemplate) => ({
            value: doubleOptInTemplate.id,
            label: `${doubleOptInTemplate.id}: ${doubleOptInTemplate.name}`,
        })) ?? [];

    const initialValues = useMemo<Partial<FormValues>>(() => {
        const sender = sendersData?.brevoSenders?.find((s) => s.email === data?.brevoConfig?.senderMail && s.name === data?.brevoConfig?.senderName);

        const doubleOptInTemplate = doubleOptInTemplatesData?.brevoDoubleOptInTemplates?.find(
            (template) => template.id === data?.brevoConfig?.doubleOptInTemplateId?.toString(),
        );

        return {
            sender: sender
                ? {
                      value: sender.email,
                      label: `${sender.name} (${sender.email})`,
                  }
                : undefined,

            doubleOptInTemplate: doubleOptInTemplate
                ? {
                      value: doubleOptInTemplate?.id,
                      label: `${doubleOptInTemplate?.id}: ${doubleOptInTemplate?.name}`,
                  }
                : undefined,
            allowedRedirectionUrl: data?.brevoConfig?.allowedRedirectionUrl ?? "",
            folderId: data?.brevoConfig?.folderId ?? 1,
            unsubscriptionPageId: data?.brevoConfig?.unsubscriptionPageId ?? "",
        };
    }, [
        sendersData?.brevoSenders,
        doubleOptInTemplatesData?.brevoDoubleOptInTemplates,
        data?.brevoConfig?.allowedRedirectionUrl,
        data?.brevoConfig?.folderId,
        data?.brevoConfig?.unsubscriptionPageId,
        data?.brevoConfig?.senderMail,
        data?.brevoConfig?.senderName,
        data?.brevoConfig?.doubleOptInTemplateId,
    ]);

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const query = gql`
                query ($scope: EmailCampaignContentScopeInput!) {
                    brevoConfig(scope: $scope) {
                        updatedAt
                    }
                }
            `;
            const { data } = await client.query({
                query,
                variables: { scope },
                fetchPolicy: "no-cache",
            });

            return resolveHasSaveConflict(data?.brevoConfig?.updatedAt, data.updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const handleSubmit = async (state: FormValues, form: FormApi<FormValues>, event: FinalFormSubmitEvent) => {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }

        const sender = sendersData?.brevoSenders?.find((s) => s.email === state.sender.value);

        if (!sender || !state.doubleOptInTemplate || !state.allowedRedirectionUrl || !state.unsubscriptionPageId) {
            throw new Error("Not all required fields are set");
        }

        const output = {
            senderName: sender?.name,
            senderMail: sender?.email,
            doubleOptInTemplateId: Number(state.doubleOptInTemplate.value),
            folderId: state.folderId ?? 1,
            allowedRedirectionUrl: state?.allowedRedirectionUrl ?? "",
            unsubscriptionPageId: state.unsubscriptionPageId,
        };

        if (mode === "edit") {
            if (!data?.brevoConfig?.id) {
                throw new Error("Missing id in edit mode");
            }
            await client.mutate<GQLUpdateBrevoConfigMutation, GQLUpdateBrevoConfigMutationVariables>({
                mutation: updateBrevoConfigMutation,
                variables: { id: data?.brevoConfig?.id, input: output, lastUpdatedAt: data?.brevoConfig?.updatedAt },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateBrevoConfigMutation, GQLCreateBrevoConfigMutationVariables>({
                mutation: createBrevoConfigMutation,
                variables: {
                    scope,
                    input: output,
                },
            });
            if (!event.navigatingBack) {
                const id = mutationResponse?.createBrevoConfig.id;
                if (id) {
                    setTimeout(() => {
                        stackSwitchApi.activatePage("edit", id);
                    });
                }
            }
        }
    };

    if (error || senderError || doubleOptInTemplatesError) {
        throw error ?? senderError ?? doubleOptInTemplatesError;
    }

    if (loading || senderLoading || doubleOptInTemplatesLoading) {
        return <Loading behavior="fillPageHeight" />;
    }

    const validateUnsubscriptionPageId = (value: string) => {
        const validUnsubscriptionPageId = /^[a-zA-Z0-9]{24}$/;
        if (!validUnsubscriptionPageId.test(value)) {
            return (
                <FormattedMessage id="dextinity.brevoConfig.unsubscriptionPageId.validation" defaultMessage="Must be a 24-digit alphanumeric ID" />
            );
        }
        return undefined;
    };

    return (
        <FinalForm<FormValues> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode} initialValues={initialValues}>
            {({ values }) => {
                return (
                    <>
                        {saveConflict.dialogs}
                        <Toolbar scopeIndicator={<ContentScopeIndicator />}>
                            <ToolbarTitleItem>
                                <FormattedMessage id="dextinity.brevoConfig.title" defaultMessage="Brevo config" />
                            </ToolbarTitleItem>
                            <FillSpace />
                            <ToolbarActions>
                                <FinalFormSaveButton hasConflict={saveConflict.hasConflict} />
                            </ToolbarActions>
                        </Toolbar>
                        <MainContent>
                            <Field
                                component={FinalFormAutocomplete}
                                getOptionLabel={(option: Option) => option.label}
                                isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                                options={senderOptions}
                                name="sender"
                                label={<FormattedMessage id="dextinity.brevoConfig.sender" defaultMessage="Sender" />}
                                fullWidth
                                required
                            />
                            <Field
                                component={FinalFormAutocomplete}
                                getOptionLabel={(option: Option) => option.label}
                                isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                                options={doubleOptInTemplateOptions}
                                name="doubleOptInTemplate"
                                label={<FormattedMessage id="dextinity.brevoConfig.doubleOptInTemplate" defaultMessage="Double Opt-in template id" />}
                                fullWidth
                                required
                            />
                            <NumberField
                                name="folderId"
                                defaultValue={1}
                                label={
                                    <>
                                        <FormattedMessage id="dextinity.brevoConfig.folderId" defaultMessage="Folder ID" />
                                        <Tooltip
                                            title={
                                                <FormattedMessage
                                                    id="dextinity.brevoConfig.folderId.info"
                                                    defaultMessage="By default, the folder ID should be set to 1 unless you have specifically configured another folder in Brevo."
                                                />
                                            }
                                            sx={{ marginLeft: "5px" }}
                                        >
                                            <Info />
                                        </Tooltip>
                                    </>
                                }
                                fullWidth
                                required
                            />
                            <TextField
                                required
                                fullWidth
                                name="allowedRedirectionUrl"
                                label={
                                    <>
                                        <FormattedMessage id="dextinity.brevoConfig.allowedRedirectionUrl" defaultMessage="Allowed redirection URL" />
                                        <Tooltip
                                            title={
                                                <FormattedMessage
                                                    id="dextinity.brevoConfig.allowedRedirectionUrl.info"
                                                    defaultMessage="Defines the schema of a valid redirection URL that is set when creating or importing contacts."
                                                />
                                            }
                                            sx={{ marginLeft: "5px" }}
                                        >
                                            <Info />
                                        </Tooltip>
                                    </>
                                }
                                validate={validateUrl}
                            />
                            <TextField
                                fullWidth
                                name="unsubscriptionPageId"
                                required
                                label={<FormattedMessage id="dextinity.brevoConfig.unsubscriptionPageId" defaultMessage="Unsubscription Page ID" />}
                                validate={validateUnsubscriptionPageId}
                            />
                        </MainContent>
                    </>
                );
            }}
        </FinalForm>
    );
}
