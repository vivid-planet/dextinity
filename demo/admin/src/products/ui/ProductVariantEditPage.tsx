import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { type BlockState, createFinalFormBlock, DamImageBlock, queryUpdatedAt, resolveHasSaveConflict } from "@dextinity/cms-admin";
import { Panel } from "@dextinity/ui";
import { InputField } from "@dextinity/ui-react-final-form";
import type { GQLProductVariantMutationErrorCode } from "@src/graphql.generated";
import { EntityEditPage, EntityEditPageStatus } from "@src/products/common/EntityEditPage";
import { deepEqual } from "fast-equals";
import { FORM_ERROR } from "final-form";
import { useMemo } from "react";
import { Field } from "react-final-form";
import { type IntlShape, useIntl } from "react-intl";

import { createProductVariantMutation, productVariantQuery, updateProductVariantMutation } from "./ProductVariantEditPage.gql";
import type {
    GQLProductsUiVariantCreateMutation,
    GQLProductsUiVariantCreateMutationVariables,
    GQLProductsUiVariantQuery,
    GQLProductsUiVariantQueryVariables,
    GQLProductsUiVariantUpdateMutation,
    GQLProductsUiVariantUpdateMutationVariables,
} from "./ProductVariantEditPage.gql.generated";
import styles from "./ProductVariantEditPage.module.css";

interface ProductVariantFormValues {
    name: string;
    image: BlockState<typeof DamImageBlock>;
}

const FinalFormDamImageBlock = createFinalFormBlock(DamImageBlock);

function getMutationErrorMessage(intl: IntlShape, code: GQLProductVariantMutationErrorCode) {
    switch (code) {
        case "nameTooShort":
            return intl.formatMessage({
                id: "uiDemo.productVariants.error.nameTooShort",
                defaultMessage: "Enter at least 3 characters, except for “foo”",
            });
    }
}

function toSubmissionErrors(intl: IntlShape, errors: Array<{ code: GQLProductVariantMutationErrorCode; field: string | null }>) {
    return Object.fromEntries(errors.map((error) => [error.field ?? FORM_ERROR, getMutationErrorMessage(intl, error.code)]));
}

interface ProductVariantEditPageProps {
    productId: string;
    variantsUrl: string;
    pageUrl: string;
    getEditUrl: (id: string) => string;
    id?: string;
}

export function ProductVariantEditPage({ productId, variantsUrl, pageUrl, getEditUrl, id }: ProductVariantEditPageProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const { data, error, loading } = useQuery<GQLProductsUiVariantQuery, GQLProductsUiVariantQueryVariables>(productVariantQuery, {
        variables: { id: id ?? "" },
        skip: id === undefined,
        context: LocalErrorScopeApolloContext,
    });
    const variant = data?.productVariant;
    const initialValues = useMemo<ProductVariantFormValues>(
        () => ({
            name: variant?.name ?? "",
            image: variant ? DamImageBlock.input2State(variant.image) : DamImageBlock.defaultValues(),
        }),
        [variant],
    );
    const listLabel = intl.formatMessage({ id: "uiDemo.productVariants.title", defaultMessage: "Variants" });

    if (id !== undefined && !variant) {
        return <EntityEditPageStatus listUrl={variantsUrl} listLabel={listLabel} loadError={loading ? undefined : (error?.message ?? "")} />;
    }

    return (
        <EntityEditPage<ProductVariantFormValues>
            listUrl={variantsUrl}
            listLabel={variant ? `${variant.product.title} · ${listLabel}` : listLabel}
            pageUrl={pageUrl}
            title={variant?.name ?? intl.formatMessage({ id: "uiDemo.productVariants.newTitle", defaultMessage: "New variant" })}
            initialValues={initialValues}
            isNew={variant === undefined}
            savedAt={variant ? new Date(variant.updatedAt) : undefined}
            getEditUrl={getEditUrl}
            hasSaveConflict={
                variant
                    ? async () => resolveHasSaveConflict(variant.updatedAt, await queryUpdatedAt(client, "productVariant", variant.id))
                    : undefined
            }
            save={async (values) => {
                const input = { name: values.name.trim(), image: DamImageBlock.state2Output(values.image) };
                if (variant) {
                    const { data: updated } = await client.mutate<GQLProductsUiVariantUpdateMutation, GQLProductsUiVariantUpdateMutationVariables>({
                        mutation: updateProductVariantMutation,
                        variables: { id: variant.id, input },
                        refetchQueries: ["ProductsUiVariants"],
                        context: LocalErrorScopeApolloContext,
                    });
                    const errors = updated?.updateProductVariant.errors ?? [];
                    return errors.length > 0 ? { errors: toSubmissionErrors(intl, errors) } : {};
                }
                const { data: created } = await client.mutate<GQLProductsUiVariantCreateMutation, GQLProductsUiVariantCreateMutationVariables>({
                    mutation: createProductVariantMutation,
                    variables: { product: productId, input },
                    refetchQueries: ["ProductsUiVariants", "ProductsUiEdit"],
                    context: LocalErrorScopeApolloContext,
                });
                const errors = created?.createProductVariant.errors ?? [];
                if (errors.length > 0) {
                    return { errors: toSubmissionErrors(intl, errors) };
                }
                return { createdId: created?.createProductVariant.productVariant?.id };
            }}
        >
            <Panel>
                <div className={styles.fields}>
                    <InputField
                        name="name"
                        label={intl.formatMessage({ id: "uiDemo.productVariants.name", defaultMessage: "Name" })}
                        required
                        requiredMessage={intl.formatMessage({ id: "uiDemo.productsCommon.required", defaultMessage: "Required" })}
                    />
                    <div className={styles.block}>
                        <h3>{intl.formatMessage({ id: "uiDemo.productVariants.image", defaultMessage: "Image" })}</h3>
                        <Field name="image" component={FinalFormDamImageBlock} isEqual={deepEqual} />
                    </div>
                </div>
            </Panel>
        </EntityEditPage>
    );
}
