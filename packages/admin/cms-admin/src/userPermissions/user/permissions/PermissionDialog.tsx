import { gql, useApolloClient, useQuery } from "@apollo/client";
import { CancelButton, DatePickerField, Field, FinalForm, FinalFormSelect, FormSection, Loading, SaveButton, TextField } from "@dextinity/admin";
import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";

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
    type GQLUserPermissionDialogFragment,
    namedOperations,
} from "./PermissionDialog.generated";

interface FormProps {
    userId: string;
    permissionId: string | "add";
    handleDialogClose: () => void;
}
export const PermissionDialog = ({ userId, permissionId, handleDialogClose }: FormProps) => {
    const intl = useIntl();
    const client = useApolloClient();

    const submit = async (submitData: GQLUserPermissionDialogFragment) => {
        const { source, __typename, ...data } = submitData; // Remove source and __typename from data
        const input = {
            ...data,
            validFrom: data.validFrom ?? null,
            validTo: data.validTo ?? null,
            reason: data.reason ?? null,
            requestedBy: data.requestedBy ?? null,
            approvedBy: data.approvedBy ?? null,
        };

        if (permissionId && permissionId !== "add") {
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
            });
        } else {
            await client.mutate<GQLCreateUserPermissionMutation, GQLCreateUserPermissionMutationVariables>({
                mutation: gql`
                    mutation CreateUserPermission($userId: String!, $input: UserPermissionInput!) {
                        userPermissionsCreatePermission(userId: $userId, input: $input) {
                            id
                        }
                    }
                `,
                variables: { userId, input },
                refetchQueries: [namedOperations.Query.Permission, "Permissions"],
            });
        }
        handleDialogClose();
    };

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
            skip: permissionId === "add",
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

    if (error) {
        throw new Error(error.message);
    }
    if (availablePermissionsError) {
        throw new Error(availablePermissionsError.message);
    }
    if (!availablePermissionsData || (permissionId !== "add" && !data)) {
        return <Loading />;
    }

    const initialValues = data
        ? {
              ...data.userPermission,
              validFrom: data.userPermission.validFrom ? new Date(data.userPermission.validFrom) : null,
              validTo: data.userPermission.validTo ? new Date(data.userPermission.validTo) : null,
          }
        : {};

    const disabled = data && data.userPermission.source === "BY_RULE";

    return (
        <Dialog maxWidth="sm" open={true}>
            <FinalForm<GQLUserPermissionDialogFragment>
                mode={permissionId ? "edit" : "add"}
                onSubmit={submit}
                onAfterSubmit={() => null}
                initialValues={initialValues}
                render={() => (
                    <>
                        <DialogTitle>
                            <FormattedMessage id="dextinity.userPermissions.addScopesToPermission" defaultMessage="Add scopes to permission" />
                        </DialogTitle>
                        <DialogContent>
                            <FormSection title={<FormattedMessage id="dextinity.userPermissions.setPermission" defaultMessage="Set permission" />}>
                                <Field
                                    required
                                    fullWidth
                                    name="permission"
                                    component={FinalFormSelect}
                                    options={availablePermissionsData.availablePermissions}
                                    getOptionLabel={(permission: string) => camelCaseToHumanReadable(permission)}
                                    disabled={disabled}
                                    label={<FormattedMessage id="dextinity.userPermissions.permission" defaultMessage="Permission" />}
                                    variant="horizontal"
                                />
                            </FormSection>
                            <FormSection
                                title={<FormattedMessage id="dextinity.userPermissions.validityDuration" defaultMessage="Validity duration" />}
                                infoTooltip={{
                                    title: (
                                        <FormattedMessage
                                            id="dextinity.userPermission.validityDuration.tooltip.title"
                                            defaultMessage="Validity duration"
                                        />
                                    ),
                                    description: (
                                        <FormattedMessage
                                            id="dextinity.userPermission.validityDuration.tooltip.content"
                                            defaultMessage="Leave empty for unlimited validity"
                                        />
                                    ),
                                }}
                            >
                                <DatePickerField
                                    name="validFrom"
                                    label={<FormattedMessage id="dextinity.userPermissions.validFrom" defaultMessage="Valid from" />}
                                    fullWidth
                                    disabled={disabled}
                                    variant="horizontal"
                                />
                                <DatePickerField
                                    name="validTo"
                                    label={<FormattedMessage id="dextinity.userPermissions.validTo" defaultMessage="Valid to" />}
                                    fullWidth
                                    disabled={disabled}
                                    variant="horizontal"
                                />
                            </FormSection>
                            <FormSection title={<FormattedMessage id="dextinity.userPermissions.documentation" defaultMessage="Documentation" />}>
                                <TextField
                                    fullWidth
                                    name="reason"
                                    disabled={disabled}
                                    label={<FormattedMessage id="dextinity.userPermissions.reason" defaultMessage="Reason" />}
                                    disableContentTranslation
                                    variant="horizontal"
                                    placeholder={intl.formatMessage({
                                        id: "dextinity.userPermissions.reason.placeholder",
                                        defaultMessage: "Reason why this role is needed",
                                    })}
                                />
                                <TextField
                                    fullWidth
                                    name="requestedBy"
                                    disabled={disabled}
                                    label={<FormattedMessage id="dextinity.userPermissions.requestedBy" defaultMessage="Requested by" />}
                                    disableContentTranslation
                                    variant="horizontal"
                                    placeholder={intl.formatMessage({
                                        id: "dextinity.userPermissions.requestedBy.placeholder",
                                        defaultMessage: "Who has requested this?",
                                    })}
                                />
                                <TextField
                                    fullWidth
                                    name="approvedBy"
                                    disabled={disabled}
                                    label={<FormattedMessage id="dextinity.userPermissions.approvedBy" defaultMessage="Approved by" />}
                                    disableContentTranslation
                                    variant="horizontal"
                                    placeholder={intl.formatMessage({
                                        id: "dextinity.userPermissions.approvedBy.placeholder",
                                        defaultMessage: "Who approved this request?",
                                    })}
                                />
                            </FormSection>
                        </DialogContent>
                        <DialogActions>
                            <CancelButton onClick={handleDialogClose} />
                            {disabled ? <div /> : <SaveButton type="submit" />}
                        </DialogActions>
                    </>
                )}
            />
        </Dialog>
    );
};
