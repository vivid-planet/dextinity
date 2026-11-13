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
    useShowAppToast,
    useSiteConfig,
} from "@dextinity/cms-admin";
import { Button, Icon, PageHeader, SaveState, type SaveStateValue, Tooltip } from "@dextinity/ui";
import type { FooterContentBlockInput } from "@src/blocks.generated";
import { deepEqual } from "fast-equals";
import { type JSX, useEffect, useState } from "react";
import { useIntl } from "react-intl";
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
    const intl = useIntl();
    const { scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });
    const showToast = useShowAppToast();
    const [footerState, setFooterState] = useState<BlockState<typeof FooterContentBlock>>(FooterContentBlock.defaultValues());
    const [hasChanges, setHasChanges] = useState(false);
    const [referenceContent, setReferenceContent] = useState<FooterContentBlockInput | null>(null);
    const match = useRouteMatch();
    const previewApi = useBlockPreview();
    const blockContext = useBlockContext();

    useContentScopeConfig({ redirectPathAfterChange: "/project-snips/footer" });

    const { data, refetch, loading } = useQuery<GQLFooterQuery, GQLFooterQueryVariables>(footerQuery, {
        variables: { scope },
    });

    const saveConflict = useSaveConflictQuery<GQLCheckForChangesFooterQuery, GQLCheckForChangesFooterQueryVariables>(
        checkForChangesQuery,
        {
            variables: { scope },
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

    const [update, { loading: saving, error: saveError }] = useMutation<GQLSaveFooterMutation, GQLSaveFooterMutationVariables>(saveFooterMutation, {
        refetchQueries: !data?.footer ? [namedOperations.Query.Footer] : [],
        context: LocalErrorScopeApolloContext,
    });

    const resetToSavedContent = (savedFooter: GQLFooterQuery["footer"] | undefined) => {
        const state = savedFooter ? FooterContentBlock.input2State(savedFooter.content) : FooterContentBlock.defaultValues();
        setFooterState(state);
        setReferenceContent(FooterContentBlock.state2Output(state));
    };

    useEffect(() => {
        if (data) {
            resetToSavedContent(data.footer);
        }
    }, [data]);

    useEffect(() => {
        const equal = deepEqual(referenceContent, footerState ? FooterContentBlock.state2Output(footerState) : null);
        setHasChanges(!equal);
    }, [footerState, referenceContent]);

    const handleSave = async () => {
        const hasSaveConflict = await saveConflict.checkForConflicts();
        if (hasSaveConflict) {
            return false; // dialogs open for the user to handle the conflict
        }

        const output = FooterContentBlock.state2Output(footerState);
        try {
            await update({ variables: { input: { content: output }, scope } });
        } catch {
            showToast({
                tone: "error",
                message: intl.formatMessage({ id: "footers.edit.saveFailed", defaultMessage: "The footer wasn't saved" }),
            });
            return false;
        }
        setReferenceContent(output);
        return true;
    };

    const previewState = FooterContentBlock.createPreviewState(footerState, {
        ...blockContext,
        parentUrl: match.url,
        showVisibleOnly: previewApi.showOnlyVisible,
    });

    const saveState: SaveStateValue = saving ? "saving" : saveError != null && hasChanges ? "error" : hasChanges ? "dirty" : "saved";

    return (
        <BlockContentEditor
            header={
                <PageHeader
                    variant="compact"
                    eyebrow={intl.formatMessage({ id: "footers.edit.eyebrow", defaultMessage: "Project snips" })}
                    title={intl.formatMessage({ id: "footers.edit.title", defaultMessage: "Footer" })}
                    subtitle={intl.formatMessage({ id: "footers.edit.subtitle", defaultMessage: "Shown at the bottom of every page of this site" })}
                    actions={
                        <>
                            {(data?.footer != null || hasChanges) && (
                                <SaveState
                                    state={saveState}
                                    savedAt={data?.footer ? new Date(data.footer.updatedAt) : undefined}
                                    locale={intl.locale}
                                    labels={{
                                        saved: intl.formatMessage({ id: "footers.edit.saveState.saved", defaultMessage: "All changes saved" }),
                                        dirty: intl.formatMessage({ id: "footers.edit.saveState.dirty", defaultMessage: "Unsaved changes" }),
                                        saving: intl.formatMessage({ id: "footers.edit.saveState.saving", defaultMessage: "Saving …" }),
                                        error: intl.formatMessage({ id: "footers.edit.saveState.error", defaultMessage: "Not saved" }),
                                        savedAt: intl.formatMessage({ id: "footers.edit.saveState.savedAt", defaultMessage: "Saved '{time}'" }),
                                    }}
                                />
                            )}
                            <Tooltip
                                content={intl.formatMessage({ id: "footers.edit.saveTooltip", defaultMessage: "Saves the footer" })}
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
            preview={{ url: `${siteConfig.blockPreviewBaseUrl}/footer`, siteUrl: `${siteConfig.url}/${scope.language}`, state: previewState }}
            previewApi={previewApi}
            save={{ hasChanges, saving, onSave: handleSave, onDiscard: () => resetToSavedContent(data?.footer) }}
            tabs={[
                {
                    key: "content",
                    label: intl.formatMessage(messages.content),
                    content: (
                        <BlockAdminComponentRoot>
                            <FooterContentBlock.AdminComponent state={footerState} updateState={setFooterState} />
                        </BlockAdminComponentRoot>
                    ),
                },
            ]}
        >
            {saveConflict.dialogs}
        </BlockContentEditor>
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
