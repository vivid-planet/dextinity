import { useQuery } from "@apollo/client";
import {
    Alert,
    Button,
    Loading,
    LocalErrorScopeApolloContext,
    MainContent,
    messages,
    Stack,
    StackPage,
    StackSwitch,
    Toolbar,
    ToolbarActions,
    ToolbarItem,
    useEditDialog,
    useFocusAwarePolling,
    useStoredState,
} from "@dextinity/admin";
import { Add } from "@dextinity/admin-icons";
import { Box, DialogContent, Divider, FormControlLabel, LinearProgress, Paper, Switch } from "@mui/material";
import { type ComponentType, type ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { type ContentScope, createEditPageNode, useSiteConfig } from "../..";
import { useContentScope } from "../../contentScope/Provider";
import { useContentScopeConfig } from "../../contentScope/useContentScopeConfig";
import { DamScopeProvider } from "../../dam/config/DamScopeProvider";
import type { DocumentInterface, DocumentType } from "../../documents/types";
import { usePageTreeScope } from "../config/usePageTreeScope";
import type { EditPageNodeProps } from "../createEditPageNode";
import { PageSearch } from "../pageSearch/PageSearch";
import { usePageSearch } from "../pageSearch/usePageSearch";
import { PageTree, type PageTreeRefApi } from "../pageTree/PageTree";
import { PageTreeContext } from "../pageTree/PageTreeContext";
import { usePageTree } from "../pageTree/usePageTree";
import { usePageTreeConfig } from "../pageTreeConfig";
import { createPagesQuery, type GQLPagesQuery, type GQLPagesQueryVariables, type GQLPageTreePageFragment } from "./createPagesQuery";
import { PagesPageActionToolbar } from "./PagesPageActionToolbar";

interface Props {
    category: string;
    path: string;
    documentTypes: Record<DocumentType, DocumentInterface> | ((category: string) => Record<DocumentType, DocumentInterface>);
    editPageNode?: ComponentType<EditPageNodeProps>;
    renderContentScopeIndicator: (scope: ContentScope) => ReactNode;
}

const DefaultEditPageNode = createEditPageNode({});

export function PagesPage({
    category,
    path,
    documentTypes: passedDocumentTypes,
    editPageNode: EditPageNode = DefaultEditPageNode,
    renderContentScopeIndicator,
}: Props) {
    const intl = useIntl();
    const { scope, setRedirectPathAfterChange } = useContentScope();
    const { additionalPageTreeNodeFragment } = usePageTreeConfig();
    const pageTreeScope = usePageTreeScope();
    useContentScopeConfig({ redirectPathAfterChange: path });

    const siteConfig = useSiteConfig({ scope });
    const pagesQuery = useMemo(() => createPagesQuery({ additionalPageTreeNodeFragment }), [additionalPageTreeNodeFragment]);
    const documentTypes = typeof passedDocumentTypes === "function" ? passedDocumentTypes(category) : passedDocumentTypes;

    useEffect(() => {
        setRedirectPathAfterChange(path);
        return () => {
            setRedirectPathAfterChange(undefined);
        };
    }, [setRedirectPathAfterChange, path]);

    const { loading, data, error, refetch, startPolling, stopPolling } = useQuery<GQLPagesQuery, GQLPagesQueryVariables>(pagesQuery, {
        fetchPolicy: "cache-and-network",
        variables: {
            contentScope: pageTreeScope,
            category,
        },
        context: LocalErrorScopeApolloContext,
    });

    useFocusAwarePolling({
        pollInterval: 10000,
        refetch,
        startPolling,
        stopPolling,
    });

    const isInitialLoad = useRef(true);

    if (error) {
        const isPollingError = !isInitialLoad.current;

        if (isPollingError) {
            // Ignore
        } else {
            throw error;
        }
    }

    if (isInitialLoad.current && !loading) {
        isInitialLoad.current = false;
    }

    const [EditDialog, editDialogSelection, editDialogApi] = useEditDialog();

    const refPageTree = useRef<PageTreeRefApi>(null);
    const [showArchive, setShowArchive] = useStoredState<boolean>("pageTreeShowArchive", false, window.sessionStorage);

    const ignorePages = useCallback((page: GQLPageTreePageFragment) => (showArchive ? true : page.visibility !== "Archived"), [showArchive]);

    const { tree, pagesToRender, setExpandedIds, expandedIds, toggleExpand, onSelectChanged, setSelectedIds, selectState, selectedTree } =
        usePageTree({
            pages: data?.pages ?? [],
            filter: ignorePages,
        });

    const pageSearchApi = usePageSearch({
        tree,
        pagesToRender,
        siteUrl: siteConfig.url,
        setExpandedIds,
        onUpdateCurrentMatch: (pageId, pagesToRender) => {
            const index = pagesToRender.findIndex((c) => c.id === pageId);
            if (index !== -1) {
                refPageTree.current?.scrollToItem(index, "smart");
            }
        },
    });
    const { pagesToRenderWithMatches, query, setQuery } = pageSearchApi;

    function handleArchiveToggleClick() {
        setShowArchive((s) => !s);
    }

    return (
        <DamScopeProvider>
            <Stack topLevelTitle={intl.formatMessage({ id: "dextinity.pages.pages", defaultMessage: "Pages" })}>
                <StackSwitch>
                    <StackPage name="table">
                        <Toolbar scopeIndicator={renderContentScopeIndicator(pageTreeScope)}>
                            <ToolbarItem sx={{ flexGrow: 1 }}>
                                <PageSearch query={query} onQueryChange={setQuery} pageSearchApi={pageSearchApi} />
                            </ToolbarItem>
                            <ToolbarItem>
                                <FormControlLabel
                                    control={<Switch checked={showArchive} color="primary" onChange={handleArchiveToggleClick} />}
                                    label={<FormattedMessage id="dextinity.pages.pages.archivedItems" defaultMessage="Archived items" />}
                                />
                            </ToolbarItem>
                            <ToolbarActions>
                                <Button
                                    startIcon={<Add />}
                                    onClick={() => {
                                        editDialogApi.openAddDialog();
                                    }}
                                >
                                    <FormattedMessage {...messages.add} />
                                </Button>
                            </ToolbarActions>
                        </Toolbar>
                        <PageTreeContext.Provider
                            value={{
                                currentCategory: category,
                                getDocumentTypesByCategory: typeof passedDocumentTypes === "function" ? passedDocumentTypes : undefined,
                                tree,
                                query: pagesQuery,
                            }}
                        >
                            <MainContent fullHeight sx={{ display: "flex", flexDirection: "column" }}>
                                <Box>
                                    <PagesPageActionToolbar
                                        selectedState={selectState}
                                        onSelectAllPressed={() => {
                                            if (selectState === "nothing_selected" || selectState === "some_selected") {
                                                // select all pages
                                                if (data) {
                                                    setSelectedIds(data.pages.map((page) => page.id));
                                                }
                                            } else if (selectState === "all_selected") {
                                                // Unselect all
                                                setSelectedIds([]);
                                            }
                                        }}
                                        selectedTree={selectedTree}
                                        collapseAllDisabled={!expandedIds.length}
                                        onCollapseAllPressed={() => {
                                            setExpandedIds([]);
                                        }}
                                    />
                                </Box>
                                <Paper variant="outlined" sx={{ flex: 1 }}>
                                    {loading && isInitialLoad.current ? (
                                        <Loading behavior="fillParent" />
                                    ) : (
                                        <>
                                            <Divider />
                                            {loading && !isInitialLoad.current ? (
                                                <LinearProgress />
                                            ) : (
                                                /* Placeholder to avoid content jumping when the loading bar appears */
                                                <Box sx={{ backgroundColor: "white", width: "100%", height: 2 }} />
                                            )}
                                            <PageTree
                                                ref={refPageTree}
                                                pages={pagesToRenderWithMatches}
                                                editDialogApi={editDialogApi}
                                                toggleExpand={toggleExpand}
                                                onSelectChanged={onSelectChanged}
                                                category={category}
                                                siteUrl={siteConfig.url}
                                            />
                                        </>
                                    )}
                                </Paper>
                            </MainContent>
                        </PageTreeContext.Provider>

                        <EditDialog>
                            <DialogContent>
                                <EditPageNode
                                    id={editDialogSelection.id || null}
                                    mode={editDialogSelection.mode ?? "add"}
                                    category={category}
                                    documentTypes={documentTypes}
                                />
                            </DialogContent>
                        </EditDialog>
                    </StackPage>
                    <StackPage name="edit" title={intl.formatMessage({ id: "dextinity.pages.pages.editContent", defaultMessage: "Edit content" })}>
                        {(selectedId) => {
                            const page = data?.pages.find((page) => page.id == selectedId);

                            if (loading && isInitialLoad.current) {
                                return <Loading behavior="fillPageHeight" />;
                            }

                            if (!page) {
                                return (
                                    <MainContent>
                                        <Alert
                                            title={<FormattedMessage id="dextinity.pages.pages.notFound" defaultMessage="Not found" />}
                                            severity="error"
                                        >
                                            <FormattedMessage
                                                id="dextinity.pages.pages.documentDoesntExist"
                                                defaultMessage="This document doesn't exist"
                                            />
                                        </Alert>
                                    </MainContent>
                                );
                            }

                            if (page.visibility === "Archived") {
                                return (
                                    <MainContent>
                                        <Alert
                                            title={<FormattedMessage id="dextinity.pages.pages.archived" defaultMessage="Archived" />}
                                            severity="error"
                                        >
                                            <FormattedMessage
                                                id="dextinity.pages.pages.documentHasBeenArchived"
                                                defaultMessage="This document has been archived and can no longer be edited"
                                            />
                                        </Alert>
                                    </MainContent>
                                );
                            }

                            const documentType = documentTypes[page.documentType];

                            if (!documentType) {
                                return null;
                            }

                            const EditComponent = documentType.editComponent;

                            return EditComponent ? <EditComponent id={selectedId} category={category} /> : null;
                        }}
                    </StackPage>
                </StackSwitch>
            </Stack>
        </DamScopeProvider>
    );
}
