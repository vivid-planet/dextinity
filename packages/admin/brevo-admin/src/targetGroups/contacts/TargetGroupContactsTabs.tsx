import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { type ContentScope, useDataGridLabels, useRemoteListPagination, useRemoteListState } from "@dextinity/cms-admin";
import {
    Button,
    ConfirmDialog,
    DataGrid,
    EmptyState,
    FilterBar,
    type FilterBarLabels,
    Icon,
    IconButton,
    Panel,
    Tabs,
    ToastViewport,
    useToasts,
} from "@dextinity/ui";
import { type JSX, useState } from "react";
import { useIntl } from "react-intl";

import type { GQLBrevoContactsListItemFragment } from "../../brevoContacts/brevoContactsListItemFragment.generated";
import { useBrevoContactColumns } from "../../brevoContacts/useBrevoContactColumns";
import { ContactImportDialog } from "../../common/contactImport/ContactImportDialog";
import { AddContactsDialog } from "./AddContactsDialog";
import { assignedContactsQuery, manuallyAddedContactsQuery, removeContactFromTargetGroupMutation } from "./TargetGroupContactsTabs.gql";
import type {
    GQLRemoveBrevoContactFromTargetGroupMutation,
    GQLRemoveBrevoContactFromTargetGroupMutationVariables,
    GQLTargetGroupAssignedContactsQuery,
    GQLTargetGroupAssignedContactsQueryVariables,
    GQLTargetGroupManuallyAddedContactsQuery,
    GQLTargetGroupManuallyAddedContactsQueryVariables,
} from "./TargetGroupContactsTabs.gql.generated";
import { TabContent } from "./TargetGroupContactsTabs.sc";

type ContactsTab = "manuallyAdded" | "assigned";

const refetchedAfterChange = ["TargetGroupManuallyAddedContacts", "TargetGroupForm"];

interface TargetGroupContactsTabsProps {
    targetGroupId: string;
    scope: ContentScope;
    /** Whether Brevo has the list of the contacts added by hand yet. */
    hasManuallyAddedContacts: boolean;
    /** Whether Brevo has the list of all contacts of the target group yet. */
    hasAssignedContacts: boolean;
}

/**
 * The contacts of a target group in two tabs: the contacts added by hand, which can be added, imported and removed, and all contacts
 * the target group reaches, including those its filters assign.
 */
export function TargetGroupContactsTabs({
    targetGroupId,
    scope,
    hasManuallyAddedContacts,
    hasAssignedContacts,
}: TargetGroupContactsTabsProps): JSX.Element {
    const intl = useIntl();
    const [tab, setTab] = useState<ContactsTab>("manuallyAdded");
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();

    return (
        <Panel>
            <Tabs<ContactsTab>
                aria-label={intl.formatMessage({ id: "dextinity.targetGroup.contacts", defaultMessage: "Contacts" })}
                value={tab}
                onChange={setTab}
                items={[
                    {
                        value: "manuallyAdded",
                        label: intl.formatMessage({ id: "dextinity.targetGroup.manuallyAddedContacts", defaultMessage: "Manually added contacts" }),
                        panel: (
                            <ManuallyAddedContacts targetGroupId={targetGroupId} scope={scope} skip={!hasManuallyAddedContacts} onNotify={addToast} />
                        ),
                    },
                    {
                        value: "assigned",
                        label: intl.formatMessage({ id: "dextinity.targetGroup.allAssignedContacts", defaultMessage: "All assigned contacts" }),
                        panel: <AssignedContacts targetGroupId={targetGroupId} scope={scope} skip={!hasAssignedContacts} />,
                    },
                ]}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.targetGroup.notifications", defaultMessage: "Notifications" }) }}
            />
        </Panel>
    );
}

function useSearchLabels(): FilterBarLabels {
    const intl = useIntl();
    return {
        search: intl.formatMessage({ id: "dextinity.targetGroup.contacts.search", defaultMessage: "Search contacts" }),
        searchPlaceholder: intl.formatMessage({ id: "dextinity.targetGroup.assignedContacts.searchEmail", defaultMessage: "Search email address" }),
        filters: intl.formatMessage({ id: "dextinity.targetGroup.contacts.filters", defaultMessage: "Filters" }),
        resultCount: (count) =>
            intl.formatMessage(
                { id: "dextinity.targetGroup.contacts.resultCount", defaultMessage: "{count, plural, one {# contact} other {# contacts}}" },
                { count },
            ),
    };
}

interface ManuallyAddedContactsProps {
    targetGroupId: string;
    scope: ContentScope;
    skip: boolean;
    onNotify: ReturnType<typeof useToasts>["add"];
}

function ManuallyAddedContacts({ targetGroupId, scope, skip, onNotify }: ManuallyAddedContactsProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const { labels: dataGridLabels, bulkActionLabels } = useDataGridLabels();
    const searchLabels = useSearchLabels();
    const listState = useRemoteListState({ queryParamsPrefix: "manual", pageSizeStorageKey: "dextinity-brevo-target-group-contacts-page-size" });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [contactIdsToRemove, setContactIdsToRemove] = useState<string[]>([]);
    const [removing, setRemoving] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const columns = useBrevoContactColumns<GQLBrevoContactsListItemFragment>();

    const { data, previousData, loading, error } = useQuery<
        GQLTargetGroupManuallyAddedContactsQuery,
        GQLTargetGroupManuallyAddedContactsQueryVariables
    >(manuallyAddedContactsQuery, {
        variables: { targetGroupId, email: listState.search || undefined, offset: listState.offset, limit: listState.limit },
        skip,
        context: LocalErrorScopeApolloContext,
        fetchPolicy: "cache-and-network",
    });
    const shownData = data ?? previousData;
    const rows = shownData?.manuallyAssignedBrevoContacts.nodes ?? [];
    const total = shownData?.manuallyAssignedBrevoContacts.totalCount;
    const pagination = useRemoteListPagination(listState, total);

    if (error) {
        throw error;
    }

    const removeContacts = async () => {
        setRemoving(true);
        try {
            for (const contactId of contactIdsToRemove) {
                await client.mutate<GQLRemoveBrevoContactFromTargetGroupMutation, GQLRemoveBrevoContactFromTargetGroupMutationVariables>({
                    mutation: removeContactFromTargetGroupMutation,
                    variables: { id: targetGroupId, input: { brevoContactId: Number(contactId) } },
                    context: LocalErrorScopeApolloContext,
                });
            }
            setSelectedIds((ids) => ids.filter((id) => !contactIdsToRemove.includes(id)));
            onNotify({
                message: intl.formatMessage(
                    {
                        id: "dextinity.targetGroup.contactsRemoved",
                        defaultMessage: "{count, plural, one {# contact} other {# contacts}} removed from the target group",
                    },
                    { count: contactIdsToRemove.length },
                ),
            });
            setContactIdsToRemove([]);
        } catch {
            onNotify({
                tone: "error",
                message: intl.formatMessage({ id: "dextinity.targetGroup.removeFailed", defaultMessage: "Removing the contacts failed" }),
            });
        } finally {
            await client.refetchQueries({ include: refetchedAfterChange });
            setRemoving(false);
        }
    };

    return (
        <TabContent>
            <FilterBar
                searchValue={listState.searchInput}
                onSearchChange={listState.setSearchInput}
                resultCount={total}
                labels={searchLabels}
                actions={
                    <>
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<Icon name="cloud-upload" />}
                            onClick={() => setImportOpen(true)}
                        >
                            {intl.formatMessage({
                                id: "dextinity.targetGroup.assignedContacts.actions.importFromCsv",
                                defaultMessage: "Import from CSV",
                            })}
                        </Button>
                        <Button size="small" startIcon={<Icon name="plus" />} onClick={() => setAddOpen(true)}>
                            {intl.formatMessage({ id: "dextinity.targetGroup.assignedContacts.addContact", defaultMessage: "Add contacts" })}
                        </Button>
                    </>
                }
            />
            <DataGrid
                aria-label={intl.formatMessage({
                    id: "dextinity.targetGroup.manuallyAssignedContacts.title",
                    defaultMessage: "Manually added contacts",
                })}
                columns={columns}
                rows={rows}
                getRowId={(contact) => String(contact.id)}
                loading={loading && !shownData}
                loadingRowCount={5}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                bulkActions={[
                    {
                        label: intl.formatMessage({ id: "dextinity.targetGroup.removeContacts", defaultMessage: "Remove from target group" }),
                        icon: <Icon name="minus-circle" />,
                        color: "error",
                        onClick: () => setContactIdsToRemove(selectedIds),
                    },
                ]}
                bulkActionLabels={bulkActionLabels}
                rowActions={(contact) => (
                    <IconButton
                        aria-label={intl.formatMessage(
                            { id: "dextinity.targetGroup.removeContact", defaultMessage: "Remove {email} from the target group" },
                            { email: contact.email },
                        )}
                        size="small"
                        variant="text"
                        color="secondary"
                        onClick={() => setContactIdsToRemove([String(contact.id)])}
                    >
                        <Icon name="minus-circle" />
                    </IconButton>
                )}
                pagination={pagination}
                labels={dataGridLabels}
                emptyState={
                    <EmptyState
                        icon={<Icon name="contact" />}
                        title={
                            listState.isFiltered
                                ? intl.formatMessage({
                                      id: "dextinity.targetGroup.manualContacts.noMatches",
                                      defaultMessage: "No contacts match the search",
                                  })
                                : intl.formatMessage({
                                      id: "dextinity.targetGroup.manualContacts.empty",
                                      defaultMessage: "No contacts added by hand",
                                  })
                        }
                        description={
                            listState.isFiltered
                                ? undefined
                                : intl.formatMessage({
                                      id: "dextinity.targetGroup.manualContacts.emptyDescription",
                                      defaultMessage: "Add contacts that the filters don't assign, or import them from a CSV file.",
                                  })
                        }
                    />
                }
            />
            <AddContactsDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                targetGroupId={targetGroupId}
                scope={scope}
                onAdded={(count) => {
                    void client.refetchQueries({ include: refetchedAfterChange });
                    onNotify({
                        message: intl.formatMessage(
                            {
                                id: "dextinity.targetGroup.contactsAdded",
                                defaultMessage: "{count, plural, one {# contact} other {# contacts}} added to the target group",
                            },
                            { count },
                        ),
                    });
                }}
            />
            <ContactImportDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                scope={scope}
                targetGroupId={targetGroupId}
                onImported={() => void client.refetchQueries({ include: refetchedAfterChange })}
            />
            <ConfirmDialog
                open={contactIdsToRemove.length > 0}
                onOpenChange={(open) => {
                    if (!open && !removing) {
                        setContactIdsToRemove([]);
                    }
                }}
                tone="danger"
                title={intl.formatMessage(
                    {
                        id: "dextinity.targetGroup.removeDialog.title",
                        defaultMessage: "Remove {count, plural, one {the contact} other {# contacts}} from the target group?",
                    },
                    { count: contactIdsToRemove.length },
                )}
                description={intl.formatMessage({
                    id: "dextinity.targetGroup.removeDialog.description",
                    defaultMessage: "The contacts stay in the target group if its filters assign them.",
                })}
                confirmLabel={intl.formatMessage({ id: "dextinity.targetGroup.removeDialog.confirm", defaultMessage: "Remove" })}
                confirmIcon={<Icon name="minus-circle" />}
                onConfirm={() => void removeContacts()}
                loading={removing}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.targetGroup.removeDialog.cancel", defaultMessage: "Cancel" }) }}
            />
        </TabContent>
    );
}

interface AssignedContactsProps {
    targetGroupId: string;
    scope: ContentScope;
    skip: boolean;
}

function AssignedContacts({ targetGroupId, scope, skip }: AssignedContactsProps) {
    const intl = useIntl();
    const { labels: dataGridLabels } = useDataGridLabels();
    const searchLabels = useSearchLabels();
    const listState = useRemoteListState({ queryParamsPrefix: "assigned", pageSizeStorageKey: "dextinity-brevo-target-group-contacts-page-size" });
    const columns = useBrevoContactColumns<GQLBrevoContactsListItemFragment>();

    const { data, previousData, loading, error } = useQuery<GQLTargetGroupAssignedContactsQuery, GQLTargetGroupAssignedContactsQueryVariables>(
        assignedContactsQuery,
        {
            variables: { targetGroupId, scope, email: listState.search || undefined, offset: listState.offset, limit: listState.limit },
            skip,
            context: LocalErrorScopeApolloContext,
            fetchPolicy: "cache-and-network",
        },
    );
    const shownData = data ?? previousData;
    const total = shownData?.brevoContacts.totalCount;
    const pagination = useRemoteListPagination(listState, total);

    if (error) {
        throw error;
    }

    return (
        <TabContent>
            <FilterBar searchValue={listState.searchInput} onSearchChange={listState.setSearchInput} resultCount={total} labels={searchLabels} />
            <DataGrid
                aria-label={intl.formatMessage({ id: "dextinity.targetGroup.allAssignedContacts.title", defaultMessage: "All assigned contacts" })}
                columns={columns}
                rows={shownData?.brevoContacts.nodes ?? []}
                getRowId={(contact) => String(contact.id)}
                loading={loading && !shownData}
                loadingRowCount={5}
                pagination={pagination}
                labels={dataGridLabels}
                emptyState={
                    <EmptyState
                        icon={<Icon name="contact" />}
                        title={
                            listState.isFiltered
                                ? intl.formatMessage({
                                      id: "dextinity.targetGroup.assignedContacts.noMatches",
                                      defaultMessage: "No contacts match the search",
                                  })
                                : intl.formatMessage({
                                      id: "dextinity.targetGroup.assignedContacts.empty",
                                      defaultMessage: "The target group reaches no contacts yet",
                                  })
                        }
                    />
                }
            />
        </TabContent>
    );
}
