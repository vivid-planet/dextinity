import { useQuery } from "@apollo/client";
import { type IStackApi, LocalErrorScopeApolloContext, Stack, StackApiContext, useStackApi } from "@dextinity/admin";
import { Banner, Button, EditLayout, EmptyState, Icon, PageHeader, Panel, Skeleton } from "@dextinity/ui";
import { type ComponentType, type PropsWithChildren, useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";

import { useShowAppToast } from "../../common/toasts/AppToasts";
import { DamScopeProvider } from "../../dam/config/DamScopeProvider";
import type { DocumentInterface, DocumentType } from "../../documents/types";
import { usePageTreeScope } from "../config/usePageTreeScope";
import type { EditPageNodeProps } from "../createEditPageNode";
import { createPagesQuery, type GQLPagesQuery, type GQLPagesQueryVariables } from "../pagesPage/createPagesQuery";
import { PageTreeContext } from "../pageTree/PageTreeContext";
import { arrayToTreeMap } from "../pageTree/treemap/TreeMapUtils";
import { usePageTreeConfig } from "../pageTreeConfig";
import { PageEditorContext, type PageEditorContextValue } from "./PageEditorContext";
import { selectedPageParam } from "./selectedPageParam";

interface PageEditorRouteProps {
    pageId: string;
    category: string;
    documentTypes: Record<DocumentType, DocumentInterface>;
    getDocumentTypesByCategory?: (category: string) => Record<DocumentType, DocumentInterface>;
    pageTreeUrl: string;
    /** The dialog with the page's properties, offered in the editor's "More actions" menu. */
    editPageNode: ComponentType<EditPageNodeProps>;
}

/**
 * Hosts the editor of a page's document type at `<page tree url>/<pageId>/edit`: loads the page from the page tree query, shows why it
 * can't be edited, and provides the contexts that editors and blocks rely on.
 */
export function PageEditorRoute({
    pageId,
    category,
    documentTypes,
    getDocumentTypesByCategory,
    pageTreeUrl,
    editPageNode: EditPageNode,
}: PageEditorRouteProps) {
    const intl = useIntl();
    const showToast = useShowAppToast();
    const [isPagePropertiesOpen, setIsPagePropertiesOpen] = useState(false);
    const history = useHistory();
    const pageTreeScope = usePageTreeScope();
    const { additionalPageTreeNodeFragment } = usePageTreeConfig();
    const pagesQuery = useMemo(() => createPagesQuery({ additionalPageTreeNodeFragment }), [additionalPageTreeNodeFragment]);
    const { data, loading, error } = useQuery<GQLPagesQuery, GQLPagesQueryVariables>(pagesQuery, {
        fetchPolicy: "cache-and-network",
        variables: { contentScope: pageTreeScope, category },
        context: LocalErrorScopeApolloContext,
    });
    const pages = useMemo(() => data?.pages ?? [], [data]);
    const tree = useMemo(() => arrayToTreeMap([...pages].sort((pageA, pageB) => pageA.pos - pageB.pos)), [pages]);

    const backLocation = { pathname: pageTreeUrl, search: new URLSearchParams({ [selectedPageParam]: pageId }).toString() };
    const backHref = history.createHref(backLocation);
    const back = {
        label: intl.formatMessage({ id: "dextinity.pageEditor.back", defaultMessage: "Page tree" }),
        href: backHref,
        onClick: () => history.push(backLocation),
    };
    const backButton = (
        <Button variant="outlined" color="secondary" startIcon={<Icon name="arrow-left" />} onClick={back.onClick}>
            {intl.formatMessage({ id: "dextinity.pageEditor.backToPageTree", defaultMessage: "Back to the page tree" })}
        </Button>
    );

    if (error != null && data == null) {
        throw error;
    }

    if (data == null && loading) {
        return (
            <EditLayout
                variant="page"
                loading
                header={
                    <PageHeader
                        variant="compact"
                        back={back}
                        title={intl.formatMessage({ id: "dextinity.pageEditor.loading", defaultMessage: "Loading page …" })}
                        subtitle={<Skeleton width={160} />}
                    />
                }
            >
                {null}
            </EditLayout>
        );
    }

    const page = pages.find((page) => page.id === pageId);
    const documentType = page != null ? documentTypes[page.documentType] : undefined;
    const EditComponent = documentType?.editComponent;

    if (page == null || documentType == null || EditComponent == null) {
        return (
            <PageHeaderWithMessage
                title={page?.name ?? intl.formatMessage({ id: "dextinity.pageEditor.notFound.title", defaultMessage: "Page not found" })}
                back={back}
            >
                <Panel>
                    <EmptyState
                        icon={<Icon name="file" />}
                        title={
                            page == null
                                ? intl.formatMessage({ id: "dextinity.pageEditor.notFound.title", defaultMessage: "Page not found" })
                                : intl.formatMessage({ id: "dextinity.pageEditor.notEditable.title", defaultMessage: "Nothing to edit" })
                        }
                        description={
                            page == null
                                ? intl.formatMessage({
                                      id: "dextinity.pageEditor.notFound.description",
                                      defaultMessage: "This page doesn't exist in the current scope. It may have been deleted.",
                                  })
                                : intl.formatMessage({
                                      id: "dextinity.pageEditor.notEditable.description",
                                      defaultMessage: "Pages of this type have no content to edit.",
                                  })
                        }
                        actions={backButton}
                    />
                </Panel>
            </PageHeaderWithMessage>
        );
    }

    if (page.visibility === "Archived") {
        return (
            <PageHeaderWithMessage title={page.name} back={back}>
                <Banner tone="error" action={backButton}>
                    {intl.formatMessage({
                        id: "dextinity.pageEditor.archived",
                        defaultMessage: "This page is archived and can no longer be edited. Restore it in the page tree to edit it again.",
                    })}
                </Banner>
            </PageHeaderWithMessage>
        );
    }

    const pageEditorContext: PageEditorContextValue = {
        backUrl: `${pageTreeUrl}?${backLocation.search}`,
        category,
        documentType,
        page,
        openPageProperties: () => setIsPagePropertiesOpen(true),
    };

    return (
        <DamScopeProvider>
            <PageTreeContext.Provider value={{ currentCategory: category, getDocumentTypesByCategory, tree, query: pagesQuery }}>
                <PageEditorContext.Provider value={pageEditorContext}>
                    <Stack topLevelTitle={page.name}>
                        <BackToPageTreeStackApi backUrl={pageEditorContext.backUrl}>
                            <EditComponent id={pageId} category={category} />
                        </BackToPageTreeStackApi>
                    </Stack>
                    <EditPageNode
                        open={isPagePropertiesOpen}
                        onOpenChange={setIsPagePropertiesOpen}
                        mode="edit"
                        id={pageId}
                        category={category}
                        documentTypes={documentTypes}
                        onSaved={() =>
                            showToast({
                                message: intl.formatMessage({
                                    id: "dextinity.pageTreeDetail.propertiesSaved",
                                    defaultMessage: "Page properties saved",
                                }),
                            })
                        }
                    />
                </PageEditorContext.Provider>
            </PageTreeContext.Provider>
        </DamScopeProvider>
    );
}

interface PageHeaderWithMessageProps {
    title: string;
    back: { label: string; href: string; onClick: () => void };
}

function PageHeaderWithMessage({ title, back, children }: PropsWithChildren<PageHeaderWithMessageProps>) {
    return (
        <EditLayout variant="form" header={<PageHeader variant="compact" back={back} title={title} />}>
            {children}
        </EditLayout>
    );
}

/**
 * Legacy editors leave through `useStackApi().goBack()`. The editor is the stack's first level, where going back would stay on the
 * editor, so it leads back to the page tree instead.
 */
function BackToPageTreeStackApi({ backUrl, children }: PropsWithChildren<{ backUrl: string }>) {
    const history = useHistory();
    const stackApi = useStackApi();
    const goBackToPageTree = useCallback(() => history.push(backUrl), [history, backUrl]);

    const value = useMemo<IStackApi | undefined>(
        () =>
            stackApi && {
                ...stackApi,
                goBack: stackApi.breadCrumbs.length > 1 ? stackApi.goBack : goBackToPageTree,
                goAllBack: goBackToPageTree,
            },
        [stackApi, goBackToPageTree],
    );

    return <StackApiContext.Provider value={value}>{children}</StackApiContext.Provider>;
}
