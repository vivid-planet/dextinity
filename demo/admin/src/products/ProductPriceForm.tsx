import { useApolloClient, useQuery } from "@apollo/client";
import { Field, filterByFragment, FinalForm, FinalFormInput, type FinalFormSubmitEvent, useFormApiRef } from "@dextinity/admin";
import { queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict } from "@dextinity/cms-admin";
import { CircularProgress } from "@mui/material";
import type { FormApi } from "final-form";
import isEqual from "lodash.isequal";
import { FormattedMessage } from "react-intl";

import { productPriceFormFragment, productPriceFormQuery, updateProductPriceFormMutation } from "./ProductPriceForm.gql";
import type {
    GQLProductPriceFormFragment,
    GQLProductPriceFormQuery,
    GQLProductPriceFormQueryVariables,
    GQLProductPriceFormUpdateProductMutation,
    GQLProductPriceFormUpdateProductMutationVariables,
} from "./ProductPriceForm.gql.generated";

interface FormProps {
    id: string;
}

type FormValues = Omit<GQLProductPriceFormFragment, "price"> & {
    price?: string;
};

export function ProductPriceForm({ id }: FormProps) {
    const client = useApolloClient();
    const formApiRef = useFormApiRef<FormValues>();

    const { data, error, loading, refetch } = useQuery<GQLProductPriceFormQuery, GQLProductPriceFormQueryVariables>(productPriceFormQuery, {
        variables: { id },
    });

    const initialValues: Partial<FormValues> = data?.product
        ? {
              ...filterByFragment<GQLProductPriceFormFragment>(productPriceFormFragment, data.product),
              price: data.product.price ? String(data.product.price) : undefined,
          }
        : {};

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "product", id);
            return resolveHasSaveConflict(data?.product.updatedAt, updatedAt);
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
            price: formValues.price ? parseFloat(formValues.price) : null,
        };
        await client.mutate<GQLProductPriceFormUpdateProductMutation, GQLProductPriceFormUpdateProductMutationVariables>({
            mutation: updateProductPriceFormMutation,
            variables: { id, input: output },
        });
    };

    if (error) {
        return <FormattedMessage id="common.error" defaultMessage="An error has occurred. Please try again at later" />;
    }

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <FinalForm<FormValues>
            apiRef={formApiRef}
            onSubmit={handleSubmit}
            mode="edit"
            initialValues={initialValues}
            initialValuesEqual={isEqual} //required to compare block data correctly
            onAfterSubmit={(values, form) => {
                //don't go back automatically TODO remove this automatismn
            }}
            subscription={{}}
        >
            {() => (
                <>
                    {saveConflict.dialogs}
                    <Field
                        fullWidth
                        name="price"
                        component={FinalFormInput}
                        inputProps={{ type: "number" }}
                        label={<FormattedMessage id="product.price" defaultMessage="Price" />}
                    />
                </>
            )}
        </FinalForm>
    );
}
