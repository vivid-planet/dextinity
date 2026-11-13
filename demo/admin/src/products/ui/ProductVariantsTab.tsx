import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { useDataGridLabels, useDextinityConfig, useRouterLinkClick } from "@dextinity/cms-admin";
import { AssetThumbnail, Button, DataGrid, type DataGridColumn, EmptyState, Icon, IconButton, Panel, ToastViewport, useToasts } from "@dextinity/ui";
import { DeleteEntityDialog } from "@src/products/common/DeleteEntityDialog";
import { useMemo, useState } from "react";
import { FormattedDate, useIntl } from "react-intl";
import { useHistory } from "react-router";

import { getProductImageUrl } from "./productImageUrl";
import { deleteProductVariantMutation, productVariantsQuery, updateProductVariantPositionMutation } from "./ProductVariantsTab.gql";
import type {
    GQLProductsUiVariantDeleteMutation,
    GQLProductsUiVariantDeleteMutationVariables,
    GQLProductsUiVariantPositionMutation,
    GQLProductsUiVariantPositionMutationVariables,
    GQLProductsUiVariantRowFragment,
    GQLProductsUiVariantsQuery,
    GQLProductsUiVariantsQueryVariables,
} from "./ProductVariantsTab.gql.generated";
import styles from "./ProductVariantsTab.module.css";

interface ProductVariantsTabProps {
    productId: string;
    variantsUrl: string;
}

export function ProductVariantsTab({ productId, variantsUrl }: ProductVariantsTabProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const history = useHistory();
    const navigateWithRouter = useRouterLinkClick();
    const { apiUrl } = useDextinityConfig();
    const { labels: dataGridLabels } = useDataGridLabels();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const [reorderedIds, setReorderedIds] = useState<string[]>();
    const [variantToDelete, setVariantToDelete] = useState<GQLProductsUiVariantRowFragment>();
    const [deleting, setDeleting] = useState(false);

    const { data, loading, error } = useQuery<GQLProductsUiVariantsQuery, GQLProductsUiVariantsQueryVariables>(productVariantsQuery, {
        variables: { product: productId },
        fetchPolicy: "cache-and-network",
    });

    const rows = useMemo(() => {
        const nodes = data?.productVariants.nodes ?? [];
        if (!reorderedIds) {
            return nodes;
        }
        return reorderedIds
            .map((id) => nodes.find((node) => node.id === id))
            .filter((node): node is GQLProductsUiVariantRowFragment => node !== undefined);
    }, [data, reorderedIds]);

    if (error) {
        throw error;
    }

    const variantUrl = (id: string) => `${variantsUrl}/${id}`;

    const reorder = async (fromIndex: number, toIndex: number) => {
        const nextRows = [...rows];
        const [moved] = nextRows.splice(fromIndex, 1);
        nextRows.splice(toIndex, 0, moved);
        setReorderedIds(nextRows.map((row) => row.id));
        try {
            await client.mutate<GQLProductsUiVariantPositionMutation, GQLProductsUiVariantPositionMutationVariables>({
                mutation: updateProductVariantPositionMutation,
                variables: { id: moved.id, position: toIndex + 1 },
                refetchQueries: ["ProductsUiVariants"],
                awaitRefetchQueries: true,
                context: LocalErrorScopeApolloContext,
            });
        } catch (reorderError) {
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    { id: "uiDemo.productVariants.reorderFailed", defaultMessage: "Moving failed: {reason}" },
                    { reason: reorderError instanceof Error ? reorderError.message : String(reorderError) },
                ),
            });
        } finally {
            setReorderedIds(undefined);
        }
    };

    const deleteVariant = async () => {
        if (!variantToDelete) {
            return;
        }
        setDeleting(true);
        try {
            await client.mutate<GQLProductsUiVariantDeleteMutation, GQLProductsUiVariantDeleteMutationVariables>({
                mutation: deleteProductVariantMutation,
                variables: { id: variantToDelete.id },
                refetchQueries: ["ProductsUiVariants", "ProductsUiEdit"],
                awaitRefetchQueries: true,
                context: LocalErrorScopeApolloContext,
            });
            addToast({ message: intl.formatMessage({ id: "uiDemo.productVariants.deleted", defaultMessage: "Variant deleted" }) });
        } catch (deleteError) {
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    { id: "uiDemo.productsCommon.deleteFailed", defaultMessage: "Deleting failed: {reason}" },
                    { reason: deleteError instanceof Error ? deleteError.message : String(deleteError) },
                ),
            });
        } finally {
            setDeleting(false);
            setVariantToDelete(undefined);
        }
    };

    const columns: Array<DataGridColumn<GQLProductsUiVariantRowFragment>> = [
        {
            key: "image",
            header: intl.formatMessage({ id: "uiDemo.productVariants.image", defaultMessage: "Image" }),
            width: 72,
            render: (variant) => {
                const imageUrl = getProductImageUrl(variant.image, apiUrl, { width: 96, height: 96 });
                return imageUrl ? (
                    <AssetThumbnail className={styles.thumbnail} type="image" src={imageUrl} alt="" ratio="1:1" />
                ) : (
                    <span className={styles.noImage}>
                        <Icon name="image" />
                    </span>
                );
            },
        },
        {
            key: "name",
            header: intl.formatMessage({ id: "uiDemo.productVariants.name", defaultMessage: "Name" }),
            render: (variant) => <span className={styles.name}>{variant.name}</span>,
        },
        {
            key: "updatedAt",
            header: intl.formatMessage({ id: "uiDemo.productsCommon.updatedAt", defaultMessage: "Updated" }),
            width: 160,
            priority: "low",
            render: (variant) => (
                <span className={styles.muted}>
                    <FormattedDate value={variant.updatedAt} dateStyle="medium" />
                </span>
            ),
        },
    ];

    return (
        <>
            <Panel
                title={intl.formatMessage({ id: "uiDemo.productVariants.title", defaultMessage: "Variants" })}
                description={intl.formatMessage({
                    id: "uiDemo.productVariants.description",
                    defaultMessage: "Drag the variants into the order the site shows them in.",
                })}
                actions={
                    <Button size="small" startIcon={<Icon name="plus" />} href={`${variantsUrl}/add`} onClick={navigateWithRouter}>
                        {intl.formatMessage({ id: "uiDemo.productVariants.new", defaultMessage: "New variant" })}
                    </Button>
                }
            >
                <DataGrid
                    aria-label={intl.formatMessage({ id: "uiDemo.productVariants.title", defaultMessage: "Variants" })}
                    columns={columns}
                    rows={rows}
                    getRowId={(variant) => variant.id}
                    loading={loading && !data}
                    onRowReorder={reorderedIds ? undefined : (fromIndex, toIndex) => void reorder(fromIndex, toIndex)}
                    onRowClick={(variant) => history.push(variantUrl(variant.id))}
                    rowActions={(variant) => (
                        <IconButton
                            type="button"
                            aria-label={intl.formatMessage(
                                { id: "uiDemo.productVariants.deleteVariant", defaultMessage: "Delete {name}" },
                                { name: variant.name },
                            )}
                            variant="text"
                            color="secondary"
                            size="small"
                            onClick={() => setVariantToDelete(variant)}
                        >
                            <Icon name="trash" />
                        </IconButton>
                    )}
                    labels={dataGridLabels}
                    emptyState={
                        <EmptyState
                            icon={<Icon name="file" />}
                            title={intl.formatMessage({ id: "uiDemo.productVariants.empty", defaultMessage: "No variants yet" })}
                        />
                    }
                />
            </Panel>
            <DeleteEntityDialog
                entryName={variantToDelete?.name}
                deleting={deleting}
                onCancel={() => setVariantToDelete(undefined)}
                onConfirm={() => void deleteVariant()}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "uiDemo.productVariants.notifications", defaultMessage: "Variant notifications" }) }}
            />
        </>
    );
}
