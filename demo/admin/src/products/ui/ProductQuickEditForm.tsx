import { useApolloClient, useMutation } from "@apollo/client";
import { LocalErrorScopeApolloContext, RouterPrompt } from "@dextinity/admin";
import { Banner, Button, SaveState, type SelectOption, useKeyboardShortcut } from "@dextinity/ui";
import { InputField, SelectField, SwitchField, TextareaField, useFormSaveState, useHasUnsavedChanges } from "@dextinity/ui-react-hook-form";
import type { GQLProductStatus, GQLProductUpdateInput } from "@src/graphql.generated";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { getProductStatusLabel, productStatuses } from "./productLabels";
import { productsWithSlugQuery, updateProductQuickEditMutation } from "./ProductQuickEditForm.gql";
import type {
    GQLProductsUiQuickEditFragment,
    GQLProductsUiQuickEditMutation,
    GQLProductsUiQuickEditMutationVariables,
    GQLProductsUiQuickEditProductsWithSlugQuery,
    GQLProductsUiQuickEditProductsWithSlugQueryVariables,
} from "./ProductQuickEditForm.gql.generated";
import styles from "./ProductQuickEditForm.module.css";

export { productQuickEditFragment } from "./ProductQuickEditForm.gql";

export interface ProductQuickEditValues {
    title: string;
    slug: string;
    description: string;
    price: string;
    status: GQLProductStatus | null;
    inStock: boolean;
}

export interface ProductUnsavedChanges {
    save: () => Promise<boolean>;
    discard: () => void;
}

const slugPattern = /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/;
const wholeEuroPattern = /^\d+$/;

function toFormValues(product: GQLProductsUiQuickEditFragment): ProductQuickEditValues {
    return {
        title: product.title,
        slug: product.slug,
        description: product.description ?? "",
        price: product.price != null ? String(product.price) : "",
        status: product.status,
        inStock: product.inStock,
    };
}

function toUpdateInput(values: ProductQuickEditValues) {
    const description = values.description.trim();
    const price = values.price.trim();
    return {
        title: values.title.trim(),
        slug: values.slug.trim(),
        description: description === "" ? null : description,
        price: price === "" ? null : Number(price),
        status: values.status,
        inStock: values.inStock,
    } satisfies GQLProductUpdateInput;
}

interface ProductQuickEditFormProps {
    product: GQLProductsUiQuickEditFragment;
    onUnsavedChangesChange: (unsavedChanges: ProductUnsavedChanges | undefined) => void;
}

export function ProductQuickEditForm({ product, onUnsavedChangesChange }: ProductQuickEditFormProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const {
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ProductQuickEditValues>({ defaultValues: toFormValues(product), mode: "onTouched" });
    const saveState = useFormSaveState({ control });
    const hasUnsavedChanges = useHasUnsavedChanges({ control });
    const [updateProduct] = useMutation<GQLProductsUiQuickEditMutation, GQLProductsUiQuickEditMutationVariables>(updateProductQuickEditMutation);

    const unsavedChanges = useMemo<ProductUnsavedChanges>(
        () => ({
            save: async () => {
                let isSaved = false;
                await handleSubmit(async (values) => {
                    const input = toUpdateInput(values);
                    try {
                        if (input.slug !== product.slug) {
                            const { data: productsWithSlug } = await client.query<
                                GQLProductsUiQuickEditProductsWithSlugQuery,
                                GQLProductsUiQuickEditProductsWithSlugQueryVariables
                            >({
                                query: productsWithSlugQuery,
                                variables: { slug: input.slug },
                                fetchPolicy: "network-only",
                                context: LocalErrorScopeApolloContext,
                            });
                            if (productsWithSlug.products.nodes.some(({ id }) => id !== product.id)) {
                                setError(
                                    "slug",
                                    {
                                        type: "server",
                                        message: intl.formatMessage({
                                            id: "uiDemo.products.quickEdit.slugTaken",
                                            defaultMessage: "Another product already uses this slug",
                                        }),
                                    },
                                    { shouldFocus: true },
                                );
                                return;
                            }
                        }
                        const { data } = await updateProduct({
                            variables: { id: product.id, input },
                            refetchQueries: ["ProductsUiList"],
                            context: LocalErrorScopeApolloContext,
                        });
                        reset(data ? toFormValues(data.updateProduct) : values);
                        isSaved = true;
                    } catch (error) {
                        setError("root.server", {
                            type: "server",
                            message: intl.formatMessage(
                                { id: "uiDemo.products.quickEdit.saveFailed", defaultMessage: "Saving failed: {reason}" },
                                { reason: error instanceof Error ? error.message : String(error) },
                            ),
                        });
                    }
                })();
                return isSaved;
            },
            discard: () => reset(),
        }),
        [handleSubmit, client, updateProduct, product.id, product.slug, reset, setError, intl],
    );

    useEffect(() => {
        onUnsavedChangesChange(hasUnsavedChanges ? unsavedChanges : undefined);
    }, [hasUnsavedChanges, unsavedChanges, onUnsavedChangesChange]);

    useEffect(() => () => onUnsavedChangesChange(undefined), [onUnsavedChangesChange]);

    useEffect(() => {
        if (!hasUnsavedChanges) {
            return;
        }
        const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warnBeforeUnload);
        return () => window.removeEventListener("beforeunload", warnBeforeUnload);
    }, [hasUnsavedChanges]);

    useKeyboardShortcut("mod+s", () => void unsavedChanges.save(), { allowInEditable: true });

    const requiredMessage = intl.formatMessage({ id: "uiDemo.products.quickEdit.required", defaultMessage: "Required" });
    const statusOptions: SelectOption[] = productStatuses.map((status) => ({ value: status, label: getProductStatusLabel(intl, status) }));

    return (
        <RouterPrompt
            message={() =>
                hasUnsavedChanges
                    ? intl.formatMessage({
                          id: "uiDemo.products.quickEdit.unsavedChangesPrompt",
                          defaultMessage: "Do you want to save your changes?",
                      })
                    : true
            }
            saveAction={unsavedChanges.save}
            resetAction={unsavedChanges.discard}
        >
            <form
                className={styles.form}
                onSubmit={(event) => {
                    event.preventDefault();
                    void unsavedChanges.save();
                }}
                noValidate
                aria-label={intl.formatMessage({ id: "uiDemo.products.quickEdit.label", defaultMessage: "Quick edit" })}
            >
                {errors.root?.server && <Banner tone="error">{errors.root.server.message}</Banner>}
                <InputField
                    control={control}
                    name="title"
                    label={intl.formatMessage({ id: "uiDemo.products.title", defaultMessage: "Title" })}
                    required
                    requiredMessage={requiredMessage}
                    rules={{
                        validate: (title) =>
                            title.trim() !== "" ||
                            intl.formatMessage({ id: "uiDemo.products.quickEdit.titleBlank", defaultMessage: "Enter more than spaces" }),
                    }}
                />
                <InputField
                    control={control}
                    name="slug"
                    label={intl.formatMessage({ id: "uiDemo.products.slug", defaultMessage: "Slug" })}
                    prefix="/"
                    required
                    requiredMessage={requiredMessage}
                    rules={{
                        pattern: {
                            value: slugPattern,
                            message: intl.formatMessage({
                                id: "uiDemo.products.quickEdit.slugInvalid",
                                defaultMessage: "Start with a letter or digit, then use letters, digits, “-” and “_” only",
                            }),
                        },
                    }}
                />
                <TextareaField
                    control={control}
                    name="description"
                    label={intl.formatMessage({ id: "uiDemo.products.description", defaultMessage: "Description" })}
                    rows={3}
                />
                <div className={styles.priceAndStatus}>
                    <InputField
                        control={control}
                        name="price"
                        label={intl.formatMessage({ id: "uiDemo.products.price", defaultMessage: "Price" })}
                        inputMode="decimal"
                        suffix="€"
                        rules={{
                            validate: (price) =>
                                price.trim() === "" ||
                                wholeEuroPattern.test(price.trim()) ||
                                intl.formatMessage({
                                    id: "uiDemo.products.quickEdit.priceInvalid",
                                    defaultMessage: "Enter whole euros, e.g. 19",
                                }),
                        }}
                    />
                    <SelectField
                        control={control}
                        name="status"
                        label={intl.formatMessage({ id: "uiDemo.products.status", defaultMessage: "Status" })}
                        options={statusOptions}
                        required
                        requiredMessage={requiredMessage}
                    />
                </div>
                <SwitchField control={control} name="inStock">
                    {intl.formatMessage({ id: "uiDemo.products.inStock", defaultMessage: "In stock" })}
                </SwitchField>
                <div className={styles.footer}>
                    <SaveState
                        {...saveState}
                        locale={intl.locale}
                        labels={{
                            saved: intl.formatMessage({ id: "uiDemo.products.quickEdit.saved", defaultMessage: "All changes saved" }),
                            dirty: intl.formatMessage({ id: "uiDemo.products.quickEdit.dirty", defaultMessage: "Unsaved changes" }),
                            saving: intl.formatMessage({ id: "uiDemo.products.quickEdit.saving", defaultMessage: "Saving …" }),
                            error: intl.formatMessage({ id: "uiDemo.products.quickEdit.error", defaultMessage: "Not saved" }),
                            savedAt: intl.formatMessage({ id: "uiDemo.products.quickEdit.savedAt", defaultMessage: "Saved '{time}'" }),
                        }}
                    />
                    <span className={styles.actions}>
                        <Button size="small" variant="text" color="secondary" disabled={!hasUnsavedChanges || isSubmitting} onClick={() => reset()}>
                            {intl.formatMessage({ id: "uiDemo.products.quickEdit.reset", defaultMessage: "Reset" })}
                        </Button>
                        <Button type="submit" size="small" disabled={!hasUnsavedChanges} loading={isSubmitting}>
                            {intl.formatMessage({ id: "uiDemo.products.quickEdit.save", defaultMessage: "Save" })}
                        </Button>
                    </span>
                </div>
            </form>
        </RouterPrompt>
    );
}
