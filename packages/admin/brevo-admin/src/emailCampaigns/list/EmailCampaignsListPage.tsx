import { useApolloClient, useQuery } from "@apollo/client";
import {
    type BlockInterface,
    type ContentScope,
    remoteListFilterParam,
    toGqlSort,
    useDataGridLabels,
    useRemoteListPagination,
    useRemoteListState,
    useRouterLinkClick,
} from "@dextinity/cms-admin";
import {
    Button,
    ConfirmDialog,
    DataGrid,
    type DataGridColumn,
    EmptyState,
    FilterBar,
    FilterChip,
    Icon,
    IconButton,
    ListLayout,
    Menu,
    MenuItem,
    MenuSeparator,
    type NewToast,
    PageHeader,
} from "@dextinity/ui";
import { useState } from "react";
import { FormattedDate, useIntl } from "react-intl";
import { useHistory } from "react-router";

import type { GQLEmailCampaignFilter, GQLEmailCampaignSortField, GQLSendingState } from "../../graphql.generated";
import { hasEmailCampaignStatistics, isEmailCampaignEditable } from "../common/emailCampaignActions";
import { EmailCampaignSendingState, sendingStateMessages, sendingStates, sendingStateStatus } from "../common/EmailCampaignSendingState";
import {
    deleteEmailCampaignMutation,
    duplicateEmailCampaignMutation,
    emailCampaignContentQuery,
    emailCampaignsListQuery,
} from "./EmailCampaignsListPage.gql";
import type {
    GQLDeleteEmailCampaignMutation,
    GQLDeleteEmailCampaignMutationVariables,
    GQLDuplicateEmailCampaignMutation,
    GQLDuplicateEmailCampaignMutationVariables,
    GQLEmailCampaignContentQuery,
    GQLEmailCampaignContentQueryVariables,
    GQLEmailCampaignsListFragment,
    GQLEmailCampaignsListQuery,
    GQLEmailCampaignsListQueryVariables,
} from "./EmailCampaignsListPage.gql.generated";
import { Muted, SecondaryText, Title, TitleCell } from "./EmailCampaignsListPage.sc";

const emailCampaignsListFilters = {
    sendingState: remoteListFilterParam.oneOf(sendingStates),
};

const sortableEmailCampaignColumns: GQLEmailCampaignSortField[] = ["title", "scheduledAt", "updatedAt"];

const defaultEmailCampaignsSort = { key: "updatedAt", direction: "desc" } as const;

interface EmailCampaignsListPageProps {
    baseUrl: string;
    scope: ContentScope;
    scopeLabel: string;
    addToast: (toast: NewToast) => void;
    EmailCampaignContentBlock: BlockInterface;
}

export function EmailCampaignsListPage({ baseUrl, scope, scopeLabel, addToast, EmailCampaignContentBlock }: EmailCampaignsListPageProps) {
    const intl = useIntl();
    const history = useHistory();
    const client = useApolloClient();
    const navigateWithRouter = useRouterLinkClick();
    const { labels: dataGridLabels } = useDataGridLabels();
    const [campaignToDelete, setCampaignToDelete] = useState<GQLEmailCampaignsListFragment>();
    const [deleting, setDeleting] = useState(false);
    const listState = useRemoteListState({
        filters: emailCampaignsListFilters,
        sortableColumns: sortableEmailCampaignColumns,
        defaultSort: defaultEmailCampaignsSort,
        pageSizeStorageKey: "dextinity-email-campaigns-page-size",
    });
    const { filters } = listState;

    const filter: GQLEmailCampaignFilter | undefined = filters.sendingState ? { sendingState: { equal: filters.sendingState } } : undefined;
    const { data, previousData, loading, error, refetch } = useQuery<GQLEmailCampaignsListQuery, GQLEmailCampaignsListQueryVariables>(
        emailCampaignsListQuery,
        {
            fetchPolicy: "cache-and-network",
            variables: {
                scope,
                offset: listState.offset,
                limit: listState.limit,
                sort: toGqlSort<GQLEmailCampaignSortField>(listState.sort),
                search: listState.search || undefined,
                filter,
            },
        },
    );
    const shownData = data ?? previousData;
    const total = shownData?.brevoEmailCampaigns.totalCount;
    const pagination = useRemoteListPagination(listState, total);

    if (error) {
        throw error;
    }

    const getEditUrl = (campaign: GQLEmailCampaignsListFragment) => `${baseUrl}/${campaign.id}/edit`;
    const getViewUrl = (campaign: GQLEmailCampaignsListFragment) => `${baseUrl}/${campaign.id}/view`;
    const getStatisticsUrl = (campaign: GQLEmailCampaignsListFragment) => `${baseUrl}/${campaign.id}/statistics`;
    const getOpenUrl = (campaign: GQLEmailCampaignsListFragment) =>
        isEmailCampaignEditable(campaign)
            ? getEditUrl(campaign)
            : hasEmailCampaignStatistics(campaign)
              ? getStatisticsUrl(campaign)
              : getViewUrl(campaign);

    const duplicate = async (campaign: GQLEmailCampaignsListFragment) => {
        try {
            const { data: contentData } = await client.query<GQLEmailCampaignContentQuery, GQLEmailCampaignContentQueryVariables>({
                query: emailCampaignContentQuery,
                variables: { id: campaign.id },
                fetchPolicy: "network-only",
            });
            const { data: duplicateData } = await client.mutate<GQLDuplicateEmailCampaignMutation, GQLDuplicateEmailCampaignMutationVariables>({
                mutation: duplicateEmailCampaignMutation,
                variables: {
                    scope,
                    input: {
                        title: intl.formatMessage(
                            { id: "dextinity.emailCampaigns.duplicateTitle", defaultMessage: "{title} (copy)" },
                            { title: campaign.title },
                        ),
                        subject: campaign.subject,
                        content: EmailCampaignContentBlock.state2Output(
                            EmailCampaignContentBlock.input2State(contentData.brevoEmailCampaign.content),
                        ),
                        brevoTargetGroups: campaign.brevoTargetGroups.map((targetGroup) => targetGroup.id),
                    },
                },
            });
            await refetch();
            const duplicateId = duplicateData?.createBrevoEmailCampaign.id;
            addToast({
                tone: "success",
                message: intl.formatMessage({ id: "dextinity.emailCampaigns.duplicated", defaultMessage: "Campaign duplicated as a draft" }),
                action: duplicateId
                    ? {
                          label: intl.formatMessage({ id: "dextinity.emailCampaigns.openDuplicate", defaultMessage: "Open" }),
                          onClick: () => history.push(`${baseUrl}/${duplicateId}/edit`),
                      }
                    : undefined,
            });
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({
                    id: "dextinity.emailCampaigns.duplicateFailed",
                    defaultMessage: "The campaign couldn't be duplicated",
                }),
            });
        }
    };

    const deleteCampaign = async () => {
        if (campaignToDelete == null) {
            return;
        }
        setDeleting(true);
        try {
            await client.mutate<GQLDeleteEmailCampaignMutation, GQLDeleteEmailCampaignMutationVariables>({
                mutation: deleteEmailCampaignMutation,
                variables: { id: campaignToDelete.id },
                update: (cache) => cache.evict({ id: cache.identify({ __typename: "BrevoEmailCampaign", id: campaignToDelete.id }) }),
            });
            await refetch();
            addToast({
                tone: "success",
                message: intl.formatMessage(
                    { id: "dextinity.emailCampaigns.deleted", defaultMessage: "“{title}” deleted" },
                    { title: campaignToDelete.title },
                ),
            });
            setCampaignToDelete(undefined);
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({ id: "dextinity.emailCampaigns.deleteFailed", defaultMessage: "The campaign couldn't be deleted" }),
            });
        } finally {
            setDeleting(false);
        }
    };

    const columns: DataGridColumn<GQLEmailCampaignsListFragment>[] = [
        {
            key: "title",
            header: intl.formatMessage({ id: "dextinity.emailCampaigns.title", defaultMessage: "Title" }),
            sortable: true,
            render: (campaign) => (
                <TitleCell>
                    <Title>{campaign.title}</Title>
                    <SecondaryText>{campaign.subject}</SecondaryText>
                </TitleCell>
            ),
        },
        {
            key: "sendingState",
            header: intl.formatMessage({ id: "dextinity.emailCampaigns.sendingState", defaultMessage: "Status" }),
            width: 140,
            render: (campaign) => <EmailCampaignSendingState sendingState={campaign.sendingState} />,
        },
        {
            key: "brevoTargetGroups",
            header: intl.formatMessage({ id: "dextinity.emailCampaigns.targetGroups", defaultMessage: "Target groups" }),
            width: 220,
            priority: "low",
            render: (campaign) =>
                campaign.brevoTargetGroups.length > 0 ? (
                    <SecondaryText>{campaign.brevoTargetGroups.map((targetGroup) => targetGroup.title).join(", ")}</SecondaryText>
                ) : (
                    <Muted>{intl.formatMessage({ id: "dextinity.emailCampaigns.noTargetGroups", defaultMessage: "None yet" })}</Muted>
                ),
        },
        {
            key: "scheduledAt",
            header: intl.formatMessage({ id: "dextinity.emailCampaigns.scheduledFor", defaultMessage: "Scheduled for" }),
            sortable: true,
            width: 180,
            priority: "low",
            render: (campaign) =>
                campaign.scheduledAt ? (
                    <SecondaryText>
                        <FormattedDate value={campaign.scheduledAt} dateStyle="medium" timeStyle="short" />
                    </SecondaryText>
                ) : (
                    <Muted>–</Muted>
                ),
        },
        {
            key: "updatedAt",
            header: intl.formatMessage({ id: "dextinity.emailCampaigns.updatedAt", defaultMessage: "Last changed" }),
            sortable: true,
            width: 180,
            priority: "low",
            render: (campaign) => (
                <SecondaryText>
                    <FormattedDate value={campaign.updatedAt} dateStyle="medium" timeStyle="short" />
                </SecondaryText>
            ),
        },
    ];

    const counts: Record<GQLSendingState | "all", number | undefined> = {
        all: shownData?.allEmailCampaigns.totalCount,
        DRAFT: shownData?.draftEmailCampaigns.totalCount,
        SCHEDULED: shownData?.scheduledEmailCampaigns.totalCount,
        SENT: shownData?.sentEmailCampaigns.totalCount,
    };
    const title = intl.formatMessage({ id: "dextinity.emailCampaigns.emailCampaigns", defaultMessage: "Email campaigns" });

    return (
        <>
            <ListLayout
                header={
                    <PageHeader
                        eyebrow={[intl.formatMessage({ id: "dextinity.emailCampaigns.eyebrow", defaultMessage: "Newsletter" }), scopeLabel]
                            .filter(Boolean)
                            .join(" · ")}
                        title={title}
                        actions={
                            <Button href={`${baseUrl}/add`} onClick={navigateWithRouter} startIcon={<Icon name="add" />}>
                                {intl.formatMessage({ id: "dextinity.emailCampaign.newEmailCampaign", defaultMessage: "New email campaign" })}
                            </Button>
                        }
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={listState.searchInput}
                        onSearchChange={listState.setSearchInput}
                        resultCount={total}
                        labels={{
                            search: intl.formatMessage({ id: "dextinity.emailCampaigns.search", defaultMessage: "Search email campaigns" }),
                            searchPlaceholder: intl.formatMessage({
                                id: "dextinity.emailCampaigns.searchPlaceholder",
                                defaultMessage: "Search title or subject",
                            }),
                            filters: intl.formatMessage({ id: "dextinity.emailCampaigns.filters", defaultMessage: "Filters" }),
                            resultCount: (count) =>
                                intl.formatMessage(
                                    {
                                        id: "dextinity.emailCampaigns.resultCount",
                                        defaultMessage: "{count, plural, one {# campaign} other {# campaigns}}",
                                    },
                                    { count },
                                ),
                        }}
                    >
                        <FilterChip
                            selected={filters.sendingState === null}
                            onClick={() => listState.setFilter("sendingState", null)}
                            count={counts.all}
                        >
                            {intl.formatMessage({ id: "dextinity.emailCampaigns.filter.all", defaultMessage: "All" })}
                        </FilterChip>
                        {sendingStates.map((sendingState) => (
                            <FilterChip
                                key={sendingState}
                                selected={filters.sendingState === sendingState}
                                onClick={() => listState.setFilter("sendingState", sendingState)}
                                count={counts[sendingState]}
                                status={sendingStateStatus[sendingState]}
                            >
                                {intl.formatMessage(sendingStateMessages[sendingState])}
                            </FilterChip>
                        ))}
                    </FilterBar>
                }
            >
                <DataGrid
                    aria-label={title}
                    columns={columns}
                    rows={shownData?.brevoEmailCampaigns.nodes ?? []}
                    getRowId={(campaign) => campaign.id}
                    loading={loading && !shownData}
                    loadingRowCount={listState.pageSize}
                    sort={listState.sort}
                    onSortChange={listState.setSort}
                    onRowClick={(campaign) => history.push(getOpenUrl(campaign))}
                    rowActions={(campaign) => (
                        <EmailCampaignRowMenu
                            campaign={campaign}
                            onOpen={(url) => history.push(url)}
                            editUrl={isEmailCampaignEditable(campaign) ? getEditUrl(campaign) : undefined}
                            viewUrl={isEmailCampaignEditable(campaign) ? undefined : getViewUrl(campaign)}
                            statisticsUrl={hasEmailCampaignStatistics(campaign) ? getStatisticsUrl(campaign) : undefined}
                            onDuplicate={() => void duplicate(campaign)}
                            onDelete={() => setCampaignToDelete(campaign)}
                        />
                    )}
                    pagination={pagination}
                    labels={dataGridLabels}
                    emptyState={
                        listState.isFiltered ? (
                            <EmptyState
                                icon={<Icon name="search" />}
                                title={intl.formatMessage({
                                    id: "dextinity.emailCampaigns.noMatches",
                                    defaultMessage: "No campaigns match the search or filter",
                                })}
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" onClick={listState.resetFilters}>
                                        {intl.formatMessage({ id: "dextinity.emailCampaigns.showAll", defaultMessage: "Show all" })}
                                    </Button>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={<Icon name="newsletter" />}
                                title={intl.formatMessage({ id: "dextinity.emailCampaigns.empty", defaultMessage: "No email campaigns yet" })}
                                description={intl.formatMessage({
                                    id: "dextinity.emailCampaigns.emptyDescription",
                                    defaultMessage: "Write a campaign with blocks, choose its target groups, then send or schedule it.",
                                })}
                                actions={
                                    <Button href={`${baseUrl}/add`} onClick={navigateWithRouter} size="small" startIcon={<Icon name="add" />}>
                                        {intl.formatMessage({ id: "dextinity.emailCampaign.newEmailCampaign", defaultMessage: "New email campaign" })}
                                    </Button>
                                }
                            />
                        )
                    }
                />
            </ListLayout>
            <ConfirmDialog
                open={campaignToDelete != null}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setCampaignToDelete(undefined);
                    }
                }}
                tone="danger"
                title={intl.formatMessage(
                    { id: "dextinity.emailCampaigns.deleteDialog.title", defaultMessage: "Delete “{title}”?" },
                    { title: campaignToDelete?.title },
                )}
                description={intl.formatMessage({
                    id: "dextinity.emailCampaigns.deleteDialog.description",
                    defaultMessage: "The campaign and its content are removed. This can't be undone.",
                })}
                confirmLabel={intl.formatMessage({ id: "dextinity.emailCampaigns.delete", defaultMessage: "Delete" })}
                confirmIcon={<Icon name="delete" />}
                onConfirm={() => void deleteCampaign()}
                loading={deleting}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.emailCampaigns.cancel", defaultMessage: "Cancel" }) }}
            />
        </>
    );
}

interface EmailCampaignRowMenuProps {
    campaign: GQLEmailCampaignsListFragment;
    onOpen: (url: string) => void;
    editUrl?: string;
    viewUrl?: string;
    statisticsUrl?: string;
    onDuplicate: () => void;
    onDelete: () => void;
}

function EmailCampaignRowMenu({ campaign, onOpen, editUrl, viewUrl, statisticsUrl, onDuplicate, onDelete }: EmailCampaignRowMenuProps) {
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <IconButton
                    aria-label={intl.formatMessage(
                        { id: "dextinity.emailCampaigns.rowActions", defaultMessage: "Actions for {title}" },
                        { title: campaign.title },
                    )}
                    size="small"
                    variant="text"
                    color="secondary"
                >
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            {editUrl != null && (
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.emailCampaigns.edit", defaultMessage: "Edit" })}
                    icon={<Icon name="edit" />}
                    onClick={() => onOpen(editUrl)}
                />
            )}
            {viewUrl != null && (
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.emailCampaigns.view", defaultMessage: "View" })}
                    icon={<Icon name="visible" />}
                    onClick={() => onOpen(viewUrl)}
                />
            )}
            {statisticsUrl != null && (
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.emailCampaigns.statistics", defaultMessage: "Statistics" })}
                    icon={<Icon name="statistics" />}
                    onClick={() => onOpen(statisticsUrl)}
                />
            )}
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.emailCampaigns.duplicate", defaultMessage: "Duplicate" })}
                icon={<Icon name="duplicate" />}
                onClick={onDuplicate}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.emailCampaigns.delete", defaultMessage: "Delete" })}
                icon={<Icon name="delete" />}
                color="error"
                disabled={campaign.brevoId != null}
                disabledReason={intl.formatMessage({
                    id: "dextinity.emailCampaigns.deleteDisabled",
                    defaultMessage: "Campaigns already handed over to Brevo can't be deleted",
                })}
                onClick={onDelete}
            />
        </Menu>
    );
}
