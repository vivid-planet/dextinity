import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { type ContentScope, useDataGridLabels, useRemoteListPagination } from "@dextinity/cms-admin";
import { Banner, DataGrid, Dialog, DialogFormActions, EmptyState, FilterBar, Icon } from "@dextinity/ui";
import { FORM_ERROR, type SubmissionErrors } from "final-form";
import { type JSX, useEffect, useId, useState } from "react";
import { Form, useField } from "react-final-form";
import { useIntl } from "react-intl";

import type { GQLBrevoContactsListItemFragment } from "../../brevoContacts/brevoContactsListItemFragment.generated";
import { useBrevoContactColumns } from "../../brevoContacts/useBrevoContactColumns";
import { addContactsToTargetGroupMutation, assignableContactsQuery } from "./AddContactsDialog.gql";
import type {
    GQLAddBrevoContactsToTargetGroupMutation,
    GQLAddBrevoContactsToTargetGroupMutationVariables,
    GQLTargetGroupAssignableContactsQuery,
    GQLTargetGroupAssignableContactsQueryVariables,
} from "./AddContactsDialog.gql.generated";
import { DialogBody } from "./AddContactsDialog.sc";

interface AddContactsFormValues {
    brevoContactIds: string[];
}

interface AddContactsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    targetGroupId: string;
    scope: ContentScope;
    /** Called with the number of added contacts. */
    onAdded: (count: number) => void;
}

const initialPageSize = 10;
const searchDebounceMs = 300;

/**
 * Picks contacts of the scope to add to a target group by hand. The selection is kept while searching and paging.
 */
export function AddContactsDialog({ open, onOpenChange, targetGroupId, scope, onAdded }: AddContactsDialogProps): JSX.Element {
    const intl = useIntl();
    const client = useApolloClient();
    const formId = useId();
    const [formKey, setFormKey] = useState(0);

    const close = () => {
        onOpenChange(false);
        setFormKey((key) => key + 1);
    };

    const add = async ({ brevoContactIds }: AddContactsFormValues): Promise<SubmissionErrors | undefined> => {
        try {
            await client.mutate<GQLAddBrevoContactsToTargetGroupMutation, GQLAddBrevoContactsToTargetGroupMutationVariables>({
                mutation: addContactsToTargetGroupMutation,
                variables: { id: targetGroupId, input: { brevoContactIds: brevoContactIds.map(Number) } },
                context: LocalErrorScopeApolloContext,
            });
            close();
            onAdded(brevoContactIds.length);
            return undefined;
        } catch (error) {
            return {
                [FORM_ERROR]: intl.formatMessage(
                    { id: "dextinity.targetGroup.addContacts.failed", defaultMessage: "The contacts couldn't be added: {reason}" },
                    { reason: error instanceof Error ? error.message : String(error) },
                ),
            };
        }
    };

    const title = intl.formatMessage({ id: "dextinity.targetGroup.assignedContacts.addContact", defaultMessage: "Add contacts" });

    return (
        <Form<AddContactsFormValues> key={formKey} onSubmit={add} initialValues={{ brevoContactIds: [] }}>
            {({ handleSubmit, submitting, submitError, values }) => (
                <Dialog
                    open={open}
                    onOpenChange={(isOpen) => !isOpen && close()}
                    title={title}
                    description={intl.formatMessage({
                        id: "dextinity.targetGroup.addContacts.description",
                        defaultMessage: "The contacts receive the campaigns of this target group regardless of its filters.",
                    })}
                    size="large"
                    dismissible={!submitting}
                    footer={
                        <DialogFormActions
                            formId={formId}
                            submitLabel={intl.formatMessage(
                                {
                                    id: "dextinity.targetGroup.addContacts.submit",
                                    defaultMessage: "{count, plural, =0 {Add contacts} one {Add # contact} other {Add # contacts}}",
                                },
                                { count: values.brevoContactIds.length },
                            )}
                            onCancel={close}
                            submitting={submitting}
                            submitDisabled={values.brevoContactIds.length === 0}
                            labels={{ cancel: intl.formatMessage({ id: "dextinity.targetGroup.addContacts.cancel", defaultMessage: "Cancel" }) }}
                        />
                    }
                >
                    <form id={formId} onSubmit={handleSubmit} noValidate aria-label={title}>
                        <DialogBody>
                            {submitError ? <Banner tone="error">{submitError}</Banner> : null}
                            {open ? <AssignableContactsField scope={scope} disabled={submitting} /> : null}
                        </DialogBody>
                    </form>
                </Dialog>
            )}
        </Form>
    );
}

function AssignableContactsField({ scope, disabled }: { scope: ContentScope; disabled: boolean }) {
    const intl = useIntl();
    const { labels: dataGridLabels } = useDataGridLabels();
    const { input } = useField<string[]>("brevoContactIds");
    const columns = useBrevoContactColumns<GQLBrevoContactsListItemFragment>();
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, searchDebounceMs);
        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    const { data, previousData, loading, error } = useQuery<GQLTargetGroupAssignableContactsQuery, GQLTargetGroupAssignableContactsQueryVariables>(
        assignableContactsQuery,
        {
            variables: { scope, email: search || undefined, offset: (page - 1) * pageSize, limit: pageSize },
            context: LocalErrorScopeApolloContext,
        },
    );
    const shownData = data ?? previousData;
    const total = shownData?.brevoContacts.totalCount;
    const pagination = useRemoteListPagination(
        {
            page,
            pageSize,
            setPage,
            setPageSize: (nextPageSize) => {
                setPageSize(nextPageSize);
                setPage(1);
            },
        },
        total,
    );

    if (error) {
        return (
            <Banner tone="error">
                {intl.formatMessage({ id: "dextinity.targetGroup.addContacts.loadFailed", defaultMessage: "The contacts couldn't be loaded" })}
            </Banner>
        );
    }

    return (
        <>
            <FilterBar
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                resultCount={total}
                searchShortcut={false}
                labels={{
                    search: intl.formatMessage({ id: "dextinity.targetGroup.assignableContacts.search", defaultMessage: "Search contacts" }),
                    searchPlaceholder: intl.formatMessage({
                        id: "dextinity.targetGroup.assignableContacts.searchEmail",
                        defaultMessage: "Search email address",
                    }),
                    filters: intl.formatMessage({ id: "dextinity.targetGroup.assignableContacts.filters", defaultMessage: "Filters" }),
                    resultCount: (count) =>
                        intl.formatMessage(
                            {
                                id: "dextinity.targetGroup.assignableContacts.resultCount",
                                defaultMessage: "{count, plural, one {# contact} other {# contacts}}",
                            },
                            { count },
                        ),
                }}
            />
            <DataGrid
                aria-label={intl.formatMessage({ id: "dextinity.targetGroup.assignableContacts.title", defaultMessage: "Assignable contacts" })}
                columns={columns.filter((column) => column.key !== "modifiedAt")}
                rows={shownData?.brevoContacts.nodes ?? []}
                getRowId={(contact) => String(contact.id)}
                loading={loading && !shownData}
                loadingRowCount={5}
                selectable={!disabled}
                selectedIds={input.value}
                onSelectionChange={input.onChange}
                onRowClick={(contact) => {
                    const contactId = String(contact.id);
                    input.onChange(input.value.includes(contactId) ? input.value.filter((id) => id !== contactId) : [...input.value, contactId]);
                }}
                clearSelectionOnEscape={false}
                pagination={pagination}
                labels={dataGridLabels}
                emptyState={
                    <EmptyState
                        icon={<Icon name="search" />}
                        title={intl.formatMessage({ id: "dextinity.targetGroup.assignableContacts.empty", defaultMessage: "No contacts found" })}
                    />
                }
            />
        </>
    );
}
