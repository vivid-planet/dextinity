import { useApolloClient, useQuery } from "@apollo/client";
import { filterByFragment, FinalForm, type FinalFormSubmitEvent, Loading, TextField, useFormApiRef, useStackSwitchApi } from "@comet/admin";
import { queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
import { type FormApi } from "final-form";
import isEqual from "lodash.isequal";
import { useMemo } from "react";
import { FormattedMessage } from "react-intl";

import {
    createProductHighlightMutation,
    productHighlightFormFragment,
    productHighlightQuery,
    updateProductHighlightMutation,
} from "./ProductHighlight2Form.gql";
import {
    type GQLCreateProductHighlightMutation,
    type GQLCreateProductHighlightMutationVariables,
    type GQLProductHighlight2FormHandmadeDetailsFragment,
    type GQLProductHighlightQuery,
    type GQLProductHighlightQueryVariables,
    type GQLUpdateProductHighlightMutation,
    type GQLUpdateProductHighlightMutationVariables,
} from "./ProductHighlight2Form.gql.generated";
import { SelectProductField } from "./SelectProductField";

type FormValues = GQLProductHighlight2FormHandmadeDetailsFragment & {
    productCategory?: { id: string; label: string };
};
interface FormProps {
    id?: string;
}
export function ProductHighlight2Form({ id }: FormProps) {
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
                      ...filterByFragment<GQLProductHighlight2FormHandmadeDetailsFragment>(productHighlightFormFragment, data.productHighlight),
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
    const handleSubmit = async (formValues: FormValues, form: FormApi<FormValues>, event: FinalFormSubmitEvent) => {
        if (await saveConflict.checkForConflicts()) throw new Error("Conflicts detected");
        const output = {
            ...formValues,
            product: formValues.product?.id,
        };
        if (mode === "edit") {
            if (!id) throw new Error();
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
    if (error) throw error;
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
                        <SelectProductField
                            name="product"
                            variant="horizontal"
                            required
                            label={<FormattedMessage id="productHighlight.product" defaultMessage="Product" />}
                        />
                    </>
                </>
            )}
        </FinalForm>
    );
}
