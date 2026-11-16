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
    useStackApi,
} from "@dextinity/admin";
import { ArrowLeft, Preview } from "@dextinity/admin-icons";
import {
    BlockAdminComponentRoot,
    BlockAdminTabLabel,
    BlockPreviewWithTabs,
    ContentGenerationConfigProvider,
    ContentScopeIndicator,
    createUsePage,
    DependenciesList,
    DependentsList,
    openSitePreviewWindow,
    PageName,
    TranslateContentMenuItem,
    useBlockContext,
    useBlockPreview,
    useContentScope,
    useSiteConfig,
} from "@dextinity/cms-admin";
import { IconButton, Stack } from "@mui/material";
import { useRegisterAiModePageState } from "@src/aiMode/AiModePageStateContext";
import { useRegisterAiModePageTools } from "@src/aiMode/AiModePageToolsContext";
import type { BlocksBlockChild } from "@src/aiMode/blockProps";
import { summarizeBlockState, summarizeSeoBlockState } from "@src/aiMode/blockStateSummary";
import { type EditBlocks, planBlockEdits } from "@src/aiMode/editBlocks";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation, useRouteMatch } from "react-router";

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

const usePage = createUsePage({
    rootBlocks: {
        content: PageContentBlock,
        seo: SeoBlock,
        stage: StageBlock,
    },
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

export const EditPage = ({ id }: Props) => {
    const intl = useIntl();
    const { pageState, setPageState, rootBlocksApi, hasChanges, loading, dialogs, pageSaveButton, handleSavePage, translateContent } = usePage({
        pageId: id,
    });

    const match = useRouteMatch();
    const stackApi = useStackApi();
    const { match: contentScopeMatch, scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });
    const previewApi = useBlockPreview();

    const blockContext = useBlockContext();

    const location = useLocation();
    const tabRouteMatch = useRouteMatch<{ tab: string }>(`${match.path}/:tab`);

    const document = pageState?.document;

    const updateContentBlocks = (update: (blocks: BlocksBlockChild[]) => BlocksBlockChild[]) => {
        setPageState((previous) => {
            if (!previous?.document) {
                return previous;
            }

            return {
                ...previous,
                document: {
                    ...previous.document,
                    content: {
                        ...previous.document.content,
                        // The steps keep the item fields of every block and give an inserted one the default values of
                        // `pageContentAdditionalItemFields`, which the generic block child type doesn't know about.
                        blocks: update(previous.document.content.blocks) as typeof previous.document.content.blocks,
                    },
                },
            };
        });
    };

    // Deliberately not memoized: useRegisterAiModePageTools re-registers on every render, so the
    // agent always reaches the callback of the latest one — which is also the state it plans the
    // batch against, as setPageState applies its updater later.
    const editBlocks: EditBlocks = async ({ operations }) => {
        const { apply, results } = await planBlockEdits({
            blocks: document?.content.blocks ?? [],
            operations,
            supportedBlocks: pageContentBlocks,
            additionalItemFields: pageContentAdditionalItemFields,
            // PageContentBlock's name in block-meta, where the agent resolves the block schemas.
            schemaRootBlockName: "PageContent",
            blockContext,
        });

        // One update for the whole batch, so the page is marked as changed once rather than per
        // operation. Its steps address the blocks by key rather than by the positions planned above,
        // which come from the last render and may have moved on by the time the updater runs.
        if (apply) {
            updateContentBlocks(apply);
        }

        return { results };
    };

    useRegisterAiModePageTools(document ? { editBlocks } : null);

    useRegisterAiModePageState(
        pageState && document
            ? {
                  metadata: {
                      pageTreeNodeId: id,
                      documentType: document.__typename,
                      documentId: document.id,
                      path: pageState.path,
                      activeTab: tabRouteMatch?.params.tab ?? "content",
                      // Nested block editing is URL-driven, so the route below the active tab identifies the selected block.
                      selectedBlockRoute:
                          tabRouteMatch && location.pathname.length > tabRouteMatch.url.length
                              ? location.pathname.slice(tabRouteMatch.url.length)
                              : undefined,
                      hasChanges: hasChanges ?? false,
                  },
                  getDocumentSummary: () => ({
                      content: summarizeBlockState(PageContentBlock, document.content),
                      stage: summarizeBlockState(StageBlock, document.stage),
                      seo: summarizeSeoBlockState(SeoBlock, document.seo),
                  }),
              }
            : null,
    );

    if (pageState == null || pageState.document == null) {
        return null;
    }

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    let previewUrl: string;
    let previewState;

    if (tabRouteMatch?.params.tab === "stage") {
        previewUrl = `${siteConfig.blockPreviewBaseUrl}/stage`;
        previewState = StageBlock.createPreviewState(pageState.document.stage, {
            ...blockContext,
            parentUrl: `${match.url}/stage`,
            showVisibleOnly: previewApi.showOnlyVisible,
        });
    } else {
        previewUrl = `${siteConfig.blockPreviewBaseUrl}/page`;
        previewState = PageContentBlock.createPreviewState(pageState.document.content, {
            ...blockContext,
            parentUrl: match.url,
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
                        if (location.pathname.startsWith(match.url)) {
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
