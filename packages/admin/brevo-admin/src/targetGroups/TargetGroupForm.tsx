import { type DocumentNode, gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Field,
    FieldSet,
    FinalForm,
    FinalFormInput,
    FinalFormSaveButton,
    type FinalFormSubmitEvent,
    Loading,
    MainContent,
    Toolbar,
    ToolbarActions,
    ToolbarFillSpace,
    ToolbarItem,
    ToolbarTitleItem,
    useFormApiRef,
    useStackApi,
} from "@dextinity/admin";
import { ArrowLeft } from "@dextinity/admin-icons";
import { type ContentScope, ContentScopeIndicator, queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@dextinity/cms-admin";
import { IconButton } from "@mui/material";
import type { FormApi } from "final-form";
import { FormattedMessage } from "react-intl";

export { namedOperations as targetGroupFormNamedOperations } from "./TargetGroupForm.gql.generated";
import { type ReactElement, type ReactNode, useMemo } from "react";

import { AddContactsGridSelect } from "./addContacts/AddContactsGridSelect";
import { AllAssignedContactsGrid } from "./allAssignedContacts/AllAssignedContactsGrid";
import { targetGroupFormQuery, updateTargetGroupMutation } from "./TargetGroupForm.gql";
import type {
    GQLTargetGroupFormQuery,
    GQLTargetGroupFormQueryVariables,
    GQLUpdateTargetGroupMutation,
    GQLUpdateTargetGroupMutationVariables,
} from "./TargetGroupForm.gql.generated";

export interface EditTargetGroupFinalFormValues {
    title: string;
    [key: string]: unknown;
}

interface FormProps {
    id: string;
    scope: ContentScope;
    additionalFormFields?: ReactNode;
    nodeFragment?: { name: string; fragment: DocumentNode };
    input2State?: (values?: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
}

export function TargetGroupForm({ id, scope, additionalFormFields, input2State, nodeFragment }: FormProps): ReactElement {
    const stackApi = useStackApi();
    const client = useApolloClient();
    const mode = "edit";
    const formApiRef = useFormApiRef<EditTargetGroupFinalFormValues>();

    let targetGroupFormFragment: DocumentNode | undefined;
    if (additionalFormFields && nodeFragment) {
        targetGroupFormFragment = gql`
            fragment TargetGroupForm on BrevoTargetGroup {
                ${"...".concat(nodeFragment.name)}
            }
            ${nodeFragment.fragment}
        `;
    }

    const { data, error, loading, refetch } = useQuery<GQLTargetGroupFormQuery, GQLTargetGroupFormQueryVariables>(
        targetGroupFormQuery(targetGroupFormFragment),
        { variables: { id } },
    );

    const initialValues = useMemo<Partial<EditTargetGroupFinalFormValues>>(() => {
        let additionalInitialValues = {};

        if (input2State) {
            additionalInitialValues = input2State(data?.brevoTargetGroup);
        }

        return data?.brevoTargetGroup ? { title: data.brevoTargetGroup.title, ...additionalInitialValues } : additionalInitialValues;
    }, [data?.brevoTargetGroup, input2State]);

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "brevoTargetGroup", id);
            return resolveHasSaveConflict(data?.brevoTargetGroup.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const handleSubmit = async (
        state: EditTargetGroupFinalFormValues,
        form: FormApi<EditTargetGroupFinalFormValues>,
        event: FinalFormSubmitEvent,
    ) => {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }

        const output = {
            ...state,
        };

        await client.mutate<GQLUpdateTargetGroupMutation, GQLUpdateTargetGroupMutationVariables>({
            mutation: updateTargetGroupMutation(targetGroupFormFragment),
            variables: { id, input: output, lastUpdatedAt: data?.brevoTargetGroup?.updatedAt },
        });
    };

    if (error) {
        throw error;
    }

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    return (
        <FinalForm<EditTargetGroupFinalFormValues> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode} initialValues={initialValues}>
            {({ values }) => (
                <>
                    {saveConflict.dialogs}
                    <Toolbar scopeIndicator={<ContentScopeIndicator scope={scope} />}>
                        <ToolbarItem>
                            <IconButton onClick={stackApi?.goBack}>
                                <ArrowLeft />
                            </IconButton>
                        </ToolbarItem>
                        <ToolbarTitleItem>
                            <FormattedMessage id="dextinity.targetGroups.TargetGroup" defaultMessage="Target group" />
                        </ToolbarTitleItem>
                        <ToolbarFillSpace />
                        <ToolbarActions>
                            <FinalFormSaveButton hasConflict={saveConflict.hasConflict} />
                        </ToolbarActions>
                    </Toolbar>
                    <MainContent>
                        <Field
                            required
                            fullWidth
                            name="title"
                            component={FinalFormInput}
                            label={<FormattedMessage id="dextinity.targetGroup.title" defaultMessage="Title" />}
                        />
                        {additionalFormFields && (
                            <FieldSet
                                title={<FormattedMessage id="dextinity.targetGroup.filters" defaultMessage="Filters" />}
                                supportText={
                                    <FormattedMessage
                                        id="dextinity.targetGroup.filters.explainText"
                                        defaultMessage="Contacts will get assigned automatically to this target group depending on their attributes"
                                    />
                                }
                                initiallyExpanded
                            >
                                {additionalFormFields}
                            </FieldSet>
                        )}

                        <>
                            <FieldSet
                                title={<FormattedMessage id="dextinity.targetGroup.manuallyAddContacts" defaultMessage="Manually add contacts" />}
                                initiallyExpanded
                                disablePadding
                            >
                                <AddContactsGridSelect
                                    assignedContactsTargetGroupBrevoId={data?.brevoTargetGroup.assignedContactsTargetGroupBrevoId ?? undefined}
                                    id={id}
                                    scope={scope}
                                />
                            </FieldSet>
                            <FieldSet
                                title={<FormattedMessage id="dextinity.targetGroup.allAssignedContacts" defaultMessage="All assigned contacts" />}
                                disablePadding
                                initiallyExpanded={false}
                            >
                                <AllAssignedContactsGrid brevoId={data?.brevoTargetGroup.brevoId ?? undefined} id={id} scope={scope} />
                            </FieldSet>
                        </>
                    </MainContent>
                </>
            )}
        </FinalForm>
    );
}
