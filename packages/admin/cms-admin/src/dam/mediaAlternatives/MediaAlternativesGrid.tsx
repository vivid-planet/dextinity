import { gql, useMutation, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import {
    Button,
    ConfirmDialog,
    DataGrid,
    type DataGridColumn,
    EmptyState,
    FilterBar,
    Icon,
    IconButton,
    ToastViewport,
    useToasts,
} from "@dextinity/ui";
import { useState } from "react";
import { useIntl } from "react-intl";

import { toGqlSort } from "../../dataGrid/remoteList/toGqlSort";
import { useDataGridLabels } from "../../dataGrid/remoteList/useDataGridLabels";
import { useRemoteListPagination } from "../../dataGrid/remoteList/useRemoteListPagination";
import { useRemoteListState } from "../../dataGrid/remoteList/useRemoteListState";
import type { GQLDamMediaAlternativeSortField, GQLDamMediaAlternativeType } from "../../graphql.generated";
import { VideoPreviewCaptionsQueryName } from "../FileForm/previews/VideoPreview";
import { MediaAlternativeDialog } from "./MediaAlternativeDialog";
import type {
    GQLDamMediaAlternativeGridFragment,
    GQLDamMediaAlternativesQuery,
    GQLDamMediaAlternativesQueryVariables,
    GQLDeleteDamMediaAlternativeMutation,
    GQLDeleteDamMediaAlternativeMutationVariables,
} from "./MediaAlternativesGrid.generated";
import { GridRoot, Name, NameCell, SecondaryText } from "./MediaAlternativesGrid.sc";

const damMediaAlternativeFragment = gql`
    fragment DamMediaAlternativeGrid on DamMediaAlternative {
        id
        language
        type
        for {
            id
            name
            damPath
        }
        alternative {
            id
            name
            damPath
        }
    }
`;

const damMediaAlternativesQuery = gql`
    query DamMediaAlternatives(
        $offset: Int!
        $limit: Int!
        $sort: [DamMediaAlternativeSort!]
        $search: String
        $for: ID
        $alternative: ID
        $type: DamMediaAlternativeType
    ) {
        damMediaAlternatives(offset: $offset, limit: $limit, sort: $sort, search: $search, for: $for, alternative: $alternative, type: $type) {
            nodes {
                ...DamMediaAlternativeGrid
            }
            totalCount
        }
    }
    ${damMediaAlternativeFragment}
`;

const deleteDamMediaAlternativeMutation = gql`
    mutation DeleteDamMediaAlternative($id: ID!) {
        deleteDamMediaAlternative(id: $id)
    }
`;

const refetchQueries = ["DamMediaAlternatives", VideoPreviewCaptionsQueryName];

/**
 * `for`: the file is the original, e.g. a video, and the list shows its alternatives, e.g. captions. `alternative`: the file is the
 * alternative and the list shows the originals it's used for.
 */
export type MediaAlternativeDirection = "for" | "alternative";

const sortableColumns = ["file", "language"];

interface MediaAlternativesGridProps {
    file: { id: string };
    type: GQLDamMediaAlternativeType;
    direction: MediaAlternativeDirection;
}

export function MediaAlternativesGrid({ file, type, direction }: MediaAlternativesGridProps) {
    const intl = useIntl();
    const { labels: dataGridLabels } = useDataGridLabels();
    const listState = useRemoteListState({ queryParamsPrefix: `mediaAlternatives_${direction}`, sortableColumns, defaultPageSize: 10 });
    const [dialog, setDialog] = useState<{ id?: string }>();
    const [deleteCandidate, setDeleteCandidate] = useState<GQLDamMediaAlternativeGridFragment>();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const isOtherFileTheAlternative = direction === "for";
    const getOtherFile = (mediaAlternative: GQLDamMediaAlternativeGridFragment) =>
        isOtherFileTheAlternative ? mediaAlternative.alternative : mediaAlternative.for;

    const { data, previousData, loading, error } = useQuery<GQLDamMediaAlternativesQuery, GQLDamMediaAlternativesQueryVariables>(
        damMediaAlternativesQuery,
        {
            variables: {
                search: listState.search || undefined,
                offset: listState.offset,
                limit: listState.limit,
                sort: toGqlSort<GQLDamMediaAlternativeSortField>(listState.sort, (columnKey) =>
                    columnKey === "file" ? (direction === "for" ? "alternative" : "for") : "language",
                ),
                for: isOtherFileTheAlternative ? file.id : undefined,
                alternative: isOtherFileTheAlternative ? undefined : file.id,
                type,
            },
        },
    );
    const [deleteMediaAlternative, { loading: deleting }] = useMutation<
        GQLDeleteDamMediaAlternativeMutation,
        GQLDeleteDamMediaAlternativeMutationVariables
    >(deleteDamMediaAlternativeMutation, { refetchQueries });
    const page = (data ?? previousData)?.damMediaAlternatives;
    const pagination = useRemoteListPagination(listState, page?.totalCount);

    if (error) {
        throw error;
    }

    const columns: DataGridColumn<GQLDamMediaAlternativeGridFragment>[] = [
        {
            key: "file",
            header: intl.formatMessage({ id: "dextinity.damMediaAlternatives.title", defaultMessage: "File" }),
            sortable: true,
            render: (mediaAlternative) => (
                <NameCell>
                    <Name>{getOtherFile(mediaAlternative).name}</Name>
                    {getOtherFile(mediaAlternative).damPath !== "/" && <SecondaryText>{getOtherFile(mediaAlternative).damPath}</SecondaryText>}
                </NameCell>
            ),
        },
        {
            key: "language",
            header: intl.formatMessage({ id: "dextinity.damMediaAlternatives.language", defaultMessage: "Language" }),
            sortable: true,
            width: 140,
            render: (mediaAlternative) => mediaAlternative.language,
        },
    ];

    const addLabel = isOtherFileTheAlternative
        ? intl.formatMessage({ id: "dextinity.damMediaAlternatives.addCaptions", defaultMessage: "Add captions" })
        : intl.formatMessage({ id: "dextinity.damMediaAlternatives.addVideo", defaultMessage: "Use for a video" });

    const confirmDelete = async () => {
        if (!deleteCandidate) {
            return;
        }
        try {
            await deleteMediaAlternative({ variables: { id: deleteCandidate.id }, context: LocalErrorScopeApolloContext });
            setDeleteCandidate(undefined);
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({ id: "dextinity.damMediaAlternatives.deleteFailed", defaultMessage: "Removing failed" }),
            });
        }
    };

    return (
        <GridRoot>
            <FilterBar
                searchValue={listState.searchInput}
                onSearchChange={listState.setSearchInput}
                searchShortcut={false}
                resultCount={page?.totalCount}
                labels={{
                    search: intl.formatMessage({ id: "dextinity.damMediaAlternatives.search", defaultMessage: "Search" }),
                    searchPlaceholder: intl.formatMessage({ id: "dextinity.damMediaAlternatives.searchPlaceholder", defaultMessage: "Search file" }),
                    filters: intl.formatMessage({ id: "dextinity.damMediaAlternatives.filters", defaultMessage: "Filters" }),
                    resultCount: (count) =>
                        intl.formatMessage(
                            { id: "dextinity.damMediaAlternatives.resultCount", defaultMessage: "{count, plural, one {# result} other {# results}}" },
                            { count },
                        ),
                }}
                actions={
                    <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="add" />} onClick={() => setDialog({})}>
                        {addLabel}
                    </Button>
                }
            />
            <DataGrid
                aria-label={intl.formatMessage({ id: "dextinity.dam.file.mediaAlternatives.tabTitle", defaultMessage: "Media alternatives" })}
                columns={columns}
                rows={page?.nodes ?? []}
                getRowId={(mediaAlternative) => mediaAlternative.id}
                loading={loading && !page}
                loadingRowCount={2}
                sort={listState.sort}
                onSortChange={listState.setSort}
                onRowClick={(mediaAlternative) => setDialog({ id: mediaAlternative.id })}
                rowActions={(mediaAlternative) => (
                    <>
                        <IconButton
                            aria-label={intl.formatMessage({ id: "dextinity.damMediaAlternatives.edit", defaultMessage: "Edit" })}
                            variant="text"
                            color="secondary"
                            size="small"
                            onClick={() => setDialog({ id: mediaAlternative.id })}
                        >
                            <Icon name="edit" />
                        </IconButton>
                        <IconButton
                            aria-label={intl.formatMessage({ id: "dextinity.damMediaAlternatives.remove", defaultMessage: "Remove" })}
                            variant="text"
                            color="secondary"
                            size="small"
                            onClick={() => setDeleteCandidate(mediaAlternative)}
                        >
                            <Icon name="delete" />
                        </IconButton>
                    </>
                )}
                pagination={pagination}
                labels={dataGridLabels}
                emptyState={
                    listState.search !== "" ? (
                        <EmptyState
                            icon={<Icon name="search" />}
                            title={intl.formatMessage({
                                id: "dextinity.damMediaAlternatives.noMatches",
                                defaultMessage: "Nothing matches the search",
                            })}
                        />
                    ) : (
                        <EmptyState
                            icon={<Icon name={isOtherFileTheAlternative ? "language" : "video"} />}
                            title={
                                isOtherFileTheAlternative
                                    ? intl.formatMessage({ id: "dextinity.damMediaAlternatives.noCaptions", defaultMessage: "No captions yet" })
                                    : intl.formatMessage({
                                          id: "dextinity.damMediaAlternatives.noVideos",
                                          defaultMessage: "Not used for a video yet",
                                      })
                            }
                        />
                    )
                }
            />
            {dialog && (
                <MediaAlternativeDialog
                    id={dialog.id}
                    fileId={file.id}
                    type={type}
                    direction={direction}
                    refetchQueries={refetchQueries}
                    onClose={() => setDialog(undefined)}
                />
            )}
            <ConfirmDialog
                open={deleteCandidate !== undefined}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setDeleteCandidate(undefined);
                    }
                }}
                tone="danger"
                title={intl.formatMessage(
                    { id: "dextinity.damMediaAlternatives.removeDialog.title", defaultMessage: "Remove “{name}”?" },
                    { name: deleteCandidate ? getOtherFile(deleteCandidate).name : "" },
                )}
                description={intl.formatMessage({
                    id: "dextinity.damMediaAlternatives.removeDialog.description",
                    defaultMessage: "Only the link between the files is removed; both files stay in the DAM.",
                })}
                confirmLabel={intl.formatMessage({ id: "dextinity.damMediaAlternatives.remove", defaultMessage: "Remove" })}
                confirmIcon={<Icon name="delete" />}
                onConfirm={() => void confirmDelete()}
                loading={deleting}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.generic.cancel", defaultMessage: "Cancel" }) }}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.damMediaAlternatives.notifications", defaultMessage: "Notifications" }) }}
            />
        </GridRoot>
    );
}
