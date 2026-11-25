import { gql } from "@apollo/client";
import {
    CrudMoreActionsMenu,
    FillSpace,
    Loading,
    MainContent,
    RouterPrompt,
    Toolbar,
    ToolbarActions,
    ToolbarItem,
    useCurrentRouteMatch,
    useStackApi,
} from "@dextinity/admin";
import { ArrowLeft, Preview } from "@dextinity/admin-icons";
import {
    BlockAdminComponentRoot,
    BlockAdminTabLabel,
    BlockPreviewWithTabs,
    ContentGenerationConfigProvider,
    ContentScopeIndicator,
    createUseAiModePageTreeDocumentToolset,
    createUsePage,
    DependenciesList,
    DependentsList,
    openSitePreviewWindow,
    PageName,
    summarizeSeoBlockStateForAiMode,
    TranslateContentMenuItem,
    useBlockContext,
    useBlockPreview,
    useContentScope,
    useSiteConfig,
} from "@dextinity/cms-admin";
import { IconButton, Stack } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { matchPath, useLocation } from "react-router";

import { pageContentAdditionalItemFields, PageContentBlock, pageContentBlocks } from "./blocks/PageContentBlock";
import { SeoBlock } from "./blocks/SeoBlock";
import { StageBlock } from "./blocks/StageBlock";
import type { GQLEditPageQuery, GQLEditPageQueryVariables, GQLUpdatePageMutation, GQLUpdatePageMutationVariables } from "./EditPage.generated";

interface Props {
    id: string;
}

const pageTreeNodeDependentsQuery = gql`
    query PageTreeNodeDependents(
        $id: ID!
        $offset: Int!
        $limit: Int!
        $forceRefresh: Boolean = false
        $filter: DependentFilter
        $sort: [DependencySort!]
    ) {
        item: pageTreeNode(id: $id) {
            id
            dependents(offset: $offset, limit: $limit, forceRefresh: $forceRefresh, filter: $filter, sort: $sort) {
                nodes {
                    rootGraphqlObjectType
                    rootId
                    rootColumnName
                    jsonPath
                    name
                    secondaryInformation
                    visible
                    scope
                }
                totalCount
            }
        }
    }
`;

const pageTreeNodeDependenciesQuery = gql`
    query PageTreeNodeDependencies(
        $id: ID!
        $offset: Int!
        $limit: Int!
        $forceRefresh: Boolean = false
        $filter: DependencyFilter
        $sort: [DependencySort!]
    ) {
        item: page(id: $id) {
            id
            dependencies(offset: $offset, limit: $limit, forceRefresh: $forceRefresh, filter: $filter, sort: $sort) {
                nodes {
                    targetGraphqlObjectType
                    targetId
                    rootColumnName
                    jsonPath
                    name
                    secondaryInformation
                    visible
                    scope
                }
                totalCount
            }
        }
    }
`;

const rootBlocks = {
    content: PageContentBlock,
    seo: SeoBlock,
    stage: StageBlock,
};

const usePage = createUsePage({
    rootBlocks,
    pageType: "Page",
})<GQLEditPageQuery, GQLEditPageQueryVariables, GQLUpdatePageMutation["savePage"], GQLUpdatePageMutationVariables>({
    getQuery: gql`
        query EditPage($id: ID!) {
            page: pageTreeNode(id: $id) {
                id
                path
                document {
                    __typename
                    ... on DocumentInterface {
                        id
                        updatedAt
                    }
                    ... on Page {
                        content
                        seo
                        stage
                    }
                }
            }
        }
    `,
    updateMutation: gql`
        mutation UpdatePage($pageId: ID!, $input: PageInput!, $lastUpdatedAt: DateTime, $attachedPageTreeNodeId: ID) {
            savePage(pageId: $pageId, input: $input, lastUpdatedAt: $lastUpdatedAt, attachedPageTreeNodeId: $attachedPageTreeNodeId) {
                id
                content
                seo
                stage
                updatedAt
            }
        }
    `,
});

const useAiModePageToolset = createUseAiModePageTreeDocumentToolset({
    rootBlocks,
    summarizeRootBlocks: { seo: summarizeSeoBlockStateForAiMode },
    editableBlocks: {
        rootBlockKey: "content",
        supportedBlocks: pageContentBlocks,
        additionalItemFields: pageContentAdditionalItemFields,
        // PageContentBlock's name in block-meta, where the agent resolves the block schemas.
        schemaBlockName: "PageContent",
        schemaNameExamples:
            "'media' is the 'StandaloneMedia' block rather than the 'Media' block that also exists, 'richtext' is the 'StandaloneRichText' block rather than the 'RichText' block, 'heading' is the 'StandaloneHeading' block rather than the 'Heading' block, and 'image' is the 'DamImage' block",
        restrictions:
            "Only the page's top-level content blocks can be edited, not the stage or the SEO settings; passing the key of a nested block says so.",
    },
    defaultTab: "content",
});

export const EditPage = ({ id }: Props) => {
    const intl = useIntl();
    const { pageState, setPageState, rootBlocksApi, hasChanges, loading, dialogs, pageSaveButton, handleSavePage, translateContent } = usePage({
        pageId: id,
    });

    const routeUrl = useCurrentRouteMatch()?.url ?? "";
    const { pathname } = useLocation();
    const stackApi = useStackApi();
    const { match: contentScopeMatch, scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });
    const previewApi = useBlockPreview();

    const blockContext = useBlockContext();

    const tabRouteMatch = matchPath({ path: `${routeUrl}/:tab`, end: false }, pathname);
    const tab = tabRouteMatch?.params.tab;

    useAiModePageToolset({ pageTreeNodeId: id, pageState, setPageState, hasChanges });

    if (pageState == null || pageState.document == null) {
        return null;
    }

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    let previewUrl: string;
    let previewState;

    if (tab === "stage") {
        previewUrl = `${siteConfig.blockPreviewBaseUrl}/stage`;
        previewState = StageBlock.createPreviewState(pageState.document.stage, {
            ...blockContext,
            parentUrl: `${routeUrl}/stage`,
            showVisibleOnly: previewApi.showOnlyVisible,
        });
    } else {
        previewUrl = `${siteConfig.blockPreviewBaseUrl}/page`;
        previewState = PageContentBlock.createPreviewState(pageState.document.content, {
            ...blockContext,
            parentUrl: routeUrl,
            showVisibleOnly: previewApi.showOnlyVisible,
        });
    }

    return (
        <ContentGenerationConfigProvider
            seo={{
                getRelevantContent: () => {
                    if (!pageState || !pageState.document) {
                        return [];
                    }

                    return PageContentBlock.extractTextContents?.(pageState.document.content, { includeInvisibleContent: false }) ?? [];
                },
            }}
        >
            {hasChanges && (
                <RouterPrompt
                    message={(location) => {
                        if (location.pathname.startsWith(routeUrl)) {
                            return true;
                        } //we navigated within our self
                        return intl.formatMessage({
                            id: "editPage.discardChanges",
                            defaultMessage: "Discard unsaved changes?",
                        });
                    }}
                    saveAction={async () => {
                        try {
                            await handleSavePage();
                            return true;
                        } catch {
                            return false;
                        }
                    }}
                />
            )}
            <Toolbar scopeIndicator={<ContentScopeIndicator />}>
                <ToolbarItem>
                    <IconButton onClick={stackApi?.goBack} size="large">
                        <ArrowLeft />
                    </IconButton>
                </ToolbarItem>
                <PageName pageId={id} />
                <FillSpace />
                <ToolbarActions>
                    <Stack direction="row" spacing={1}>
                        <CrudMoreActionsMenu
                            overallActions={[
                                {
                                    label: <FormattedMessage id="pages.pages.page.edit.preview" defaultMessage="Site preview" />,
                                    icon: <Preview />,
                                    disabled: !pageState,
                                    onClick: () => {
                                        openSitePreviewWindow(pageState.path, contentScopeMatch.url);
                                    },
                                },
                                <TranslateContentMenuItem key="translate" translateContent={translateContent} disabled={!pageState?.document} />,
                            ]}
                        />
                        {pageSaveButton}
                    </Stack>
                </ToolbarActions>
            </Toolbar>
            <MainContent disablePaddingBottom>
                <BlockPreviewWithTabs previewUrl={previewUrl} previewState={previewState} previewApi={previewApi}>
                    {[
                        {
                            key: "content",
                            label: (
                                <BlockAdminTabLabel isValid={rootBlocksApi.content.isValid}>
                                    <FormattedMessage id="generic.blocks" defaultMessage="Blocks" />
                                </BlockAdminTabLabel>
                            ),
                            content: (
                                <BlockAdminComponentRoot
                                    title={intl.formatMessage({ id: "pages.pages.page.edit.pageBlocks.title", defaultMessage: "Page" })}
                                >
                                    {rootBlocksApi.content.adminUI}
                                </BlockAdminComponentRoot>
                            ),
                        },
                        {
                            key: "stage",
                            label: (
                                <BlockAdminTabLabel isValid={rootBlocksApi.stage.isValid}>
                                    <FormattedMessage id="pages.page.edit.stage" defaultMessage="Stage" />
                                </BlockAdminTabLabel>
                            ),
                            content: (
                                <BlockAdminComponentRoot
                                    title={intl.formatMessage({ id: "pages.pages.page.edit.stage.title", defaultMessage: "Stage" })}
                                >
                                    {rootBlocksApi.stage.adminUI}
                                </BlockAdminComponentRoot>
                            ),
                        },
                        {
                            key: "config",
                            label: (
                                <BlockAdminTabLabel isValid={rootBlocksApi.seo.isValid}>
                                    <FormattedMessage id="pages.pages.page.edit.config" defaultMessage="Config" />
                                </BlockAdminTabLabel>
                            ),
                            content: rootBlocksApi.seo.adminUI,
                        },
                        {
                            key: "dependents",
                            label: (
                                <BlockAdminTabLabel isValid={rootBlocksApi.seo.isValid}>
                                    <FormattedMessage id="pages.pages.page.edit.dependents" defaultMessage="Dependents" />
                                </BlockAdminTabLabel>
                            ),
                            content: (
                                <DependentsList
                                    query={pageTreeNodeDependentsQuery}
                                    variables={{
                                        id,
                                    }}
                                />
                            ),
                        },
                        {
                            key: "dependencies",
                            label: (
                                <BlockAdminTabLabel isValid={rootBlocksApi.seo.isValid}>
                                    <FormattedMessage id="pages.pages.page.edit.dependencies" defaultMessage="Dependencies" />
                                </BlockAdminTabLabel>
                            ),
                            content: (
                                <DependenciesList
                                    query={pageTreeNodeDependenciesQuery}
                                    variables={{
                                        id: pageState.document.id,
                                    }}
                                />
                            ),
                        },
                    ]}
                </BlockPreviewWithTabs>
            </MainContent>
            {dialogs}
        </ContentGenerationConfigProvider>
    );
};
