import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    AsyncSelectField,
    filterByFragment,
    FinalForm,
    type FinalFormSubmitEvent,
    Loading,
    OnChangeField,
    TextField,
    useFormApiRef,
    useStackSwitchApi,
} from "@dextinity/admin";
import { queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@dextinity/cms-admin";
import type { FormApi } from "final-form";
import isEqual from "lodash.isequal";
import { useMemo } from "react";
import { FormattedMessage } from "react-intl";

import type {
    GQLProductCategoriesSelectQuery,
    GQLProductCategoriesSelectQueryVariables,
    GQLProductsSelectQuery,
    GQLProductsSelectQueryVariables,
} from "./ProductHighlightForm.generated";
import {
    createProductHighlightMutation,
    productHighlightFormFragment,
    productHighlightQuery,
    updateProductHighlightMutation,
} from "./ProductHighlightForm.gql";
import type {
    GQLCreateProductHighlightMutation,
    GQLCreateProductHighlightMutationVariables,
    GQLProductHighlightFormHandmadeDetailsFragment,
    GQLProductHighlightQuery,
    GQLProductHighlightQueryVariables,
    GQLUpdateProductHighlightMutation,
    GQLUpdateProductHighlightMutationVariables,
} from "./ProductHighlightForm.gql.generated";

type FormValues = GQLProductHighlightFormHandmadeDetailsFragment & {
    productCategory?: { id: string; label: string };
};
interface FormProps {
    id?: string;
}
export function ProductHighlightForm({ id }: FormProps) {
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();
    const { data, error, loading, refetch } = useQuery<GQLProductHighlightQuery, GQLProductHighlightQueryVariables>(
        productHighlightQuery,
        id ? { variables: { id } } : { skip: true },
    );
    const initialValues = useMemo<Partial<FormValues>>(
        () =>
            data?.productHighlight
                ? {
                      ...filterByFragment<GQLProductHighlightFormHandmadeDetailsFragment>(productHighlightFormFragment, data.productHighlight),
                      productCategory: data.productHighlight.product.category,
                  }
                : {},
        [data],
    );
    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "productHighlight", id);
            return resolveHasSaveConflict(data?.productHighlight.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });
    const handleSubmit = async ({ productCategory, ...formValues }: FormValues, form: FormApi<FormValues>, event: FinalFormSubmitEvent) => {
        if (await saveConflict.checkForConflicts()) {
            throw new Error("Conflicts detected");
        }
        const output = {
            ...formValues,
            product: formValues.product?.id,
        };
        if (mode === "edit") {
            if (!id) {
                throw new Error();
            }
            const { ...updateInput } = output;
            await client.mutate<GQLUpdateProductHighlightMutation, GQLUpdateProductHighlightMutationVariables>({
                mutation: updateProductHighlightMutation,
                variables: { id, input: updateInput },
            });
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateProductHighlightMutation, GQLCreateProductHighlightMutationVariables>({
                mutation: createProductHighlightMutation,
                variables: { input: output },
            });
            if (!event.navigatingBack) {
                const id = mutationResponse?.createProductHighlight.id;
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
            subscription={{ values: true }}
        >
            {({ values, form }) => (
                <>
                    {saveConflict.dialogs}
                    <>
                        <TextField
                            required
                            variant="horizontal"
                            fullWidth
                            name="description"
                            label={<FormattedMessage id="productHighlight.description" defaultMessage="Description" />}
                        />
                        <AsyncSelectField
                            required
                            variant="horizontal"
                            fullWidth
                            name="productCategory"
                            label={<FormattedMessage id="productHighlight.productCategory" defaultMessage="Product Category" />}
                            loadOptions={async () => {
                                const { data } = await client.query<GQLProductCategoriesSelectQuery, GQLProductCategoriesSelectQueryVariables>({
                                    query: gql`
                                        query ProductCategoriesSelect {
                                            productCategories {
                                                nodes {
                                                    id
                                                    title
                                                }
                                            }
                                        }
                                    `,
                                });
                                return data.productCategories.nodes;
                            }}
                            getOptionLabel={(option) => option.title}
                        />
                        <AsyncSelectField
                            required
                            variant="horizontal"
                            fullWidth
                            name="product"
                            label={<FormattedMessage id="productHighlight.product" defaultMessage="Product" />}
                            loadOptions={async () => {
                                const { data } = await client.query<GQLProductsSelectQuery, GQLProductsSelectQueryVariables>({
                                    query: gql`
                                        query ProductsSelect($filter: ProductFilter) {
                                            products(filter: $filter) {
                                                nodes {
                                                    id
                                                    title
                                                }
                                            }
                                        }
                                    `,
                                    variables: { filter: { category: { equal: values.productCategory?.id } } },
                                });
                                return data.products.nodes;
                            }}
                            getOptionLabel={(option) => option.title}
                            disabled={!values?.productCategory}
                        />
                        <OnChangeField name="productCategory">
                            {(value, previousValue) => {
                                if (value.id !== previousValue.id) {
                                    form.change("product", undefined);
                                }
                            }}
                        </OnChangeField>
                    </>
                </>
            )}
        </FinalForm>
    );
}
