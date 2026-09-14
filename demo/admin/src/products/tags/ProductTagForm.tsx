import { useApolloClient, useQuery } from "@apollo/client";
import { filterByFragment, FinalForm, type FinalFormSubmitEvent, Loading, TextField, useFormApiRef, useStackSwitchApi } from "@dextinity/admin";
import { queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@dextinity/cms-admin";
import type { FormApi } from "final-form";
import isEqual from "lodash.isequal";
import { useMemo } from "react";
import { FormattedMessage } from "react-intl";

import { createProductTagMutation, productTagFormFragment, productTagQuery, updateProductTagMutation } from "./ProductTagForm.gql";
import type {
    GQLCreateProductTagMutation,
    GQLCreateProductTagMutationVariables,
    GQLProductTagFormFragment,
    GQLProductTagQuery,
    GQLProductTagQueryVariables,
    GQLUpdateProductTagMutation,
    GQLUpdateProductTagMutationVariables,
} from "./ProductTagForm.gql.generated";

type FormValues = GQLProductTagFormFragment;
interface FormProps {
    id?: string;
}
export function ProductTagForm({ id }: FormProps) {
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();
    const { data, error, loading, refetch } = useQuery<GQLProductTagQuery, GQLProductTagQueryVariables>(
        productTagQuery,
        id ? { variables: { id } } : { skip: true },
    );
    const initialValues = useMemo<Partial<FormValues>>(
        () =>
            data?.productTag
                ? {
                      ...filterByFragment<GQLProductTagFormFragment>(productTagFormFragment, data.productTag),
                  }
                : {},
        [data],
    );
    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "productTag", id);
            return resolveHasSaveConflict(data?.productTag.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });
    const handleSubmit = async (formValues: FormValues, form: FormApi<FormValues>, event: FinalFormSubmitEvent) => {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }
        const output = {
            ...formValues,
        };
        if (mode === "edit") {
            if (!id) {
                throw new Error();
            }
            const { ...updateInput } = output;
            await client.mutate<GQLUpdateProductTagMutation, GQLUpdateProductTagMutationVariables>({
                mutation: updateProductTagMutation,
                variables: { id, input: updateInput },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateProductTagMutation, GQLCreateProductTagMutationVariables>({
                mutation: createProductTagMutation,
                variables: { input: output },
            });
            if (!event.navigatingBack) {
                const id = mutationResponse?.createProductTag.id;
                if (id) {
                    setTimeout(() => {
                        stackSwitchApi.activatePage(`edit`, id);
                    });
                }
            }
        }
    };
    if (error) {
        throw error;
    }
    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }
    return (
        <FinalForm<FormValues>
            apiRef={formApiRef}
            onSubmit={handleSubmit}
            mode={mode}
            initialValues={initialValues}
            initialValuesEqual={isEqual} //required to compare block data correctly
            subscription={{}}
        >
            {() => (
                <>
                    {saveConflict.dialogs}
                    <TextField
                        required
                        variant="horizontal"
                        fullWidth
                        name="title"
                        label={<FormattedMessage id="productTag.title" defaultMessage="Title" />}
                    />
                </>
            )}
        </FinalForm>
    );
}
