import { gql, useMutation, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, messages } from "@dextinity/admin";
import {
    BlockAdminComponentRoot,
    BlockContentEditor,
    type BlockState,
    resolveHasSaveConflict,
    useBlockContext,
    useBlockPreview,
    useContentScope,
    useContentScopeConfig,
    useSaveConflictQuery,
    useSiteConfig,
} from "@dextinity/cms-admin";
import { Button, Icon, PageHeader, SaveState, type SaveStateValue, ToastViewport, Tooltip, useToasts } from "@dextinity/ui";
import type { WelcomeEmailContentBlockInput } from "@src/blocks.generated";
import { deepEqual } from "fast-equals";
import { type JSX, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useRouteMatch } from "react-router";

import { WelcomeEmailContentBlock } from "./blocks/WelcomeEmailContentBlock";
import {
    type GQLCheckForChangesWelcomeEmailQuery,
    type GQLCheckForChangesWelcomeEmailQueryVariables,
    type GQLSaveWelcomeEmailMutation,
    type GQLSaveWelcomeEmailMutationVariables,
    type GQLSendWelcomeEmailTestMailMutation,
    type GQLSendWelcomeEmailTestMailMutationVariables,
    type GQLWelcomeEmailQuery,
    type GQLWelcomeEmailQueryVariables,
    namedOperations,
} from "./EditWelcomeEmailPage.generated";

export function EditWelcomeEmailPage(): JSX.Element | null {
    const intl = useIntl();
    const { scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const [welcomeEmailState, setWelcomeEmailState] = useState<BlockState<typeof WelcomeEmailContentBlock>>(WelcomeEmailContentBlock.defaultValues());
    const [hasChanges, setHasChanges] = useState(false);
    const [referenceContent, setReferenceContent] = useState<WelcomeEmailContentBlockInput | null>(null);
    const match = useRouteMatch();
    const previewApi = useBlockPreview();
    const blockContext = useBlockContext();

    useContentScopeConfig({ redirectPathAfterChange: "/newsletter/welcome-email" });

    const { data, refetch, loading } = useQuery<GQLWelcomeEmailQuery, GQLWelcomeEmailQueryVariables>(welcomeEmailQuery, {
        variables: { scope },
    });

    const saveConflict = useSaveConflictQuery<GQLCheckForChangesWelcomeEmailQuery, GQLCheckForChangesWelcomeEmailQueryVariables>(
        checkForChangesQuery,
        {
            variables: { scope },
            resolveHasConflict: (checkForChangesData) => {
                return resolveHasSaveConflict(data?.welcomeEmail?.updatedAt, checkForChangesData?.welcomeEmail?.updatedAt);
            },
        },
        {
            hasChanges,
            loadLatestVersion: async () => {
                await refetch();
            },
            onDiscardButtonPressed: async () => {
                await refetch();
            },
        },
    );

    const [update, { loading: saving, error: saveError }] = useMutation<GQLSaveWelcomeEmailMutation, GQLSaveWelcomeEmailMutationVariables>(
        saveWelcomeEmailMutation,
        { refetchQueries: !data?.welcomeEmail ? [namedOperations.Query.WelcomeEmail] : [], context: LocalErrorScopeApolloContext },
    );

    const [sendTestMail, { loading: sendingTestMail }] = useMutation<
        GQLSendWelcomeEmailTestMailMutation,
        GQLSendWelcomeEmailTestMailMutationVariables
    >(sendWelcomeEmailTestMailMutation, {
        context: LocalErrorScopeApolloContext,
        onCompleted: () => {
            addToast({
                tone: "success",
                message: intl.formatMessage({ id: "welcomeEmail.edit.sendTestMail.success", defaultMessage: "Test mail sent to Mailpit" }),
            });
        },
        onError: () => {
            addToast({
                tone: "error",
                message: intl.formatMessage({ id: "welcomeEmail.edit.sendTestMail.error", defaultMessage: "Failed to send test mail" }),
            });
        },
    });

    const resetToSavedContent = (savedContent: GQLWelcomeEmailQuery["welcomeEmail"] | undefined) => {
        const state = savedContent ? WelcomeEmailContentBlock.input2State(savedContent.content) : WelcomeEmailContentBlock.defaultValues();
        setWelcomeEmailState(state);
        setReferenceContent(WelcomeEmailContentBlock.state2Output(state));
    };

    useEffect(() => {
        if (data) {
            resetToSavedContent(data.welcomeEmail);
        }
    }, [data]);

    useEffect(() => {
        const equal = deepEqual(referenceContent, welcomeEmailState ? WelcomeEmailContentBlock.state2Output(welcomeEmailState) : null);
        setHasChanges(!equal);
    }, [welcomeEmailState, referenceContent]);

    const handleSave = async () => {
        const hasSaveConflict = await saveConflict.checkForConflicts();
        if (hasSaveConflict) {
            return false; // dialogs open for the user to handle the conflict
        }

        const output = WelcomeEmailContentBlock.state2Output(welcomeEmailState);
        try {
            await update({ variables: { input: { content: output }, scope } });
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({ id: "welcomeEmail.edit.saveFailed", defaultMessage: "The welcome email wasn't saved" }),
            });
            return false;
        }
        setReferenceContent(output);
        return true;
    };

    const hasSavedEmail = data?.welcomeEmail != null;

    const openInSite = () => {
        const renderUrl = `${siteConfig.url}/api/render-welcome-email?domain=${scope.domain}&language=${scope.language}`;
        window.open(renderUrl, "_blank", "noopener,noreferrer");
    };

    const handleSendTestMail = () => {
        sendTestMail({ variables: { scope } }).catch(() => {
            // Error feedback is handled by the mutation's onError callback.
        });
    };

    const previewState = WelcomeEmailContentBlock.createPreviewState(welcomeEmailState, {
        ...blockContext,
        parentUrl: match.url,
        showVisibleOnly: previewApi.showOnlyVisible,
    });

    const saveState: SaveStateValue = saving ? "saving" : saveError != null && hasChanges ? "error" : hasChanges ? "dirty" : "saved";
    const lastSavedVersionHint = intl.formatMessage({ id: "welcomeEmail.edit.lastSavedVersionHint", defaultMessage: "Uses the last saved version" });

    return (
        <BlockContentEditor
            header={
                <PageHeader
                    variant="compact"
                    eyebrow={intl.formatMessage({ id: "welcomeEmail.edit.eyebrow", defaultMessage: "Newsletter" })}
                    title={intl.formatMessage({ id: "welcomeEmail.edit.title", defaultMessage: "Welcome email" })}
                    subtitle={intl.formatMessage({
                        id: "welcomeEmail.edit.subtitle",
                        defaultMessage: "Sent to new subscribers once they confirmed their subscription",
                    })}
                    actions={
                        <>
                            {(hasSavedEmail || hasChanges) && (
                                <SaveState
                                    state={saveState}
                                    savedAt={data?.welcomeEmail ? new Date(data.welcomeEmail.updatedAt) : undefined}
                                    locale={intl.locale}
                                    labels={{
                                        saved: intl.formatMessage({ id: "welcomeEmail.edit.saveState.saved", defaultMessage: "All changes saved" }),
                                        dirty: intl.formatMessage({ id: "welcomeEmail.edit.saveState.dirty", defaultMessage: "Unsaved changes" }),
                                        saving: intl.formatMessage({ id: "welcomeEmail.edit.saveState.saving", defaultMessage: "Saving …" }),
                                        error: intl.formatMessage({ id: "welcomeEmail.edit.saveState.error", defaultMessage: "Not saved" }),
                                        savedAt: intl.formatMessage({ id: "welcomeEmail.edit.saveState.savedAt", defaultMessage: "Saved '{time}'" }),
                                    }}
                                />
                            )}
                            <Tooltip
                                content={
                                    hasChanges
                                        ? lastSavedVersionHint
                                        : intl.formatMessage({
                                              id: "welcomeEmail.edit.sendTestMailTooltip",
                                              defaultMessage: "Sends the email to Mailpit",
                                          })
                                }
                            >
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<Icon name="mail-out" />}
                                    disabled={!hasSavedEmail}
                                    loading={sendingTestMail}
                                    onClick={handleSendTestMail}
                                >
                                    {intl.formatMessage({ id: "welcomeEmail.edit.sendTestMail", defaultMessage: "Send test mail" })}
                                </Button>
                            </Tooltip>
                            <Tooltip
                                content={intl.formatMessage({ id: "welcomeEmail.edit.saveTooltip", defaultMessage: "Saves the welcome email" })}
                                shortcut="mod+s"
                            >
                                <Button startIcon={<Icon name="check" />} disabled={!hasChanges} loading={saving} onClick={() => void handleSave()}>
                                    {intl.formatMessage(messages.save)}
                                </Button>
                            </Tooltip>
                        </>
                    }
                />
            }
            loading={loading}
            preview={{ url: `${siteConfig.blockPreviewBaseUrl}/welcome-email`, siteUrl: null, state: previewState }}
            previewApi={previewApi}
            onOpenSitePreview={hasSavedEmail ? openInSite : undefined}
            save={{ hasChanges, saving, onSave: handleSave, onDiscard: () => resetToSavedContent(data?.welcomeEmail) }}
            tabs={[
                {
                    key: "content",
                    label: intl.formatMessage(messages.content),
                    content: (
                        <BlockAdminComponentRoot contentKind="email">
                            <WelcomeEmailContentBlock.AdminComponent state={welcomeEmailState} updateState={setWelcomeEmailState} />
                        </BlockAdminComponentRoot>
                    ),
                },
            ]}
        >
            {saveConflict.dialogs}
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "welcomeEmail.edit.notifications", defaultMessage: "Notifications" }) }}
            />
        </BlockContentEditor>
    );
}

const welcomeEmailQuery = gql`
    query WelcomeEmail($scope: WelcomeEmailScopeInput!) {
        welcomeEmail(scope: $scope) {
            id
            content
            scope {
                domain
                language
            }
            updatedAt
        }
    }
`;

const saveWelcomeEmailMutation = gql`
    mutation SaveWelcomeEmail($input: WelcomeEmailInput!, $scope: WelcomeEmailScopeInput!) {
        saveWelcomeEmail(input: $input, scope: $scope) {
            id
            content
            updatedAt
        }
    }
`;

const checkForChangesQuery = gql`
    query CheckForChangesWelcomeEmail($scope: WelcomeEmailScopeInput!) {
        welcomeEmail(scope: $scope) {
            updatedAt
        }
    }
`;

const sendWelcomeEmailTestMailMutation = gql`
    mutation SendWelcomeEmailTestMail($scope: WelcomeEmailScopeInput!) {
        sendWelcomeEmailTestMail(scope: $scope)
    }
`;
