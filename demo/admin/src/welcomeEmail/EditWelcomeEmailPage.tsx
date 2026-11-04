import { gql, useMutation, useQuery } from "@apollo/client";
import {
    Alert,
    Button,
    FillSpace,
    MainContent,
    messages,
    SaveButton,
    Stack,
    StackToolbar,
    ToolbarActions,
    ToolbarTitleItem,
    Tooltip,
    useSnackbarApi,
} from "@dextinity/admin";
import { OpenNewTabAlternative, Send } from "@dextinity/admin-icons";
import {
    BlockAdminComponentRoot,
    BlockPreviewWithTabs,
    type BlockState,
    ContentScopeIndicator,
    resolveHasSaveConflict,
    useBlockContext,
    useBlockPreview,
    useContentScope,
    useContentScopeConfig,
    useSaveConflictQuery,
    useSiteConfig,
} from "@dextinity/cms-admin";
import { Snackbar } from "@mui/material";
import type { WelcomeEmailContentBlockInput } from "@src/blocks.generated";
import isEqual from "lodash.isequal";
import { type JSX, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
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

const lastSavedVersionHint = <FormattedMessage id="welcomeEmail.edit.lastSavedVersionHint" defaultMessage="Uses the last saved version" />;

export function EditWelcomeEmailPage(): JSX.Element | null {
    const { scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });
    const snackbarApi = useSnackbarApi();
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

    const [update, { loading: saving, error: hasSaveErrors }] = useMutation<GQLSaveWelcomeEmailMutation, GQLSaveWelcomeEmailMutationVariables>(
        saveWelcomeEmailMutation,
        { refetchQueries: !data?.welcomeEmail ? [namedOperations.Query.WelcomeEmail] : [] },
    );

    const [sendTestMail, { loading: sendingTestMail }] = useMutation<
        GQLSendWelcomeEmailTestMailMutation,
        GQLSendWelcomeEmailTestMailMutationVariables
    >(sendWelcomeEmailTestMailMutation, {
        onCompleted: () => {
            snackbarApi.showSnackbar(
                <Snackbar autoHideDuration={5000}>
                    <Alert severity="success">
                        <FormattedMessage id="welcomeEmail.edit.sendTestMail.success" defaultMessage="Test mail sent to Mailpit" />
                    </Alert>
                </Snackbar>,
            );
        },
        onError: () => {
            snackbarApi.showSnackbar(
                <Snackbar autoHideDuration={5000}>
                    <Alert severity="error">
                        <FormattedMessage id="welcomeEmail.edit.sendTestMail.error" defaultMessage="Failed to send test mail" />
                    </Alert>
                </Snackbar>,
            );
        },
    });

    useEffect(() => {
        if (data) {
            if (data.welcomeEmail) {
                const content = WelcomeEmailContentBlock.input2State(data.welcomeEmail.content);
                setWelcomeEmailState(content);
                setReferenceContent(WelcomeEmailContentBlock.state2Output(content));
            } else {
                const state = WelcomeEmailContentBlock.defaultValues();
                setWelcomeEmailState(state);
                setReferenceContent(WelcomeEmailContentBlock.state2Output(state));
            }
        }
    }, [data]);

    useEffect(() => {
        const equal = isEqual(referenceContent, welcomeEmailState ? WelcomeEmailContentBlock.state2Output(welcomeEmailState) : null);
        setHasChanges(!equal);
    }, [welcomeEmailState, referenceContent]);

    if (loading) {
        return null;
    }

    const handleSave = async () => {
        const hasSaveConflict = await saveConflict.checkForConflicts();
        if (hasSaveConflict) {
            return; // dialogs open for the user to handle the conflict
        }

        const input = { content: WelcomeEmailContentBlock.state2Output(welcomeEmailState) };
        await update({
            variables: { input, scope },
        });
    };

    const hasSavedEmail = data?.welcomeEmail != null;

    const handleOpenInSite = () => {
        const renderUrl = `${siteConfig.url}/api/render-welcome-email?domain=${scope.domain}&language=${scope.language}`;
        window.open(renderUrl, "_blank", "noopener,noreferrer");
    };

    const handleSendTestMail = () => {
        sendTestMail({ variables: { scope } }).catch(() => {
            // Error feedback is handled by the mutation's onError callback.
        });
    };

    const tabs = [
        {
            key: "content",
            label: <FormattedMessage {...messages.content} />,
            content: (
                <BlockAdminComponentRoot>
                    <WelcomeEmailContentBlock.AdminComponent state={welcomeEmailState} updateState={setWelcomeEmailState} />
                </BlockAdminComponentRoot>
            ),
        },
    ];

    const previewState = WelcomeEmailContentBlock.createPreviewState(welcomeEmailState, {
        ...blockContext,
        parentUrl: match.url,
        showVisibleOnly: previewApi.showOnlyVisible,
    });

    return (
        <Stack topLevelTitle={null}>
            <StackToolbar scopeIndicator={<ContentScopeIndicator />}>
                <ToolbarTitleItem>
                    <FormattedMessage id="welcomeEmail.edit.toolbarTitle" defaultMessage="Edit welcome email" />
                </ToolbarTitleItem>
                <FillSpace />
                <ToolbarActions>
                    <Tooltip title={hasChanges ? lastSavedVersionHint : ""}>
                        <Button variant="outlined" startIcon={<OpenNewTabAlternative />} disabled={!hasSavedEmail} onClick={handleOpenInSite}>
                            <FormattedMessage id="welcomeEmail.edit.openInSite" defaultMessage="Open in site" />
                        </Button>
                    </Tooltip>
                    <Tooltip title={hasChanges ? lastSavedVersionHint : ""}>
                        <Button variant="outlined" startIcon={<Send />} disabled={!hasSavedEmail || sendingTestMail} onClick={handleSendTestMail}>
                            <FormattedMessage id="welcomeEmail.edit.sendTestMail" defaultMessage="Send test mail" />
                        </Button>
                    </Tooltip>
                    <SaveButton disabled={!hasChanges} loading={saving} hasErrors={hasSaveErrors != null} onClick={handleSave} />
                </ToolbarActions>
            </StackToolbar>
            <MainContent disablePaddingBottom>
                <BlockPreviewWithTabs
                    previewUrl={`${siteConfig.blockPreviewBaseUrl}/welcome-email`}
                    previewState={previewState}
                    previewApi={previewApi}
                >
                    {tabs}
                </BlockPreviewWithTabs>
            </MainContent>
            {saveConflict.dialogs}
        </Stack>
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
