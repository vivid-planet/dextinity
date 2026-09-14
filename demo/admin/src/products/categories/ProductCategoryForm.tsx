import { useApolloClient, useQuery } from "@apollo/client";
import { filterByFragment, FinalForm, type FinalFormSubmitEvent, Loading, TextField, useFormApiRef, useStackSwitchApi } from "@dextinity/admin";
import { queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@dextinity/cms-admin";
import type { FormApi } from "final-form";
import isEqual from "lodash.isequal";
import { useMemo } from "react";
import { FormattedMessage } from "react-intl";

import {
    createProductCategoryMutation,
    productCategoryFormFragment,
    productCategoryQuery,
    updateProductCategoryMutation,
} from "./ProductCategoryForm.gql";
import type {
    GQLCreateProductCategoryMutation,
    GQLCreateProductCategoryMutationVariables,
    GQLProductCategoryFormHandmadeFragment,
    GQLProductCategoryQuery,
    GQLProductCategoryQueryVariables,
    GQLUpdateProductCategoryMutation,
    GQLUpdateProductCategoryMutationVariables,
} from "./ProductCategoryForm.gql.generated";

type FormValues = GQLProductCategoryFormHandmadeFragment;
interface FormProps {
    id?: string;
}
export function ProductCategoryForm({ id }: FormProps) {
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();
    const { data, error, loading, refetch } = useQuery<GQLProductCategoryQuery, GQLProductCategoryQueryVariables>(
        productCategoryQuery,
        id ? { variables: { id } } : { skip: true },
    );
    const initialValues = useMemo<Partial<FormValues>>(
        () =>
            data?.productCategory
                ? {
                      ...filterByFragment<GQLProductCategoryFormHandmadeFragment>(productCategoryFormFragment, data.productCategory),
                  }
                : {},
        [data],
    );
    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "productCategory", id);
            return resolveHasSaveConflict(data?.productCategory.updatedAt, updatedAt);
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
            await client.mutate<GQLUpdateProductCategoryMutation, GQLUpdateProductCategoryMutationVariables>({
                mutation: updateProductCategoryMutation,
                variables: { id, input: updateInput },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateProductCategoryMutation, GQLCreateProductCategoryMutationVariables>({
                mutation: createProductCategoryMutation,
                variables: { input: output },
            });
            if (!event.navigatingBack) {
                const id = mutationResponse?.createProductCategory.id;
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
                    <>
                        <TextField
                            required
                            variant="horizontal"
                            fullWidth
                            name="title"
                            label={<FormattedMessage id="productCategory.title" defaultMessage="Title" />}
                        />

                        <TextField
                            required
                            variant="horizontal"
                            fullWidth
                            name="slug"
                            label={<FormattedMessage id="productCategory.slug" defaultMessage="Slug" />}
                        />
                    </>
                </>
            )}
        </FinalForm>
    );
}
