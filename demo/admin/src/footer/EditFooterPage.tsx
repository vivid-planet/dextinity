import { gql, useMutation, useQuery } from "@apollo/client";
import { FillSpace, MainContent, messages, SaveButton, Stack, StackToolbar, ToolbarActions, ToolbarTitleItem } from "@dextinity/admin";
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
import type { FooterContentBlockInput } from "@src/blocks.generated";
import isEqual from "lodash.isequal";
import { type JSX, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useRouteMatch } from "react-router";

import { FooterContentBlock } from "./blocks/FooterContentBlock";
import {
    type GQLCheckForChangesFooterQuery,
    type GQLCheckForChangesFooterQueryVariables,
    type GQLFooterQuery,
    type GQLFooterQueryVariables,
    type GQLSaveFooterMutation,
    type GQLSaveFooterMutationVariables,
    namedOperations,
} from "./EditFooterPage.generated";

export function EditFooterPage(): JSX.Element | null {
    const { scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });
    const [footerState, setFooterState] = useState<BlockState<typeof FooterContentBlock>>(FooterContentBlock.defaultValues());
    const [hasChanges, setHasChanges] = useState(false);
    const [referenceContent, setReferenceContent] = useState<FooterContentBlockInput | null>(null);
    const match = useRouteMatch();
    const previewApi = useBlockPreview();
    const blockContext = useBlockContext();

    useContentScopeConfig({ redirectPathAfterChange: "/project-snips/footer" });

    const { data, refetch, loading } = useQuery<GQLFooterQuery, GQLFooterQueryVariables>(footerQuery, {
        variables: {
            scope,
        },
    });

    const saveConflict = useSaveConflictQuery<GQLCheckForChangesFooterQuery, GQLCheckForChangesFooterQueryVariables>(
        checkForChangesQuery,
        {
            variables: {
                scope,
            },
            resolveHasConflict: (checkForChangesData) => {
                return resolveHasSaveConflict(data?.footer?.updatedAt, checkForChangesData?.footer?.updatedAt);
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

    const [update, { loading: saving, error: hasSaveErrors }] = useMutation<GQLSaveFooterMutation, GQLSaveFooterMutationVariables>(
        saveFooterMutation,
        { refetchQueries: !data?.footer ? [namedOperations.Query.Footer] : [] },
    );

    useEffect(() => {
        if (data) {
            if (data.footer) {
                const content = FooterContentBlock.input2State(data.footer.content);
                setFooterState(content);
                setReferenceContent(FooterContentBlock.state2Output(content));
            } else {
                const state = FooterContentBlock.defaultValues();
                setFooterState(state);
                setReferenceContent(FooterContentBlock.state2Output(state));
            }
        }
    }, [data]);

    useEffect(() => {
        const equal = isEqual(referenceContent, footerState ? FooterContentBlock.state2Output(footerState) : null);
        setHasChanges(!equal);
    }, [footerState, referenceContent]);

    if (loading) {
        return null;
    }

    const handleSavePage = async () => {
        const hasSaveConflict = await saveConflict.checkForConflicts();
        if (hasSaveConflict) {
            return; // dialogs open for the user to handle the conflict
        }

        const input = { content: FooterContentBlock.state2Output(footerState) };
        await update({
            variables: { input, scope },
        });
    };

    const tabs = [
        {
            key: "content",
            label: <FormattedMessage {...messages.content} />,
            content: (
                <BlockAdminComponentRoot>
                    <FooterContentBlock.AdminComponent state={footerState} updateState={setFooterState} />
                </BlockAdminComponentRoot>
            ),
        },
    ];

    const previewState = FooterContentBlock.createPreviewState(footerState, {
        ...blockContext,
        parentUrl: match.url,
        showVisibleOnly: previewApi.showOnlyVisible,
    });

    return (
        <Stack topLevelTitle={null}>
            <StackToolbar scopeIndicator={<ContentScopeIndicator />}>
                <ToolbarTitleItem>
                    <FormattedMessage id="footers.edit.toolbarTitle" defaultMessage="Edit footer" />
                </ToolbarTitleItem>
                <FillSpace />
                <ToolbarActions>
                    <SaveButton disabled={!hasChanges} loading={saving} hasErrors={hasSaveErrors != null} onClick={handleSavePage} />
                </ToolbarActions>
            </StackToolbar>
            <MainContent disablePaddingBottom>
                <BlockPreviewWithTabs previewUrl={`${siteConfig.blockPreviewBaseUrl}/footer`} previewState={previewState} previewApi={previewApi}>
                    {tabs}
                </BlockPreviewWithTabs>
            </MainContent>
            {saveConflict.dialogs}
        </Stack>
    );
}

const footerQuery = gql`
    query Footer($scope: FooterScopeInput!) {
        footer(scope: $scope) {
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

const saveFooterMutation = gql`
    mutation SaveFooter($input: FooterInput!, $scope: FooterScopeInput!) {
        saveFooter(input: $input, scope: $scope) {
            id
            content
            updatedAt
        }
    }
`;

const checkForChangesQuery = gql`
    query CheckForChangesFooter($scope: FooterScopeInput!) {
        footer(scope: $scope) {
            updatedAt
        }
    }
`;
