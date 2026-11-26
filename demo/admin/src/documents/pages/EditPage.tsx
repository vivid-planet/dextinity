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
    createUsePage,
    DependenciesList,
    DependentsList,
    openSitePreviewWindow,
    PageName,
    TranslateContentMenuItem,
    useBlockContext,
    useBlockPreview,
    useBlocksConfig,
    useContentScope,
    useSiteConfig,
} from "@dextinity/cms-admin";
import { IconButton, Stack } from "@mui/material";
import { useAiModeToolset } from "@src/aiMode/AiModeToolsets";
import { withListItemType, withoutListItemType } from "@src/aiMode/blockChildren";
import { updateBlockState } from "@src/aiMode/blockProps";
import { summarizeBlockState, summarizeSeoBlockState } from "@src/aiMode/blockStateSummary";
import { type EditBlocks, planBlockEdits } from "@src/aiMode/editBlocks";
import { type AiModePageState, createPageTools, stageItemType, type UpdateSeo } from "@src/aiMode/pageTools";
import { useEffect, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { matchPath, useLocation } from "react-router";

import { BasicStageBlock } from "./blocks/BasicStageBlock";
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

    const routeUrl = useCurrentRouteMatch()?.url ?? "";
    const { pathname } = useLocation();
    const stackApi = useStackApi();
    const { match: contentScopeMatch, scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });
    const previewApi = useBlockPreview();

    const blockContext = useBlockContext();

    const tabRouteMatch = matchPath({ path: `${routeUrl}/:tab`, end: false }, pathname);
    const tab = tabRouteMatch?.params.tab;

    const document = pageState?.document;

    const { isBlockSupported } = useBlocksConfig();
    const insertablePageContentBlocks = isBlockSupported
        ? Object.fromEntries(Object.entries(pageContentBlocks).filter(([, block]) => isBlockSupported(block, scope)))
        : pageContentBlocks;

    const latestDocumentRef = useRef(document);
    useEffect(() => {
        latestDocumentRef.current = document;
    });

    // Planning awaits conversions that can query the API. Applying the result to a root block that changed
    // meanwhile, by the user or because another page was opened, would undo those changes or edit the wrong
    // page, so the whole change is rejected instead.
    const assertUnchangedSincePlanning = (hasChanged: boolean) => {
        if (hasChanged) {
            throw new Error("The page changed while the edits were prepared, so none of them were applied. Read the page state again and retry.");
        }
    };

    // Deliberately not memoized: useAiModeToolset registers it again on every render, so the agent always reaches the
    // callback of the latest one.
    const editBlocks: EditBlocks = async ({ target, operations }) => {
        if (target === "stage") {
            const plannedStageBlocks = document?.stage.blocks ?? [];
            const { apply, results } = await planBlockEdits({
                blocks: withListItemType(plannedStageBlocks, stageItemType),
                blockListName: "stage",
                maxVisibleBlocks: 1,
                operations,
                supportedBlocks: { [stageItemType]: BasicStageBlock },
                schemaRootBlockName: "Stage",
                blockContext,
            });

            if (apply) {
                assertUnchangedSincePlanning(latestDocumentRef.current?.stage.blocks !== plannedStageBlocks);
                setPageState((previous) =>
                    previous?.document
                        ? {
                              ...previous,
                              document: {
                                  ...previous.document,
                                  stage: {
                                      ...previous.document.stage,
                                      blocks: withoutListItemType(
                                          apply(withListItemType(previous.document.stage.blocks, stageItemType)),
                                      ) as typeof previous.document.stage.blocks,
                                  },
                              },
                          }
                        : previous,
                );
            }

            return { results };
        }

        const plannedContentBlocks = document?.content.blocks ?? [];
        const { apply, results } = await planBlockEdits({
            blocks: plannedContentBlocks,
            blockListName: "content",
            operations,
            supportedBlocks: pageContentBlocks,
            insertableBlocks: insertablePageContentBlocks,
            additionalItemFields: pageContentAdditionalItemFields,
            // PageContentBlock's name in block-meta, where the agent resolves the block schemas.
            schemaRootBlockName: "PageContent",
            blockContext,
        });

        if (apply) {
            assertUnchangedSincePlanning(latestDocumentRef.current?.content.blocks !== plannedContentBlocks);
            // One update for the whole batch, so the page is marked as changed once rather than per operation.
            setPageState((previous) =>
                previous?.document
                    ? {
                          ...previous,
                          document: {
                              ...previous.document,
                              content: {
                                  ...previous.document.content,
                                  // The steps keep the item fields of every block and give an inserted one the default values of
                                  // `pageContentAdditionalItemFields`, which the generic block child type doesn't know about.
                                  blocks: apply(previous.document.content.blocks) as typeof previous.document.content.blocks,
                              },
                          },
                      }
                    : previous,
            );
        }

        return { results };
    };

    const updateSeo: UpdateSeo = async ({ props }) => {
        const plannedSeo = document?.seo;
        const { state, warnings } = await updateBlockState({
            block: SeoBlock,
            type: "Seo",
            schemaRootBlockName: "Seo",
            state: plannedSeo ?? SeoBlock.defaultValues(),
            props,
            blockContext,
            schemaLookup: 'call get_block_schema for "Seo"',
        });

        assertUnchangedSincePlanning(latestDocumentRef.current?.seo !== plannedSeo);
        setPageState((previous) =>
            previous?.document ? { ...previous, document: { ...previous.document, seo: state as typeof previous.document.seo } } : previous,
        );

        return { warnings };
    };

    const aiModePageState: AiModePageState | null =
        pageState && document
            ? {
                  pageTreeNodeId: id,
                  documentType: document.__typename,
                  documentId: document.id,
                  path: pageState.path,
                  activeTab: tab ?? "content",
                  // Nested block editing is URL-driven, so the route below the active tab identifies the selected block.
                  selectedBlockRoute:
                      tabRouteMatch && pathname.length > tabRouteMatch.pathname.length ? pathname.slice(tabRouteMatch.pathname.length) : undefined,
                  hasChanges: hasChanges ?? false,
              }
            : null;

    useAiModeToolset(
        aiModePageState && document
            ? {
                  id: "page",
                  description:
                      "The editor of the page open in the page tree. It has the page's unsaved changes, which the MCP server's get_page doesn't.",
                  context: aiModePageState,
                  tools: createPageTools({
                      pageState: aiModePageState,
                      getDocumentSummary: () => ({
                          content: summarizeBlockState(PageContentBlock, document.content),
                          stage: summarizeBlockState(StageBlock, document.stage),
                          seo: summarizeSeoBlockState(SeoBlock, document.seo),
                      }),
                      editBlocks,
                      updateSeo,
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
