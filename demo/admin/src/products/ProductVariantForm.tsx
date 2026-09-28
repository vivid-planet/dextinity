import { useApolloClient, useQuery } from "@apollo/client";
import {
    Field,
    filterByFragment,
    FinalForm,
    FinalFormInput,
    type FinalFormSubmitEvent,
    Loading,
    useFormApiRef,
    useStackSwitchApi,
} from "@dextinity/admin";
import {
    type BlockState,
    createFinalFormBlock,
    DamImageBlock,
    queryUpdatedAt,
    resolveHasSaveConflict,
    useFormSaveConflict,
} from "@dextinity/cms-admin";
import type { GQLProductVariantMutationErrorCode } from "@src/graphql.generated";
import { FORM_ERROR, type FormApi } from "final-form";
import isEqual from "lodash.isequal";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import {
    createProductVariantFormMutation,
    productVariantFormFragment,
    productVariantFormQuery,
    updateProductVariantFormMutation,
} from "./ProductVariantForm.gql";
import type {
    GQLCreateProductVariantMutation,
    GQLCreateProductVariantMutationVariables,
    GQLProductVariantFormFragment,
    GQLProductVariantFormQuery,
    GQLProductVariantFormQueryVariables,
    GQLUpdateProductVariantMutation,
    GQLUpdateProductVariantMutationVariables,
} from "./ProductVariantForm.gql.generated";

interface FormProps {
    id?: string;
    productId: string;
}

const rootBlocks = {
    image: DamImageBlock,
};

type FormValues = Omit<GQLProductVariantFormFragment, "image"> & {
    image: BlockState<typeof rootBlocks.image>;
};

const submissionErrorMessages: { [K in GQLProductVariantMutationErrorCode]: ReactNode } = {
    nameTooShort: (
        <FormattedMessage
            id="productVariant.form.error.nameTooShort"
            defaultMessage="Name must be at least 3 characters long when creating a product variant, except for foo"
        />
    ),
};

export function ProductVariantForm({ id, productId }: FormProps) {
    const client = useApolloClient();
    const mode = id ? "edit" : "add";
    const formApiRef = useFormApiRef<FormValues>();
    const stackSwitchApi = useStackSwitchApi();

    const { data, error, loading, refetch } = useQuery<GQLProductVariantFormQuery, GQLProductVariantFormQueryVariables>(
        productVariantFormQuery,
        id ? { variables: { id } } : { skip: true },
    );

    const initialValues: Partial<FormValues> = data?.productVariant
        ? {
              ...filterByFragment<GQLProductVariantFormFragment>(productVariantFormFragment, data.productVariant),
              image: rootBlocks.image.input2State(data.productVariant.image),
          }
        : {
              image: rootBlocks.image.defaultValues(),
          };

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "productVariant", id);
            return resolveHasSaveConflict(data?.productVariant.updatedAt, updatedAt);
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
            image: rootBlocks.image.state2Output(formValues.image),
        };
        if (mode === "edit") {
            if (!id) {
                throw new Error();
            }
            const { data: mutationResponse } = await client.mutate<GQLUpdateProductVariantMutation, GQLUpdateProductVariantMutationVariables>({
                mutation: updateProductVariantFormMutation,
                variables: { id, input: output },
            });
            if (mutationResponse?.updateProductVariant.errors.length) {
                return mutationResponse.updateProductVariant.errors.reduce(
                    (submissionErrors, error) => {
                        const errorMessage = submissionErrorMessages[error.code];
                        if (error.field) {
                            submissionErrors[error.field] = errorMessage;
                        } else {
                            submissionErrors[FORM_ERROR] = errorMessage;
                        }
                        return submissionErrors;
                    },
                    {} as Record<string, ReactNode>,
                );
            }
        } else {
            const { data: mutationResponse } = await client.mutate<GQLCreateProductVariantMutation, GQLCreateProductVariantMutationVariables>({
                mutation: createProductVariantFormMutation,
                variables: { product: productId, input: output },
            });
            if (mutationResponse?.createProductVariant.errors.length) {
                console.error(mutationResponse?.createProductVariant.errors);
                return mutationResponse.createProductVariant.errors.reduce(
                    (acc, error) => {
                        if (error.field) {
                            acc[error.field] = error.code;
                        }
                        return acc;
                    },
                    {} as Record<string, string>,
                );
            }
            if (!event.navigatingBack) {
                const id = mutationResponse?.createProductVariant.productVariant?.id;
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
            mode="edit"
            initialValues={initialValues}
            initialValuesEqual={isEqual} //required to compare block data correctly
            subscription={{}}
        >
            {() => (
                <>
                    {saveConflict.dialogs}
                    <Field
                        required
                        fullWidth
                        name="name"
                        component={FinalFormInput}
                        label={<FormattedMessage id="productVariant.name" defaultMessage="Name" />}
                    />
                    <Field name="image" isEqual={isEqual} fullWidth>
                        {createFinalFormBlock(rootBlocks.image)}
                    </Field>
                </>
            )}
        </FinalForm>
    );
}
