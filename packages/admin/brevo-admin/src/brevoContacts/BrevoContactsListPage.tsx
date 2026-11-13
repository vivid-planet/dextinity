import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { type ContentScope, useDataGridLabels, useRemoteListPagination, useRemoteListState } from "@dextinity/cms-admin";
import {
    Banner,
    Button,
    ConfirmDialog,
    DataGrid,
    type DataGridColumn,
    EmptyState,
    FilterBar,
    Icon,
    IconButton,
    ListDetailLayout,
    Menu,
    MenuItem,
    MenuSeparator,
    PageHeader,
    ToastViewport,
    Tooltip,
    useToasts,
} from "@dextinity/ui";
import { type JSX, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";

import { ContactImportDialog } from "../common/contactImport/ContactImportDialog";
import type { AdditionalAttributesFragment } from "./additionalAttributesFragment";
import { BrevoContactPanel, type BrevoContactsVariant, type BrevoContactUnsavedChanges, type EditBrevoContactFormValues } from "./BrevoContactPanel";
import type { GQLBrevoContactsListItemFragment } from "./brevoContactsListItemFragment.generated";
import {
    brevoContactsListQuery,
    brevoTestContactsListQuery,
    deleteBrevoContactMutation,
    deleteBrevoTestContactMutation,
    updateBrevoContactBlockedMutation,
} from "./BrevoContactsListPage.gql";
import type {
    GQLBrevoContactsListQuery,
    GQLBrevoContactsListQueryVariables,
    GQLBrevoTestContactsListQuery,
    GQLDeleteBrevoContactMutation,
    GQLDeleteBrevoContactMutationVariables,
    GQLDeleteBrevoTestContactMutation,
    GQLDeleteBrevoTestContactMutationVariables,
    GQLUpdateBrevoContactBlockedMutation,
    GQLUpdateBrevoContactBlockedMutationVariables,
} from "./BrevoContactsListPage.gql.generated";
import { HeaderActions, Toolbar } from "./BrevoContactsListPage.sc";
import { useBrevoContactColumns } from "./useBrevoContactColumns";

/** A row of the contacts list: the contact with the attributes of `additionalAttributesFragment`. */
export type BrevoContactRow<AdditionalAttributes extends object = Record<string, unknown>> = GQLBrevoContactsListItemFragment & AdditionalAttributes;

export interface BrevoContactsListOptions<AdditionalAttributes extends object = Record<string, unknown>> {
    /** Loads further attributes of the contacts, e.g. the name, for `additionalGridFields`, `additionalFormFields` and `input2State`. */
    additionalAttributesFragment?: AdditionalAttributesFragment;
    /** Columns shown after the email address. */
    additionalGridFields?: DataGridColumn<BrevoContactRow<AdditionalAttributes>>[];
    /** Fields of `@dextinity/ui-react-final-form` for the attributes, shown in the side panel. */
    additionalFormFields?: ReactNode;
    /** The initial form values of the attributes, from the loaded contact or `undefined` for a new one. */
    input2State?: (values?: EditBrevoContactFormValues) => EditBrevoContactFormValues;
}

interface BrevoContactsListPageProps<AdditionalAttributes extends object> extends BrevoContactsListOptions<AdditionalAttributes> {
    variant: BrevoContactsVariant;
    scope: ContentScope;
    scopeLabel: string;
}

const selectedParam = "selected";
const newContactId = "new";
const maxTestContacts = 100;
const columnsHiddenNextToPanel = ["modifiedAt", "createdAt"];

/**
 * The contacts or test contacts of the scope with a search; a click on a contact edits it in the side panel. The open contact is kept
 * in the URL as `?selected=<id>` (`?selected=new` for a new one).
 */
export function BrevoContactsListPage<AdditionalAttributes extends object>({
    variant,
    scope,
    scopeLabel,
    additionalAttributesFragment,
    additionalGridFields = [],
    additionalFormFields,
    input2State,
}: BrevoContactsListPageProps<AdditionalAttributes>): JSX.Element {
    type Row = BrevoContactRow<AdditionalAttributes>;
    const intl = useIntl();
    const client = useApolloClient();
    const history = useHistory();
    const location = useLocation();
    const { labels: dataGridLabels } = useDataGridLabels();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const listState = useRemoteListState({ pageSizeStorageKey: `dextinity-brevo-${variant}-page-size` });
    const [contactToDelete, setContactToDelete] = useState<Row>();
    const [deleting, setDeleting] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [panelUnsavedChanges, setPanelUnsavedChanges] = useState<BrevoContactUnsavedChanges>();
    const [pendingSelection, setPendingSelection] = useState<{ contactId: string | null }>();
    const isTestContacts = variant === "testContacts";
    const listQueryName = isTestContacts ? "BrevoTestContactsList" : "BrevoContactsList";

    const openContactId = new URLSearchParams(location.search).get(selectedParam);

    const selectContact = useCallback(
        (contactId: string | null) => {
            const params = new URLSearchParams(location.search);
            if (contactId) {
                params.set(selectedParam, contactId);
            } else {
                params.delete(selectedParam);
            }
            const search = params.toString();
            history.replace({ pathname: location.pathname, search: search ? `?${search}` : "", hash: location.hash });
        },
        [history, location.search, location.pathname, location.hash],
    );

    const changeSelection = (contactId: string | null) => {
        if (contactId === openContactId) {
            return;
        }
        if (panelUnsavedChanges) {
            setPendingSelection({ contactId });
        } else {
            selectContact(contactId);
        }
    };

    const listQuery = useMemo(
        () => (isTestContacts ? brevoTestContactsListQuery : brevoContactsListQuery)(additionalAttributesFragment),
        [isTestContacts, additionalAttributesFragment],
    );
    const { data, previousData, loading, error } = useQuery<ContactsListData, GQLBrevoContactsListQueryVariables>(listQuery, {
        variables: { scope, email: listState.search || undefined, offset: listState.offset, limit: listState.limit },
        context: LocalErrorScopeApolloContext,
        fetchPolicy: "cache-and-network",
    });
    const shownData = data ?? previousData;
    const list = getContactsList(shownData);
    const rows = (list?.nodes ?? []) as Row[];
    const total = list?.totalCount;
    const pagination = useRemoteListPagination(listState, total);

    const loadedList = getContactsList(data);
    const lastPage = Math.max(1, Math.ceil((loadedList?.totalCount ?? 0) / listState.pageSize));
    const { page, setPage } = listState;
    useEffect(() => {
        if (loadedList != null && page > lastPage) {
            setPage(lastPage);
        }
    }, [loadedList, page, lastPage, setPage]);

    if (error) {
        throw error;
    }

    const changeBlocked = async (contact: Row, blocked: boolean) => {
        try {
            await client.mutate<GQLUpdateBrevoContactBlockedMutation, GQLUpdateBrevoContactBlockedMutationVariables>({
                mutation: updateBrevoContactBlockedMutation,
                variables: { id: contact.id, blocked, scope },
                context: LocalErrorScopeApolloContext,
            });
            addToast({
                message: blocked
                    ? intl.formatMessage({ id: "dextinity.brevoContact.blocked", defaultMessage: "{email} blocked" }, { email: contact.email })
                    : intl.formatMessage({ id: "dextinity.brevoContact.unblocked", defaultMessage: "{email} unblocked" }, { email: contact.email }),
            });
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({ id: "dextinity.brevoContact.blockFailed", defaultMessage: "The contact couldn't be changed" }),
            });
        }
    };

    const deleteContact = async () => {
        if (!contactToDelete) {
            return;
        }
        setDeleting(true);
        try {
            if (isTestContacts) {
                await client.mutate<GQLDeleteBrevoTestContactMutation, GQLDeleteBrevoTestContactMutationVariables>({
                    mutation: deleteBrevoTestContactMutation,
                    variables: { id: contactToDelete.id, scope },
                    context: LocalErrorScopeApolloContext,
                });
            } else {
                await client.mutate<GQLDeleteBrevoContactMutation, GQLDeleteBrevoContactMutationVariables>({
                    mutation: deleteBrevoContactMutation,
                    variables: { id: contactToDelete.id, scope },
                    context: LocalErrorScopeApolloContext,
                });
            }
            await client.refetchQueries({ include: [listQueryName] });
            if (openContactId === String(contactToDelete.id)) {
                panelUnsavedChanges?.discard();
                selectContact(null);
            }
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.brevoContact.deleted", defaultMessage: "{email} deleted" },
                    { email: contactToDelete.email },
                ),
            });
            setContactToDelete(undefined);
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({
                    id: "dextinity.brevoContact.deleteFailed",
                    defaultMessage: "Deleting failed · the contact still exists",
                }),
            });
        } finally {
            setDeleting(false);
        }
    };

    const columns = useBrevoContactColumns<Row>(additionalGridFields);

    const isPanelOpen = openContactId != null;
    const visibleColumns = isPanelOpen ? columns.filter((column) => !columnsHiddenNextToPanel.includes(column.key)) : columns;
    const openContact = rows.find((contact) => String(contact.id) === openContactId);
    const isTestContactLimitReached = isTestContacts && (total ?? 0) >= maxTestContacts;

    const title = isTestContacts
        ? intl.formatMessage({ id: "dextinity.brevoContacts.brevoTestContacts", defaultMessage: "Test contacts" })
        : intl.formatMessage({ id: "dextinity.brevoContacts.brevoContacts", defaultMessage: "Contacts" });
    const newContactLabel = isTestContacts
        ? intl.formatMessage({ id: "dextinity.brevoTestContact.newContact", defaultMessage: "New test contact" })
        : intl.formatMessage({ id: "dextinity.brevoContact.newContact", defaultMessage: "New contact" });

    const newContactButton = (
        <Button startIcon={<Icon name="plus" />} disabled={isTestContactLimitReached} onClick={() => changeSelection(newContactId)}>
            {newContactLabel}
        </Button>
    );

    return (
        <>
            <ListDetailLayout
                open={isPanelOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        // The unsaved changes dialog would otherwise receive the Escape that closes the panel and close right away
                        window.setTimeout(() => changeSelection(null));
                    }
                }}
                sidePanelLabel={
                    openContactId === newContactId
                        ? newContactLabel
                        : openContact
                          ? intl.formatMessage(
                                { id: "dextinity.brevoContact.panel.labelWithEmail", defaultMessage: "Edit contact {email}" },
                                { email: openContact.email },
                            )
                          : intl.formatMessage({ id: "dextinity.brevoContacts.editBrevoContact", defaultMessage: "Edit contact" })
                }
                header={
                    <PageHeader
                        eyebrow={scopeLabel}
                        title={title}
                        subtitle={
                            total !== undefined
                                ? isTestContacts
                                    ? intl.formatMessage(
                                          {
                                              id: "dextinity.brevoTestContact.subtitle",
                                              defaultMessage: "{count} of {max} test contacts",
                                          },
                                          { count: total, max: maxTestContacts },
                                      )
                                    : intl.formatMessage(
                                          {
                                              id: "dextinity.brevoContact.subtitle",
                                              defaultMessage: "{count, plural, one {# confirmed contact} other {# confirmed contacts}}",
                                          },
                                          { count: total },
                                      )
                                : undefined
                        }
                        actions={
                            <HeaderActions>
                                {isTestContacts ? null : (
                                    <Button
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
                                )}
                                {isTestContactLimitReached ? (
                                    <Tooltip
                                        content={intl.formatMessage({
                                            id: "dextinity.brevoTestContact.contactLimitReached",
                                            defaultMessage: "Contact limit of 100 reached. You cannot add more contacts.",
                                        })}
                                    >
                                        <span tabIndex={0}>{newContactButton}</span>
                                    </Tooltip>
                                ) : (
                                    newContactButton
                                )}
                            </HeaderActions>
                        }
                    />
                }
                toolbar={
                    <Toolbar>
                        {isTestContacts ? (
                            <Banner tone="info">
                                {intl.formatMessage({
                                    id: "dextinity.brevoTestContact.testContactAlert",
                                    defaultMessage:
                                        "Contacts in this list are only added for testing purposes. Users do not get a double-opt in to confirm their subscription.",
                                })}
                            </Banner>
                        ) : null}
                        <FilterBar
                            searchValue={listState.searchInput}
                            onSearchChange={listState.setSearchInput}
                            resultCount={total}
                            labels={{
                                search: intl.formatMessage({ id: "dextinity.brevoContact.search", defaultMessage: "Search contacts" }),
                                searchPlaceholder: intl.formatMessage({
                                    id: "dextinity.brevoContact.searchEmail",
                                    defaultMessage: "Search email address",
                                }),
                                filters: intl.formatMessage({ id: "dextinity.brevoContact.filters", defaultMessage: "Filters" }),
                                resultCount: (count) =>
                                    intl.formatMessage(
                                        {
                                            id: "dextinity.brevoContact.resultCount",
                                            defaultMessage: "{count, plural, one {# result} other {# results}}",
                                        },
                                        { count },
                                    ),
                            }}
                        />
                    </Toolbar>
                }
                sidePanel={
                    openContactId != null ? (
                        <BrevoContactPanel
                            key={openContactId}
                            variant={variant}
                            contactId={openContactId === newContactId ? undefined : Number(openContactId)}
                            scope={scope}
                            additionalAttributesFragment={additionalAttributesFragment}
                            additionalFormFields={additionalFormFields}
                            input2State={input2State}
                            onClose={() => changeSelection(null)}
                            onCreated={(message) => {
                                selectContact(null);
                                addToast({ tone: "success", message });
                            }}
                            onUnsavedChangesChange={setPanelUnsavedChanges}
                        />
                    ) : null
                }
            >
                <DataGrid
                    aria-label={title}
                    columns={visibleColumns}
                    rows={rows}
                    getRowId={(contact) => String(contact.id)}
                    loading={loading && !shownData}
                    loadingRowCount={Math.min(listState.pageSize, 10)}
                    onRowClick={(contact) => changeSelection(String(contact.id))}
                    activeRowId={openContactId ?? undefined}
                    rowActions={(contact) => (
                        <ContactRowMenu
                            contact={contact}
                            canBlock={!isTestContacts}
                            onEdit={() => changeSelection(String(contact.id))}
                            onChangeBlocked={(blocked) => void changeBlocked(contact, blocked)}
                            onDelete={() => setContactToDelete(contact)}
                        />
                    )}
                    pagination={pagination}
                    labels={dataGridLabels}
                    emptyState={
                        listState.isFiltered ? (
                            <EmptyState
                                icon={<Icon name="search" />}
                                title={intl.formatMessage({ id: "dextinity.brevoContact.noMatches", defaultMessage: "No contacts match the search" })}
                                description={intl.formatMessage({
                                    id: "dextinity.brevoContact.noMatchesDescription",
                                    defaultMessage: "Check the spelling of the email address.",
                                })}
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" onClick={listState.resetFilters}>
                                        {intl.formatMessage({ id: "dextinity.brevoContact.resetSearch", defaultMessage: "Reset search" })}
                                    </Button>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={<Icon name="contact" />}
                                title={
                                    isTestContacts
                                        ? intl.formatMessage({ id: "dextinity.brevoTestContact.empty", defaultMessage: "No test contacts yet" })
                                        : intl.formatMessage({ id: "dextinity.brevoContact.empty", defaultMessage: "No contacts yet" })
                                }
                                description={
                                    isTestContacts
                                        ? intl.formatMessage({
                                              id: "dextinity.brevoTestContact.emptyDescription",
                                              defaultMessage: "Test contacts receive the test emails of a campaign.",
                                          })
                                        : intl.formatMessage({
                                              id: "dextinity.brevoContact.emptyDescription",
                                              defaultMessage: "Contacts show up here once they confirmed their subscription.",
                                          })
                                }
                                actions={
                                    <Button size="small" startIcon={<Icon name="plus" />} onClick={() => changeSelection(newContactId)}>
                                        {newContactLabel}
                                    </Button>
                                }
                            />
                        )
                    }
                />
            </ListDetailLayout>
            {isTestContacts ? null : (
                <ContactImportDialog
                    open={importOpen}
                    onOpenChange={setImportOpen}
                    scope={scope}
                    onImported={() => void client.refetchQueries({ include: [listQueryName] })}
                />
            )}
            <ConfirmDialog
                open={contactToDelete != null}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setContactToDelete(undefined);
                    }
                }}
                tone="danger"
                title={intl.formatMessage(
                    { id: "dextinity.brevoContact.deleteDialog.title", defaultMessage: "Delete {email}?" },
                    { email: contactToDelete?.email ?? "" },
                )}
                description={
                    isTestContacts
                        ? intl.formatMessage({
                              id: "dextinity.brevoTestContact.deleteDialog.description",
                              defaultMessage: "The contact no longer receives test emails.",
                          })
                        : intl.formatMessage({
                              id: "dextinity.brevoContact.deleteDialog.description",
                              defaultMessage:
                                  "The contact is removed from Brevo in all scopes. This can't be undone; to stop sending emails only, block it.",
                          })
                }
                confirmLabel={intl.formatMessage({ id: "dextinity.brevoContact.deleteDialog.confirm", defaultMessage: "Delete" })}
                confirmIcon={<Icon name="trash" />}
                onConfirm={() => void deleteContact()}
                loading={deleting}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.brevoContact.deleteDialog.cancel", defaultMessage: "Cancel" }) }}
            />
            <ConfirmDialog
                open={pendingSelection != null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingSelection(undefined);
                    }
                }}
                title={intl.formatMessage({ id: "dextinity.brevoContact.unsavedChanges.title", defaultMessage: "Unsaved changes" })}
                description={intl.formatMessage({
                    id: "dextinity.brevoContact.unsavedChanges.description",
                    defaultMessage: "Save the changes to this contact before you continue?",
                })}
                secondaryLabel={intl.formatMessage({ id: "dextinity.brevoContact.unsavedChanges.discard", defaultMessage: "Discard" })}
                onSecondary={() => {
                    panelUnsavedChanges?.discard();
                    if (pendingSelection) {
                        selectContact(pendingSelection.contactId);
                    }
                    setPendingSelection(undefined);
                }}
                confirmLabel={intl.formatMessage({ id: "dextinity.brevoContact.unsavedChanges.save", defaultMessage: "Save and continue" })}
                onConfirm={async () => {
                    const nextSelection = pendingSelection;
                    setPendingSelection(undefined);
                    const isSaved = (await panelUnsavedChanges?.save()) ?? true;
                    if (isSaved && nextSelection) {
                        selectContact(nextSelection.contactId);
                    }
                }}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.brevoContact.unsavedChanges.cancel", defaultMessage: "Cancel" }) }}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.brevoContact.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}

type ContactsListData = GQLBrevoContactsListQuery | GQLBrevoTestContactsListQuery;

function getContactsList(data: ContactsListData | undefined) {
    if (!data) {
        return undefined;
    }
    return "brevoTestContacts" in data ? data.brevoTestContacts : data.brevoContacts;
}

interface ContactRowMenuProps {
    contact: GQLBrevoContactsListItemFragment;
    canBlock: boolean;
    onEdit: () => void;
    onChangeBlocked: (blocked: boolean) => void;
    onDelete: () => void;
}

function ContactRowMenu({ contact, canBlock, onEdit, onChangeBlocked, onDelete }: ContactRowMenuProps) {
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
                        { id: "dextinity.brevoContact.rowActions", defaultMessage: "Actions for {email}" },
                        { email: contact.email },
                    )}
                    size="small"
                    variant="text"
                    color="secondary"
                >
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.brevoContact.actions.edit", defaultMessage: "Edit" })}
                icon={<Icon name="edit" />}
                onClick={onEdit}
            />
            {canBlock ? (
                contact.emailBlacklisted ? (
                    <MenuItem
                        label={intl.formatMessage({ id: "dextinity.brevoContact.actions.unblock", defaultMessage: "Unblock" })}
                        icon={<Icon name="check" />}
                        onClick={() => onChangeBlocked(false)}
                    />
                ) : (
                    <MenuItem
                        label={intl.formatMessage({ id: "dextinity.brevoContact.actions.block", defaultMessage: "Block" })}
                        icon={<Icon name="close-circle" />}
                        onClick={() => onChangeBlocked(true)}
                    />
                )
            ) : null}
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.brevoContact.actions.delete", defaultMessage: "Delete" })}
                icon={<Icon name="trash" />}
                color="error"
                onClick={onDelete}
            />
        </Menu>
    );
}
