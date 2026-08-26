import { useApolloClient, useQuery } from "@apollo/client";
import {
    Field,
    Loading,
    MainContent,
    Toolbar,
    ToolbarActions,
    ToolbarFillSpace,
    ToolbarItem,
    ToolbarTitleItem,
    useFormApiRef,
    useStackApi,
    useStackSwitchApi,
} from "@dextinity/admin";
import { ArrowLeft } from "@dextinity/admin-icons";
import {
    BlockAdminComponentRoot,
    BlockAdminTabLabel,
    type BlockInterface,
    BlockPreviewWithTabs,
    BlocksFinalForm,
    type BlockState,
    type ContentScope,
    ContentScopeIndicator,
    createFinalFormBlock,
    parallelAsyncEvery,
    queryUpdatedAt,
    resolveHasSaveConflict,
    useBlockContext,
    useBlockPreview,
    useEditState,
    useFormSaveConflict,
    useSaveState,
} from "@dextinity/cms-admin";
import { IconButton } from "@mui/material";
import { isBefore } from "date-fns";
import { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { useRouteMatch } from "react-router";

import { useBrevoConfig } from "../../common/BrevoConfigProvider";
import type { GQLEmailCampaignInput } from "../../graphql.generated";
import { ConfigFields } from "./ConfigFields";
import { createEmailCampaignMutation, emailCampaignFormQuery, updateEmailCampaignMutation } from "./EmailCampaignForm.gql";
import type {
    GQLCreateEmailCampaignMutation,
    GQLCreateEmailCampaignMutationVariables,
    GQLEmailCampaignFormFragment,
    GQLEmailCampaignFormQuery,
    GQLEmailCampaignFormQueryVariables,
    GQLUpdateEmailCampaignMutation,
    GQLUpdateEmailCampaignMutationVariables,
} from "./EmailCampaignForm.gql.generated";
import { SendManagerFields } from "./SendManagerFields";
import { SendManagerWrapper } from "./SendManagerWrapper";
import { TestEmailCampaignForm } from "./TestEmailCampaignForm";

interface FormProps {
    id?: string;
    EmailCampaignContentBlock: BlockInterface;
    scope: ContentScope;
}

export function EmailCampaignForm({ id, EmailCampaignContentBlock, scope }: FormProps) {
    const rootBlocks = {
        content: EmailCampaignContentBlock,
    };

    type EmailCampaignState = Omit<GQLEmailCampaignFormFragment, "content"> & {
        [key in keyof typeof rootBlocks]: BlockState<(typeof rootBlocks)[key]>;
    };

    const { previewUrl } = useBrevoConfig();
    const stackApi = useStackApi();
    const stackSwitchApi = useStackSwitchApi();
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const previewApi = useBlockPreview();
    const formApiRef = useFormApiRef<EmailCampaignState>();
    const blockContext = useBlockContext();
    const match = useRouteMatch();

    const FinalFormEmailCampaignContentBlock = useMemo(() => createFinalFormBlock(EmailCampaignContentBlock), [EmailCampaignContentBlock]);

    const { data, error, loading, refetch } = useQuery<GQLEmailCampaignFormQuery, GQLEmailCampaignFormQueryVariables>(
        emailCampaignFormQuery,
        id ? { variables: { id } } : { skip: true },
    );

    const { state, setState, hasChanges, output, query, updateReferenceContent } = useEditState<
        GQLEmailCampaignFormQuery,
        GQLEmailCampaignFormQueryVariables,
        EmailCampaignState,
        GQLEmailCampaignInput
    >({
        query: emailCampaignFormQuery,
        variables: id ? { id } : undefined,
        mode,
        input2State: ({ brevoEmailCampaign }) => {
            return {
                title: brevoEmailCampaign?.title,
                subject: brevoEmailCampaign?.subject,
                content: EmailCampaignContentBlock.input2State(brevoEmailCampaign.content),
                scheduledAt: brevoEmailCampaign?.scheduledAt ? new Date(brevoEmailCampaign.scheduledAt) : null,
                sendingState: brevoEmailCampaign?.sendingState,
                brevoTargetGroups: brevoEmailCampaign?.brevoTargetGroups,
            };
        },
        state2Output: (state) => ({
            ...state,
            content: EmailCampaignContentBlock.state2Output(state.content),
            scheduledAt: state.brevoTargetGroups.length > 0 ? (state.scheduledAt ?? null) : null,
            sendingState: undefined,
            brevoTargetGroups: state.brevoTargetGroups.map((brevoTargetGroup) => brevoTargetGroup.id),
        }),
        defaultState: {
            title: "",
            subject: "",
            content: EmailCampaignContentBlock.defaultValues(),
            sendingState: "DRAFT",
            scheduledAt: undefined,
            brevoTargetGroups: [],
        },
    });

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "brevoEmailCampaign", id);
            return resolveHasSaveConflict(data?.brevoEmailCampaign.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const { saveButton } = useSaveState<Omit<GQLEmailCampaignFormQuery, "__typename">>({
        hasChanges,
        saveConflict,
        mode,
        validate: async () => {
            if (!state) {
                return false;
            }

            const validateBlocks = await parallelAsyncEvery(
                Object.entries(rootBlocks) as Array<[keyof typeof rootBlocks, BlockInterface]>,
                async ([key, block]: [keyof typeof rootBlocks, BlockState<BlockInterface>]) => {
                    return block.isValid(state[key]);
                },
            );

            return validateBlocks;
        },
        save: saveEmailCampaign,
        navigateToEditPage: async (data) => {
            if (!id) {
                stackSwitchApi.activatePage(`edit`, data.brevoEmailCampaign.id);
            }
        },
        updateReferenceContent,
    });

    async function saveEmailCampaign() {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }

        if (!output) {
            throw new Error("Output is required");
        }

        if (mode === "edit") {
            if (!id) {
                throw new Error("Missing id in edit mode");
            }

            const { data: mutationResponse } = await client.mutate<GQLUpdateEmailCampaignMutation, GQLUpdateEmailCampaignMutationVariables>({
                mutation: updateEmailCampaignMutation,
                variables: { id, input: { ...output }, lastUpdatedAt: query.data?.brevoEmailCampaign?.updatedAt },
            });

            if (!mutationResponse) {
                throw new Error("Failed to update");
            }

            return mutationResponse;
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateEmailCampaignMutation, GQLCreateEmailCampaignMutationVariables>({
                mutation: createEmailCampaignMutation,
                variables: { scope, input: { ...output, brevoTargetGroups: output.brevoTargetGroups } },
            });

            if (!mutationResponse) {
                throw new Error("Failed to create");
            }

            return mutationResponse;
        }
    }

    if (!state) {
        return null;
    }

    if (error) {
        throw error;
    }

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    const previewContext = {
        ...blockContext,
        parentUrl: match.url,
        showVisibleOnly: previewApi.showOnlyVisible,
    };

    const previewState = {
        emailCampaignId: id,
        scope,
        content: EmailCampaignContentBlock.createPreviewState(state.content, previewContext),
    };

    const isScheduledDateInPast = state.scheduledAt != undefined && isBefore(new Date(state.scheduledAt), new Date());
    const isCampaignCreated = state.sendingState === "SENT" || mode === "add" || state.brevoTargetGroups.length === 0 || isScheduledDateInPast;

    return (
        <>
            {saveConflict.dialogs}
            <Toolbar scopeIndicator={<ContentScopeIndicator scope={scope} />}>
                <ToolbarItem>
                    <IconButton onClick={stackApi?.goBack}>
                        <ArrowLeft />
                    </IconButton>
                </ToolbarItem>
                <ToolbarTitleItem>
                    <FormattedMessage id="dextinity.emailCampaigns.EmailCampaign" defaultMessage="Email Campaign" />
                </ToolbarTitleItem>
                <ToolbarFillSpace />
                <ToolbarActions>{saveButton}</ToolbarActions>
            </Toolbar>
            <MainContent disablePaddingBottom>
                <BlockPreviewWithTabs previewUrl={previewUrl} previewState={previewState} previewApi={previewApi}>
                    {[
                        {
                            key: "config",
                            label: (
                                <BlockAdminTabLabel>
                                    <FormattedMessage id="dextinity.emailCampaigns.config" defaultMessage="Config" />
                                </BlockAdminTabLabel>
                            ),
                            content: (
                                <BlocksFinalForm
                                    onSubmit={(values) => setState({ ...state, ...values })}
                                    initialValues={{
                                        title: state.title,
                                        subject: state.subject,
                                    }}
                                >
                                    <ConfigFields />
                                </BlocksFinalForm>
                            ),
                        },
                        {
                            key: "blocks",
                            label: (
                                <BlockAdminTabLabel>
                                    <FormattedMessage id="dextinity.emailCampaigns.blocks" defaultMessage="Blocks" />
                                </BlockAdminTabLabel>
                            ),
                            content: (
                                <BlocksFinalForm
                                    onSubmit={(values) => setState({ ...state, ...values })}
                                    initialValues={{
                                        content: state?.content,
                                    }}
                                >
                                    <BlockAdminComponentRoot>
                                        <Field name="content" fullWidth required component={FinalFormEmailCampaignContentBlock} />
                                    </BlockAdminComponentRoot>
                                </BlocksFinalForm>
                            ),
                        },
                        {
                            key: "send-manager",
                            label: (
                                <BlockAdminTabLabel>
                                    <FormattedMessage id="dextinity.emailCampaigns.sendManager" defaultMessage="Send manager" />
                                </BlockAdminTabLabel>
                            ),
                            content: (
                                <BlocksFinalForm
                                    onSubmit={(values) =>
                                        setState({ ...state, scheduledAt: values.scheduledAt, brevoTargetGroups: values.targetGroups })
                                    }
                                    initialValues={{
                                        targetGroups: state.brevoTargetGroups,
                                        scheduledAt: state.scheduledAt,
                                    }}
                                >
                                    <SendManagerWrapper scope={scope}>
                                        <SendManagerFields
                                            scope={scope}
                                            isCampaignCreated={isCampaignCreated}
                                            isSendable={!hasChanges && state.brevoTargetGroups != undefined}
                                            id={id}
                                        />
                                        <TestEmailCampaignForm
                                            id={id}
                                            isSendable={!hasChanges && state.brevoTargetGroups != undefined}
                                            scope={scope}
                                            isCampaignCreated={isCampaignCreated}
                                        />
                                    </SendManagerWrapper>
                                </BlocksFinalForm>
                            ),
                        },
                    ]}
                </BlockPreviewWithTabs>
            </MainContent>
        </>
    );
}
