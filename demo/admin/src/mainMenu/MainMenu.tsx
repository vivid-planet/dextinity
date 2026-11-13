import { gql, useQuery } from "@apollo/client";
import { useContentScope, useContentScopeConfig, useDataGridLabels } from "@dextinity/cms-admin";
import { Chip, ConfirmDialog, DataGrid, type DataGridColumn, EmptyState, Icon, ListDetailLayout, PageHeader, Typography } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";

import { MainMenuItemPanel, type MainMenuItemUnsavedChanges } from "./components/MainMenuItemPanel";
import type { GQLMainMenuQuery, GQLMainMenuQueryVariables } from "./MainMenu.generated";

const mainMenuQuery = gql`
    query MainMenu($contentScope: PageTreeNodeScopeInput!) {
        mainMenu(scope: $contentScope) {
            items {
                node {
                    id
                    name
                    path
                }
                content
            }
        }
    }
`;

type MainMenuItem = GQLMainMenuQuery["mainMenu"]["items"][number];

const selectedParam = "item";

const MainMenu = () => {
    const intl = useIntl();
    const history = useHistory();
    const location = useLocation();
    const { scope } = useContentScope();
    const { labels: dataGridLabels } = useDataGridLabels();
    const [panelUnsavedChanges, setPanelUnsavedChanges] = useState<MainMenuItemUnsavedChanges>();
    const [pendingSelection, setPendingSelection] = useState<{ nodeId: string | null }>();

    useContentScopeConfig({ redirectPathAfterChange: "/project-snips/main-menu" });

    const { data, loading, error } = useQuery<GQLMainMenuQuery, GQLMainMenuQueryVariables>(mainMenuQuery, {
        variables: { contentScope: scope },
    });

    if (error) {
        throw error;
    }

    const items = data?.mainMenu.items ?? [];
    const openNodeId = new URLSearchParams(location.search).get(selectedParam);
    const openItem = items.find((item) => item.node.id === openNodeId);

    const selectItem = (nodeId: string | null) => {
        const params = new URLSearchParams(location.search);
        if (nodeId) {
            params.set(selectedParam, nodeId);
        } else {
            params.delete(selectedParam);
        }
        const search = params.toString();
        history.replace({ pathname: location.pathname, search: search ? `?${search}` : "" });
    };

    const changeSelection = (nodeId: string | null) => {
        if (nodeId === openNodeId) {
            return;
        }
        if (panelUnsavedChanges) {
            setPendingSelection({ nodeId });
        } else {
            selectItem(nodeId);
        }
    };

    const columns: DataGridColumn<MainMenuItem>[] = [
        {
            key: "name",
            header: intl.formatMessage({ id: "mainMenuItems.name", defaultMessage: "Name" }),
            render: (item) => (
                <Typography variant="body" element="span">
                    {item.node.name}
                </Typography>
            ),
        },
        {
            key: "path",
            header: intl.formatMessage({ id: "mainMenuItems.path", defaultMessage: "Path" }),
            render: (item) => (
                <Typography variant="small" element="span">
                    {item.node.path}
                </Typography>
            ),
            priority: "low",
        },
        {
            key: "content",
            header: intl.formatMessage({ id: "mainMenuItems.content", defaultMessage: "Content" }),
            render: (item) =>
                item.content ? (
                    <Chip size="small" color="info" variant="outlined">
                        {intl.formatMessage({ id: "mainMenuItems.content.custom", defaultMessage: "Custom content" })}
                    </Chip>
                ) : (
                    <Chip size="small" color="secondary" variant="outlined">
                        {intl.formatMessage({ id: "mainMenuItems.content.none", defaultMessage: "No content" })}
                    </Chip>
                ),
            align: "end",
        },
    ];

    return (
        <>
            <MainMenuLayout
                open={openNodeId != null}
                onOpenChange={(open) => {
                    if (!open) {
                        // The unsaved changes dialog would otherwise receive the Escape that closes the panel and close right away
                        window.setTimeout(() => changeSelection(null));
                    }
                }}
                sidePanelLabel={
                    openItem
                        ? intl.formatMessage({ id: "mainMenu.panel.label", defaultMessage: "Edit menu item {name}" }, { name: openItem.node.name })
                        : intl.formatMessage({ id: "mainMenu.editMenuItem", defaultMessage: "Edit menu item" })
                }
                header={
                    <PageHeader
                        eyebrow={intl.formatMessage({ id: "mainMenu.eyebrow", defaultMessage: "Project snips" })}
                        title={intl.formatMessage({ id: "mainMenu.title", defaultMessage: "Main menu" })}
                        subtitle={
                            data
                                ? intl.formatMessage(
                                      {
                                          id: "mainMenu.subtitle",
                                          defaultMessage: "{count, plural, one {# menu item} other {# menu items}}, one for each top-level page",
                                      },
                                      { count: items.length },
                                  )
                                : undefined
                        }
                    />
                }
                sidePanel={
                    openNodeId != null && (
                        <MainMenuItemPanel
                            key={openNodeId}
                            pageTreeNodeId={openNodeId}
                            onClose={() => changeSelection(null)}
                            onUnsavedChangesChange={setPanelUnsavedChanges}
                        />
                    )
                }
            >
                <DataGrid
                    aria-label={intl.formatMessage({ id: "mainMenu.menuItems", defaultMessage: "Menu items" })}
                    columns={columns}
                    rows={items}
                    getRowId={(item) => item.node.id}
                    onRowClick={(item) => changeSelection(item.node.id)}
                    activeRowId={openNodeId ?? undefined}
                    loading={loading && !data}
                    labels={dataGridLabels}
                    emptyState={
                        <EmptyState
                            icon={<Icon name="sitemap" />}
                            title={intl.formatMessage({ id: "mainMenu.empty.title", defaultMessage: "No menu items" })}
                            description={intl.formatMessage({
                                id: "mainMenu.empty.description",
                                defaultMessage: "Each top-level page of the page tree becomes a menu item.",
                            })}
                        />
                    }
                />
            </MainMenuLayout>
            <ConfirmDialog
                open={pendingSelection != null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingSelection(undefined);
                    }
                }}
                title={intl.formatMessage({ id: "mainMenu.unsavedChanges.title", defaultMessage: "Discard your changes?" })}
                description={intl.formatMessage({
                    id: "mainMenu.unsavedChanges.description",
                    defaultMessage: "The menu item has unsaved changes. Save them first, or discard them.",
                })}
                confirmLabel={intl.formatMessage({ id: "mainMenu.unsavedChanges.discard", defaultMessage: "Discard changes" })}
                confirmIcon={<Icon name="trash" />}
                tone="danger"
                onConfirm={() => {
                    panelUnsavedChanges?.discard();
                    setPanelUnsavedChanges(undefined);
                    if (pendingSelection) {
                        selectItem(pendingSelection.nodeId);
                    }
                    setPendingSelection(undefined);
                }}
                labels={{ cancel: intl.formatMessage({ id: "mainMenu.unsavedChanges.cancel", defaultMessage: "Keep editing" }) }}
            />
        </>
    );
};

const MainMenuLayout = styled(ListDetailLayout)`
    --dextinity-list-detail-layout-panel-width: minmax(380px, 520px);
`;

export default MainMenu;
