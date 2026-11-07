import { gql, useMutation, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, messages } from "@dextinity/admin";
import {
    BlockAdminComponentRoot,
    type BlockState,
    IFrameBridgeProvider,
    openSitePreviewWindow,
    resolveNewState,
    UnsavedChangesPrompt,
    useBlockContext,
    useBlockPreview,
    useContentScope,
    useShowAppToast,
    useSiteConfig,
} from "@dextinity/cms-admin";
import { Button, EmptyState, Icon, IconButton, Panel, SaveState, type SaveStateValue, Skeleton, Tooltip } from "@dextinity/ui";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { deepEqual } from "fast-equals";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useRouteMatch } from "react-router";

import type {
    GQLMainMenuItemPanelQuery,
    GQLMainMenuItemPanelQueryVariables,
    GQLUpdateMainMenuItemMutation,
    GQLUpdateMainMenuItemMutationVariables,
} from "./MainMenuItemPanel.generated";
import { MainMenuItemContent, MainMenuItemFooter, MainMenuItemPreview, MainMenuItemPreviewSection } from "./MainMenuItemPanel.sc";

const mainMenuItemQuery = gql`
    query MainMenuItemPanel($id: ID!) {
        mainMenuItem(pageTreeNodeId: $id) {
            id
            node {
                id
                name
                path
            }
            content
            updatedAt
        }
    }
`;

const updateMainMenuItemMutation = gql`
    mutation UpdateMainMenuItem($pageTreeNodeId: ID!, $lastUpdatedAt: DateTime, $input: MainMenuItemInput!) {
        updateMainMenuItem(pageTreeNodeId: $pageTreeNodeId, lastUpdatedAt: $lastUpdatedAt, input: $input) {
            id
            content
            updatedAt
        }
    }
`;

type RichTextBlockState = BlockState<typeof RichTextBlock>;

export interface MainMenuItemUnsavedChanges {
    discard: () => void;
}

interface MainMenuItemPanelProps {
    pageTreeNodeId: string;
    onClose: () => void;
    onUnsavedChangesChange: (unsavedChanges: MainMenuItemUnsavedChanges | undefined) => void;
}

function toContentState(content: unknown): RichTextBlockState | null {
    return content ? RichTextBlock.input2State(content as Parameters<typeof RichTextBlock.input2State>[0]) : null;
}

export function MainMenuItemPanel({ pageTreeNodeId, onClose, onUnsavedChangesChange }: MainMenuItemPanelProps) {
    const intl = useIntl();
    const match = useRouteMatch();
    const { match: contentScopeMatch, scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });
    const previewApi = useBlockPreview();
    const blockContext = useBlockContext();
    const showToast = useShowAppToast();
    const [content, setContent] = useState<RichTextBlockState | null>(null);
    const [savedContentOutput, setSavedContentOutput] = useState<unknown>(null);

    const { data, loading, error } = useQuery<GQLMainMenuItemPanelQuery, GQLMainMenuItemPanelQueryVariables>(mainMenuItemQuery, {
        variables: { id: pageTreeNodeId },
    });
    const [updateMainMenuItem, { loading: saving, error: saveError }] = useMutation<
        GQLUpdateMainMenuItemMutation,
        GQLUpdateMainMenuItemMutationVariables
    >(updateMainMenuItemMutation, { context: LocalErrorScopeApolloContext });

    const item = data?.mainMenuItem;

    const resetToSavedContent = () => {
        const state = toContentState(item?.content);
        setContent(state);
        setSavedContentOutput(state ? RichTextBlock.state2Output(state) : null);
    };

    useEffect(() => {
        if (item) {
            resetToSavedContent();
        }
        // Only a newly loaded or saved item replaces the edited content
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item]);

    const contentOutput = content ? RichTextBlock.state2Output(content) : null;
    const hasChanges = item != null && !deepEqual(savedContentOutput, contentOutput);

    const resetToSavedContentRef = useRef(resetToSavedContent);
    resetToSavedContentRef.current = resetToSavedContent;
    const unsavedChanges = useMemo<MainMenuItemUnsavedChanges>(() => ({ discard: () => resetToSavedContentRef.current() }), []);
    useEffect(() => {
        onUnsavedChangesChange(hasChanges ? unsavedChanges : undefined);
    }, [hasChanges, unsavedChanges, onUnsavedChangesChange]);
    useEffect(() => () => onUnsavedChangesChange(undefined), [onUnsavedChangesChange]);

    const save = async () => {
        if (!item) {
            return false;
        }
        try {
            await updateMainMenuItem({
                variables: { pageTreeNodeId: item.node.id, input: { content: contentOutput }, lastUpdatedAt: item.updatedAt },
                refetchQueries: ["MainMenuItemPanel", "MainMenu"],
                awaitRefetchQueries: true,
            });
        } catch {
            showToast({
                tone: "error",
                message: intl.formatMessage({ id: "mainMenu.panel.saveFailed", defaultMessage: "The menu item wasn't saved" }),
            });
            return false;
        }
        showToast({ message: intl.formatMessage({ id: "mainMenu.panel.saved", defaultMessage: "Menu item saved" }) });
        return true;
    };

    const closeButton = (
        <IconButton
            aria-label={intl.formatMessage({ id: "mainMenu.panel.close", defaultMessage: "Close" })}
            variant="text"
            color="secondary"
            size="small"
            onClick={onClose}
        >
            <Icon name="close" />
        </IconButton>
    );

    if (!item) {
        return (
            <Panel title={intl.formatMessage({ id: "mainMenu.editMenuItem", defaultMessage: "Edit menu item" })} actions={closeButton}>
                {loading ? (
                    <Skeleton variant="row" count={4} />
                ) : (
                    <EmptyState
                        icon={<Icon name="warning" />}
                        title={intl.formatMessage({ id: "mainMenu.panel.loadFailed", defaultMessage: "The menu item couldn't be loaded" })}
                        description={error?.message}
                    />
                )}
            </Panel>
        );
    }

    const previewState = content
        ? RichTextBlock.createPreviewState(content, { ...blockContext, parentUrl: match.url, showVisibleOnly: previewApi.showOnlyVisible })
        : null;
    const saveState: SaveStateValue = saving ? "saving" : saveError != null && hasChanges ? "error" : hasChanges ? "dirty" : "saved";

    return (
        <Panel
            title={item.node.name}
            description={item.node.path}
            actions={
                <>
                    <Tooltip content={intl.formatMessage({ id: "mainMenu.panel.sitePreview", defaultMessage: "Open the page in the site preview" })}>
                        <IconButton
                            aria-label={intl.formatMessage({ id: "mainMenu.panel.sitePreview", defaultMessage: "Open the page in the site preview" })}
                            variant="text"
                            color="secondary"
                            size="small"
                            onClick={() => openSitePreviewWindow(item.node.path, contentScopeMatch.url)}
                        >
                            <Icon name="preview" />
                        </IconButton>
                    </Tooltip>
                    {closeButton}
                </>
            }
        >
            <UnsavedChangesPrompt hasChanges={hasChanges} onSave={save} onDiscard={resetToSavedContent} allowWithin={match.url} />
            <IFrameBridgeProvider>
                <MainMenuItemContent>
                    {content ? (
                        <>
                            <BlockAdminComponentRoot title={intl.formatMessage({ id: "mainMenu.menuItem", defaultMessage: "Menu item" })}>
                                <RichTextBlock.AdminComponent
                                    state={content}
                                    updateState={(setStateAction) => setContent(resolveNewState({ prevState: content, setStateAction }))}
                                />
                            </BlockAdminComponentRoot>
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                startIcon={<Icon name="delete" />}
                                onClick={() => setContent(null)}
                            >
                                {intl.formatMessage({ id: "mainMenu.removeContent", defaultMessage: "Remove content" })}
                            </Button>
                            <MainMenuItemPreviewSection aria-label={intl.formatMessage({ id: "mainMenu.panel.preview", defaultMessage: "Preview" })}>
                                <MainMenuItemPreview
                                    url={`${siteConfig.blockPreviewBaseUrl}/main-menu`}
                                    siteUrl={`${siteConfig.url}/${scope.language}${item.node.path}`}
                                    previewState={previewState}
                                    previewApi={previewApi}
                                />
                            </MainMenuItemPreviewSection>
                        </>
                    ) : (
                        <EmptyState
                            icon={<Icon name="snips" />}
                            title={intl.formatMessage({ id: "mainMenu.panel.noContent", defaultMessage: "No content" })}
                            description={intl.formatMessage({
                                id: "mainMenu.panel.noContentDescription",
                                defaultMessage: "Add a text the site shows in the menu below this page.",
                            })}
                            actions={
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<Icon name="plus" />}
                                    onClick={() => setContent(RichTextBlock.defaultValues())}
                                >
                                    {intl.formatMessage({ id: "mainMenu.addContent", defaultMessage: "Add content" })}
                                </Button>
                            }
                        />
                    )}
                    <MainMenuItemFooter>
                        <SaveState
                            state={saveState}
                            savedAt={new Date(item.updatedAt)}
                            locale={intl.locale}
                            labels={{
                                saved: intl.formatMessage({ id: "mainMenu.panel.saveState.saved", defaultMessage: "Saved" }),
                                dirty: intl.formatMessage({ id: "mainMenu.panel.saveState.dirty", defaultMessage: "Unsaved changes" }),
                                saving: intl.formatMessage({ id: "mainMenu.panel.saveState.saving", defaultMessage: "Saving …" }),
                                error: intl.formatMessage({ id: "mainMenu.panel.saveState.error", defaultMessage: "Not saved" }),
                                savedAt: intl.formatMessage({ id: "mainMenu.panel.saveState.savedAt", defaultMessage: "Saved '{time}'" }),
                            }}
                        />
                        <Button size="small" startIcon={<Icon name="check" />} loading={saving} disabled={!hasChanges} onClick={() => void save()}>
                            {intl.formatMessage(messages.save)}
                        </Button>
                    </MainMenuItemFooter>
                </MainMenuItemContent>
            </IFrameBridgeProvider>
        </Panel>
    );
}
