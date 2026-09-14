import { useApolloClient, useQuery } from "@apollo/client";
import {
    FillSpace,
    FinalForm,
    FinalFormSaveButton,
    Loading,
    MainContent,
    SelectField,
    Toolbar,
    ToolbarItem,
    useFormApiRef,
    useStackApi,
} from "@dextinity/admin";
import { ArrowLeft } from "@dextinity/admin-icons";
import { ContentScopeIndicator, PageName, queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@dextinity/cms-admin";
import { IconButton } from "@mui/material";
import type { GQLPredefinedPageType } from "@src/graphql.generated";
import { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { v4 as uuid } from "uuid";

import { predefinedPageQuery, savePredefinedPageMutation } from "./EditPredefinedPage.gql";
import type {
    GQLPredefinedPageQuery,
    GQLPredefinedPageQueryVariables,
    GQLSavePredefinedPageMutation,
    GQLSavePredefinedPageMutationVariables,
} from "./EditPredefinedPage.gql.generated";
import { predefinedPageLabels } from "./predefinedPageLabels";

type FormValues = {
    type?: GQLPredefinedPageType;
};

interface Props {
    id: string;
}

export const EditPredefinedPage = ({ id: pageTreeNodeId }: Props) => {
    const stackApi = useStackApi();
    const client = useApolloClient();
    const formApiRef = useFormApiRef<FormValues>();

    const { data, error, loading, refetch } = useQuery<GQLPredefinedPageQuery, GQLPredefinedPageQueryVariables>(predefinedPageQuery, {
        variables: { pageTreeNodeId },
    });

    const initialValues = useMemo<Partial<FormValues>>(() => {
        if (data?.pageTreeNode?.document) {
            if (data.pageTreeNode.document.__typename !== "PredefinedPage") {
                throw new Error(`Invalid document type: ${data.pageTreeNode.document.__typename}`);
            }

            return {
                type: data.pageTreeNode.document.type ?? undefined,
            };
        }

        return {};
    }, [data]);

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "predefinedPage", data?.pageTreeNode?.document?.id);
            return resolveHasSaveConflict(data?.pageTreeNode?.document?.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const handleSubmit = async (formValues: FormValues) => {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }

        const output = {
            type: formValues.type ?? null,
        };

        const id = data?.pageTreeNode?.document?.id ?? uuid();

        await client.mutate<GQLSavePredefinedPageMutation, GQLSavePredefinedPageMutationVariables>({
            mutation: savePredefinedPageMutation,
            variables: { id, input: output, attachedPageTreeNodeId: pageTreeNodeId },
        });
    };

    if (error) {
        throw error;
    }

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    return (
        <FinalForm apiRef={formApiRef} onSubmit={handleSubmit} mode="edit" initialValues={initialValues}>
            {() => (
                <>
                    {saveConflict.dialogs}
                    <Toolbar scopeIndicator={<ContentScopeIndicator />}>
                        <ToolbarItem>
                            <IconButton onClick={stackApi?.goBack}>
                                <ArrowLeft />
                            </IconButton>
                        </ToolbarItem>
                        <PageName pageId={pageTreeNodeId} />
                        <FillSpace />
                        <ToolbarItem>
                            <FinalFormSaveButton hasConflict={saveConflict.hasConflict} />
                        </ToolbarItem>
                    </Toolbar>
                    <MainContent>
                        <SelectField
                            name="type"
                            label={<FormattedMessage id="predefinedPages.type.label" defaultMessage="Type" />}
                            options={[{ value: "news", label: predefinedPageLabels.news }]}
                            fullWidth
                        />
                    </MainContent>
                </>
            )}
        </FinalForm>
    );
};
