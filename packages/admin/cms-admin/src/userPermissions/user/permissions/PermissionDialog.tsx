import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Banner, Button, type DateRange, Dialog, DialogFormActions, Skeleton } from "@dextinity/ui";
import { DateRangeField, focusOnError, InputField, SelectField } from "@dextinity/ui-react-final-form";
import { format, parseISO } from "date-fns";
import { useId, useMemo } from "react";
import { Form } from "react-final-form";
import { useIntl } from "react-intl";

import { useDateRangePickerLabels } from "../../../form/useDatePickerLabels";
import type { GQLPermission } from "../../../graphql.generated";
import { camelCaseToHumanReadable } from "../../utils/camelCaseToHumanReadable";
import {
    type GQLAvailablePermissionsQuery,
    type GQLAvailablePermissionsQueryVariables,
    type GQLCreateUserPermissionMutation,
    type GQLCreateUserPermissionMutationVariables,
    type GQLPermissionQuery,
    type GQLPermissionQueryVariables,
    type GQLUpdateUserPermissionMutation,
    type GQLUpdateUserPermissionMutationVariables,
    namedOperations,
} from "./PermissionDialog.generated";
import { PermissionFields } from "./PermissionDialog.sc";

interface PermissionFormValues {
    permission: GQLPermission | null;
    validity: DateRange | null;
    reason: string;
    requestedBy: string;
    approvedBy: string;
}

interface FormProps {
    userId: string;
    permissionId: string | "add";
    handleDialogClose: () => void;
}

const formDecorators = [focusOnError];

const toDay = (dateTime: string | null) => (dateTime ? format(parseISO(dateTime), "yyyy-MM-dd") : null);

const toDateTime = (day: string | null | undefined) => (day ? parseISO(day).toISOString() : null);

const toOptionalText = (text: string | undefined) => (text?.trim() ? text.trim() : null);

export const PermissionDialog = ({ userId, permissionId, handleDialogClose }: FormProps) => {
    const intl = useIntl();
    const dateRangePickerLabels = useDateRangePickerLabels();
    const client = useApolloClient();
    const formId = useId();
    const isNew = permissionId === "add";

    const { data, error } = useQuery<GQLPermissionQuery, GQLPermissionQueryVariables>(
        gql`
            query Permission($permissionId: ID!, $userId: String) {
                userPermission: userPermissionsPermission(id: $permissionId, userId: $userId) {
                    ...UserPermissionDialog
                }
            }
            fragment UserPermissionDialog on UserPermission {
                permission
                source
                validFrom
                validTo
                reason
                requestedBy
                approvedBy
            }
        `,
        {
            skip: isNew,
            variables: { permissionId, userId },
        },
    );
    const { data: availablePermissionsData, error: availablePermissionsError } = useQuery<
        GQLAvailablePermissionsQuery,
        GQLAvailablePermissionsQueryVariables
    >(gql`
        query AvailablePermissions {
            availablePermissions: userPermissionsAvailablePermissions
        }
    `);

    const submit = async (values: PermissionFormValues) => {
        if (values.permission === null) {
            return;
        }
        const input = {
            permission: values.permission,
            validFrom: toDateTime(values.validity?.start),
            validTo: toDateTime(values.validity?.end),
            reason: toOptionalText(values.reason),
            requestedBy: toOptionalText(values.requestedBy),
            approvedBy: toOptionalText(values.approvedBy),
        };

        if (isNew) {
            await client.mutate<GQLCreateUserPermissionMutation, GQLCreateUserPermissionMutationVariables>({
                mutation: gql`
                    mutation CreateUserPermission($userId: String!, $input: UserPermissionInput!) {
                        userPermissionsCreatePermission(userId: $userId, input: $input) {
                            id
                        }
                    }
                `,
                variables: { userId, input },
                refetchQueries: ["Permissions"],
                awaitRefetchQueries: true,
            });
        } else {
            await client.mutate<GQLUpdateUserPermissionMutation, GQLUpdateUserPermissionMutationVariables>({
                mutation: gql`
                    mutation UpdateUserPermission($id: String!, $input: UserPermissionInput!) {
                        userPermissionsUpdatePermission(id: $id, input: $input) {
                            id
                        }
                    }
                `,
                variables: { id: permissionId, input },
                refetchQueries: [namedOperations.Query.Permission, "Permissions"],
                awaitRefetchQueries: true,
            });
        }
        handleDialogClose();
    };

    const permission = data?.userPermission;
    const isLoading = !availablePermissionsData || (!isNew && !permission);
    const isByRule = permission?.source === "BY_RULE";
    const initialValues = useMemo<PermissionFormValues>(
        () => ({
            permission: permission?.permission ?? null,
            validity: permission?.validFrom || permission?.validTo ? { start: toDay(permission.validFrom), end: toDay(permission.validTo) } : null,
            reason: permission?.reason ?? "",
            requestedBy: permission?.requestedBy ?? "",
            approvedBy: permission?.approvedBy ?? "",
        }),
        [permission],
    );
    if (error) {
        throw new Error(error.message);
    }
    if (availablePermissionsError) {
        throw new Error(availablePermissionsError.message);
    }

    const permissionOptions = (availablePermissionsData?.availablePermissions ?? []).map((availablePermission) => ({
        value: availablePermission as GQLPermission,
        label: camelCaseToHumanReadable(availablePermission),
    }));
    const cancelLabel = intl.formatMessage({ id: "dextinity.userPermissions.cancel", defaultMessage: "Cancel" });

    return (
        <Form<PermissionFormValues> initialValues={isLoading ? undefined : initialValues} decorators={formDecorators} onSubmit={submit}>
            {({ handleSubmit, submitting }) => (
                <Dialog
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            handleDialogClose();
                        }
                    }}
                    dismissible={!submitting}
                    title={
                        isNew
                            ? intl.formatMessage({ id: "dextinity.userPermissions.addPermissionDialog.title", defaultMessage: "Add permission" })
                            : isByRule
                              ? intl.formatMessage({ id: "dextinity.userPermissions.permissionDetails", defaultMessage: "Permission details" })
                              : intl.formatMessage({ id: "dextinity.userPermissions.editPermissionTitle", defaultMessage: "Edit permission" })
                    }
                    footer={
                        isByRule ? (
                            <Button variant="outlined" color="secondary" onClick={handleDialogClose}>
                                {intl.formatMessage({ id: "dextinity.userPermissions.close", defaultMessage: "Close" })}
                            </Button>
                        ) : (
                            <DialogFormActions
                                formId={formId}
                                submitLabel={
                                    isNew
                                        ? intl.formatMessage({ id: "dextinity.userPermissions.add", defaultMessage: "Add" })
                                        : intl.formatMessage({ id: "dextinity.userPermissions.save", defaultMessage: "Save" })
                                }
                                onCancel={handleDialogClose}
                                submitting={submitting}
                                submitDisabled={isLoading}
                                labels={{ cancel: cancelLabel }}
                            />
                        )
                    }
                >
                    {isLoading ? (
                        <Skeleton variant="row" count={5} />
                    ) : (
                        <form id={formId} onSubmit={handleSubmit} noValidate>
                            <PermissionFields>
                                {isByRule && (
                                    <Banner tone="info">
                                        {intl.formatMessage({
                                            id: "dextinity.userPermissions.byRuleBanner",
                                            defaultMessage: "Assigned by a rule, so it can't be changed here.",
                                        })}
                                    </Banner>
                                )}
                                <SelectField<false, GQLPermission>
                                    name="permission"
                                    label={intl.formatMessage({ id: "dextinity.userPermissions.permission", defaultMessage: "Permission" })}
                                    options={permissionOptions}
                                    searchable
                                    required
                                    disabled={isByRule}
                                />
                                <DateRangeField
                                    name="validity"
                                    label={intl.formatMessage({
                                        id: "dextinity.userPermissions.validityDuration",
                                        defaultMessage: "Validity duration",
                                    })}
                                    helperText={intl.formatMessage({
                                        id: "dextinity.userPermission.validityDuration.tooltip.content",
                                        defaultMessage: "Leave empty for unlimited validity",
                                    })}
                                    locale={intl.locale}
                                    disabled={isByRule}
                                    labels={{
                                        ...dateRangePickerLabels,
                                        start: intl.formatMessage({ id: "dextinity.userPermissions.validFrom", defaultMessage: "Valid from" }),
                                        end: intl.formatMessage({ id: "dextinity.userPermissions.validTo", defaultMessage: "Valid to" }),
                                    }}
                                />
                                <InputField
                                    name="reason"
                                    label={intl.formatMessage({ id: "dextinity.userPermissions.reason", defaultMessage: "Reason" })}
                                    placeholder={
                                        isByRule
                                            ? undefined
                                            : intl.formatMessage({
                                                  id: "dextinity.userPermissions.reason.placeholder",
                                                  defaultMessage: "Reason why this role is needed",
                                              })
                                    }
                                    disabled={isByRule}
                                />
                                <InputField
                                    name="requestedBy"
                                    label={intl.formatMessage({ id: "dextinity.userPermissions.requestedBy", defaultMessage: "Requested by" })}
                                    placeholder={
                                        isByRule
                                            ? undefined
                                            : intl.formatMessage({
                                                  id: "dextinity.userPermissions.requestedBy.placeholder",
                                                  defaultMessage: "Who has requested this?",
                                              })
                                    }
                                    disabled={isByRule}
                                />
                                <InputField
                                    name="approvedBy"
                                    label={intl.formatMessage({ id: "dextinity.userPermissions.approvedBy", defaultMessage: "Approved by" })}
                                    placeholder={
                                        isByRule
                                            ? undefined
                                            : intl.formatMessage({
                                                  id: "dextinity.userPermissions.approvedBy.placeholder",
                                                  defaultMessage: "Who approved this request?",
                                              })
                                    }
                                    disabled={isByRule}
                                />
                            </PermissionFields>
                        </form>
                    )}
                </Dialog>
            )}
        </Form>
    );
};
