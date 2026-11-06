import { gql } from "@apollo/client";
import {
    BlockAdminComponentRoot,
    ContentGenerationConfigProvider,
    createUsePage,
    DependenciesList,
    DependentsList,
    PageContentEditor,
    useBlockContext,
    useBlockPreview,
    useContentScope,
    useSiteConfig,
} from "@dextinity/cms-admin";
import { useIntl } from "react-intl";
import { useRouteMatch } from "react-router";

import { PageContentBlock } from "./blocks/PageContentBlock";
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
    const pageApi = usePage({ pageId: id });
    const { pageState, rootBlocksApi, rootBlocksValidity } = pageApi;
    const match = useRouteMatch();
    const { scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });
    const previewApi = useBlockPreview();
    const blockContext = useBlockContext();

    const document = pageState?.document;
    const siteUrl = pageState != null ? `${siteConfig.url}/${scope.language}${pageState.path}` : undefined;
    const previewContext = { ...blockContext, showVisibleOnly: previewApi.showOnlyVisible };

    return (
        <ContentGenerationConfigProvider
            seo={{
                getRelevantContent: () =>
                    document != null ? (PageContentBlock.extractTextContents?.(document.content, { includeInvisibleContent: false }) ?? []) : [],
            }}
        >
            <PageContentEditor
                pageId={id}
                pageApi={pageApi}
                previewApi={previewApi}
                preview={
                    document != null
                        ? {
                              url: `${siteConfig.blockPreviewBaseUrl}/page`,
                              state: PageContentBlock.createPreviewState(document.content, { ...previewContext, parentUrl: match.url }),
                              siteUrl,
                          }
                        : undefined
                }
                tabs={[
                    {
                        key: "content",
                        label: intl.formatMessage({ id: "generic.blocks", defaultMessage: "Blocks" }),
                        invalid: rootBlocksValidity.content === false,
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
                        label: intl.formatMessage({ id: "pages.page.edit.stage", defaultMessage: "Stage" }),
                        invalid: rootBlocksValidity.stage === false,
                        preview:
                            document != null
                                ? {
                                      url: `${siteConfig.blockPreviewBaseUrl}/stage`,
                                      state: StageBlock.createPreviewState(document.stage, { ...previewContext, parentUrl: `${match.url}/stage` }),
                                      siteUrl,
                                  }
                                : undefined,
                        content: (
                            <BlockAdminComponentRoot title={intl.formatMessage({ id: "pages.pages.page.edit.stage.title", defaultMessage: "Stage" })}>
                                {rootBlocksApi.stage.adminUI}
                            </BlockAdminComponentRoot>
                        ),
                    },
                    {
                        key: "config",
                        label: intl.formatMessage({ id: "pages.pages.page.edit.config", defaultMessage: "Config" }),
                        invalid: rootBlocksValidity.seo === false,
                        content: rootBlocksApi.seo.adminUI,
                    },
                    {
                        key: "dependents",
                        label: intl.formatMessage({ id: "pages.pages.page.edit.dependents", defaultMessage: "Dependents" }),
                        content: <DependentsList query={pageTreeNodeDependentsQuery} variables={{ id }} />,
                    },
                    {
                        key: "dependencies",
                        label: intl.formatMessage({ id: "pages.pages.page.edit.dependencies", defaultMessage: "Dependencies" }),
                        content: document != null ? <DependenciesList query={pageTreeNodeDependenciesQuery} variables={{ id: document.id }} /> : null,
                    },
                ]}
            />
        </ContentGenerationConfigProvider>
    );
};
