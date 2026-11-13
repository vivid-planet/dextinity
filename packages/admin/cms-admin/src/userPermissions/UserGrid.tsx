import { gql, useQuery } from "@apollo/client";
import {
    Avatar,
    Button,
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
    MenuRadioGroup,
    MenuRadioItem,
    PageHeader,
} from "@dextinity/ui";
import { type ReactNode, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory, useRouteMatch } from "react-router";

import { DataGridRowActions } from "../dataGrid/dataGridCells";
import { remoteListFilterParam } from "../dataGrid/remoteList/remoteListFilterParams";
import { toGqlSort } from "../dataGrid/remoteList/toGqlSort";
import { useDataGridLabels } from "../dataGrid/remoteList/useDataGridLabels";
import { useRemoteListPagination } from "../dataGrid/remoteList/useRemoteListPagination";
import { useRemoteListState } from "../dataGrid/remoteList/useRemoteListState";
import type { GQLPermission, GQLUserPermissionsUserFilter, GQLUserPermissionsUserSortField } from "../graphql.generated";
import { useUserPermissionCheck } from "./hooks/currentUser";
import { ImpersonateMenuItem } from "./ImpersonateMenuItem";
import type { GQLUserForGridFragment, GQLUserGridAvailablePermissionsQuery, GQLUserGridQuery, GQLUserGridQueryVariables } from "./UserGrid.generated";
import { UserNameCell } from "./UserGrid.sc";
import { camelCaseToHumanReadable } from "./utils/camelCaseToHumanReadable";

const userGridQuery = gql`
    query UserGrid($offset: Int!, $limit: Int!, $filter: UserPermissionsUserFilter, $sort: [UserPermissionsUserSort!], $search: String) {
        users: userPermissionsUsers(offset: $offset, limit: $limit, filter: $filter, sort: $sort, search: $search) {
            nodes {
                ...UserForGrid
            }
            totalCount
        }
    }
    fragment UserForGrid on UserPermissionsUser {
        id
        name
        email
    }
`;

const availablePermissionsQuery = gql`
    query UserGridAvailablePermissions {
        availablePermissions: userPermissionsAvailablePermissions
    }
`;

const userListFilters = {
    permission: remoteListFilterParam.string(),
};

const sortableUserColumns: GQLUserPermissionsUserSortField[] = ["name", "email"];

const defaultUserSort = { key: "name", direction: "asc" } as const;

interface UserPermissionsUserGridProps {
    /** Actions in the page header, e.g. a link to the identity provider. */
    toolbarAction?: ReactNode;
    /** Replaces the actions at the end of a row: by default, a menu to edit and impersonate the user. */
    rowAction?: (user: GQLUserForGridFragment) => ReactNode;
    /** Called on a click on a user; by default, the user's page opens at `<current URL>/<id>/edit`. */
    onRowClick?: (user: GQLUserForGridFragment) => void;
}

/**
 * The list of users with search, a filter by permission, and sorting, built with the `ListLayout` and `DataGrid` of `@dextinity/ui`.
 */
export const UserPermissionsUserGrid = ({ toolbarAction, rowAction, onRowClick }: UserPermissionsUserGridProps) => {
    const intl = useIntl();
    const history = useHistory();
    const routeMatch = useRouteMatch();
    const { labels: dataGridLabels } = useDataGridLabels();
    const listState = useRemoteListState({
        filters: userListFilters,
        sortableColumns: sortableUserColumns,
        defaultSort: defaultUserSort,
        pageSizeStorageKey: "dextinity-user-permissions-page-size",
    });
    const { search, filters } = listState;
    const [permissionMenuOpen, setPermissionMenuOpen] = useState(false);
    const isAllowed = useUserPermissionCheck();

    // The list is also open to users who may only impersonate, but only the userPermissions permission may read the permissions
    const { data: availablePermissionsData } = useQuery<GQLUserGridAvailablePermissionsQuery>(availablePermissionsQuery, {
        skip: !isAllowed("userPermissions"),
    });
    const permissionOptions = (availablePermissionsData?.availablePermissions ?? []).map((permission) => ({
        value: permission,
        label: camelCaseToHumanReadable(permission),
    }));

    const filter: GQLUserPermissionsUserFilter | undefined = filters.permission
        ? { and: [{ permission: { equal: filters.permission as GQLPermission } }] }
        : undefined;

    const { data, previousData, loading, error } = useQuery<GQLUserGridQuery, GQLUserGridQueryVariables>(userGridQuery, {
        fetchPolicy: "cache-and-network",
        variables: {
            offset: listState.offset,
            limit: listState.limit,
            sort: toGqlSort<GQLUserPermissionsUserSortField>(listState.sort),
            search: search || undefined,
            filter,
        },
    });
    const shownData = data ?? previousData;
    const total = shownData?.users.totalCount;
    const pagination = useRemoteListPagination(listState, total);

    if (error) {
        throw error;
    }

    const getUserUrl = (user: GQLUserForGridFragment) => `${routeMatch.url}/${user.id}/edit`;
    const openUser = onRowClick ?? ((user: GQLUserForGridFragment) => history.push(getUserUrl(user)));

    const columns: DataGridColumn<GQLUserForGridFragment>[] = [
        {
            key: "name",
            header: intl.formatMessage({ id: "dextinity.userPermissions.name", defaultMessage: "Name" }),
            sortable: true,
            render: (user) => (
                <UserNameCell>
                    <Avatar name={user.name} size="small" />
                    {user.name}
                </UserNameCell>
            ),
        },
        {
            key: "email",
            header: intl.formatMessage({ id: "dextinity.userPermissions.email", defaultMessage: "E-Mail" }),
            sortable: true,
            render: (user) => user.email,
        },
    ];

    const permissionLabel = intl.formatMessage({ id: "dextinity.userPermissions.permission", defaultMessage: "Permission" });
    const selectedPermission = permissionOptions.find((option) => option.value === filters.permission);
    const title = intl.formatMessage({ id: "dextinity.userPermissions.title", defaultMessage: "User Permissions" });

    return (
        <ListLayout
            header={
                <PageHeader
                    eyebrow={intl.formatMessage({ id: "dextinity.userPermissions.listEyebrow", defaultMessage: "System · Global" })}
                    title={title}
                    subtitle={
                        total !== undefined && !listState.isFiltered
                            ? intl.formatMessage(
                                  { id: "dextinity.userPermissions.userCount", defaultMessage: "{count, plural, one {# user} other {# users}}" },
                                  { count: total },
                              )
                            : undefined
                    }
                    actions={toolbarAction}
                />
            }
            toolbar={
                <FilterBar
                    searchValue={listState.searchInput}
                    onSearchChange={listState.setSearchInput}
                    resultCount={total}
                    labels={{
                        search: intl.formatMessage({ id: "dextinity.userPermissions.search", defaultMessage: "Search users" }),
                        searchPlaceholder: intl.formatMessage({
                            id: "dextinity.userPermissions.searchPlaceholder",
                            defaultMessage: "Search name or e-mail",
                        }),
                        filters: intl.formatMessage({ id: "dextinity.userPermissions.filters", defaultMessage: "Filters" }),
                        resultCount: (count) =>
                            intl.formatMessage(
                                { id: "dextinity.userPermissions.resultCount", defaultMessage: "{count, plural, one {# result} other {# results}}" },
                                { count },
                            ),
                    }}
                >
                    {permissionOptions.length > 0 && (
                        <Menu
                            open={permissionMenuOpen}
                            onOpenChange={setPermissionMenuOpen}
                            trigger={
                                <FilterChip selected={selectedPermission !== undefined} hasMenu onClick={() => undefined}>
                                    {selectedPermission ? `${permissionLabel}: ${selectedPermission.label}` : permissionLabel}
                                </FilterChip>
                            }
                        >
                            <MenuRadioGroup
                                value={filters.permission}
                                onChange={(permission) => {
                                    listState.setFilter("permission", permission);
                                    setPermissionMenuOpen(false);
                                }}
                            >
                                <MenuRadioItem
                                    value=""
                                    label={intl.formatMessage({ id: "dextinity.userPermissions.allPermissions", defaultMessage: "Any permission" })}
                                />
                                {permissionOptions.map((option) => (
                                    <MenuRadioItem key={option.value} value={option.value} label={option.label} />
                                ))}
                            </MenuRadioGroup>
                        </Menu>
                    )}
                </FilterBar>
            }
        >
            <DataGrid
                aria-label={title}
                columns={columns}
                rows={shownData?.users.nodes ?? []}
                getRowId={(user) => user.id}
                loading={loading && !shownData}
                loadingRowCount={listState.pageSize}
                sort={listState.sort}
                onSortChange={listState.setSort}
                onRowClick={openUser}
                rowActions={rowAction ?? ((user) => <UserRowMenu user={user} onEdit={() => openUser(user)} />)}
                pagination={pagination}
                labels={dataGridLabels}
                emptyState={
                    listState.isFiltered ? (
                        <EmptyState
                            icon={<Icon name="search" />}
                            title={intl.formatMessage({ id: "dextinity.userPermissions.noMatches", defaultMessage: "No users match the filters" })}
                            description={intl.formatMessage({
                                id: "dextinity.userPermissions.noMatchesDescription",
                                defaultMessage: "Check the spelling or reset the filters.",
                            })}
                            actions={
                                <Button variant="outlined" color="secondary" size="small" onClick={listState.resetFilters}>
                                    {intl.formatMessage({ id: "dextinity.userPermissions.resetFilters", defaultMessage: "Reset filters" })}
                                </Button>
                            }
                        />
                    ) : (
                        <EmptyState
                            icon={<Icon name="user" />}
                            title={intl.formatMessage({ id: "dextinity.userPermissions.empty", defaultMessage: "No users yet" })}
                            description={intl.formatMessage({
                                id: "dextinity.userPermissions.emptyDescription",
                                defaultMessage: "Users appear here once the identity provider knows them.",
                            })}
                        />
                    )
                }
            />
        </ListLayout>
    );
};

function UserRowMenu({ user, onEdit }: { user: GQLUserForGridFragment; onEdit: () => void }) {
    const intl = useIntl();
    const isAllowed = useUserPermissionCheck();
    const [open, setOpen] = useState(false);

    return (
        <DataGridRowActions>
            <Menu
                open={open}
                onOpenChange={setOpen}
                placement="bottom-end"
                trigger={
                    <IconButton
                        aria-label={intl.formatMessage(
                            { id: "dextinity.userPermissions.rowActions", defaultMessage: "Actions for {name}" },
                            { name: user.name },
                        )}
                        variant="text"
                        color="secondary"
                        size="small"
                    >
                        <Icon name="more-vertical" />
                    </IconButton>
                }
            >
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.userPermissions.editUser", defaultMessage: "Edit" })}
                    icon={<Icon name="edit" />}
                    onClick={onEdit}
                />
                {isAllowed("impersonation") && open && <ImpersonateMenuItem userId={user.id} />}
            </Menu>
        </DataGridRowActions>
    );
}
