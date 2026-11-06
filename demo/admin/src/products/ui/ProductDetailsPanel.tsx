import { useMutation, useQuery } from "@apollo/client";
import { useDextinityConfig } from "@dextinity/cms-admin";
import {
    AssetThumbnail,
    Button,
    Chip,
    EmptyState,
    Icon,
    IconButton,
    KeyValueList,
    type KeyValueListItem,
    Panel,
    Skeleton,
    StatusIndicator,
    Switch,
} from "@dextinity/ui";
import type { GQLProductStatus } from "@src/graphql.generated";
import { useRouterLinkClick } from "@src/news/ui/useRouterLinkClick";
import { FormattedDate, FormattedNumber, useIntl } from "react-intl";

import { productDetailsQuery, updateProductInStockMutation } from "./ProductDetailsPanel.gql";
import type {
    GQLProductsUiDetailsQuery,
    GQLProductsUiDetailsQueryVariables,
    GQLProductsUiUpdateInStockMutation,
    GQLProductsUiUpdateInStockMutationVariables,
} from "./ProductDetailsPanel.gql.generated";
import styles from "./ProductDetailsPanel.module.css";
import { getProductImageUrl } from "./productImageUrl";
import { getProductStatusIndicator, getProductStatusLabel, getProductTypeLabel } from "./productLabels";

type ProductDetails = GQLProductsUiDetailsQuery["product"];

interface ProductDetailsPanelProps {
    productId: string;
    editUrl: string;
    onClose: () => void;
    onChangeStatus: (product: Pick<ProductDetails, "id" | "title" | "status">, status: GQLProductStatus) => void;
    onError: (message: string) => void;
}

export function ProductDetailsPanel({ productId, editUrl, onClose, onChangeStatus, onError }: ProductDetailsPanelProps) {
    const intl = useIntl();
    const { apiUrl } = useDextinityConfig();
    const navigateWithRouter = useRouterLinkClick();
    const { data, loading, error } = useQuery<GQLProductsUiDetailsQuery, GQLProductsUiDetailsQueryVariables>(productDetailsQuery, {
        variables: { id: productId },
    });
    const [updateInStock, { loading: updatingInStock }] = useMutation<
        GQLProductsUiUpdateInStockMutation,
        GQLProductsUiUpdateInStockMutationVariables
    >(updateProductInStockMutation);

    const product = data?.product;
    const closeButton = (
        <IconButton
            aria-label={intl.formatMessage({ id: "uiDemo.products.panel.close", defaultMessage: "Close details" })}
            variant="text"
            size="small"
            onClick={onClose}
        >
            <Icon name="close" />
        </IconButton>
    );

    if (product == null) {
        return (
            <Panel title={intl.formatMessage({ id: "uiDemo.products.panel.title", defaultMessage: "Product" })} actions={closeButton}>
                {loading ? (
                    <div className={styles.panelBody} aria-busy>
                        <Skeleton variant="block" />
                        <Skeleton variant="text" count={6} />
                    </div>
                ) : (
                    <EmptyState
                        icon={<Icon name="warning" />}
                        title={intl.formatMessage({ id: "uiDemo.products.panel.loadFailed", defaultMessage: "The product couldn't be loaded" })}
                        description={error?.message}
                    />
                )}
            </Panel>
        );
    }

    const imageUrl = getProductImageUrl(product.image, apiUrl, { width: 640, height: 480 });
    const noValue = <span className={styles.muted}>–</span>;

    const items: KeyValueListItem[] = [
        {
            key: intl.formatMessage({ id: "uiDemo.products.status", defaultMessage: "Status" }),
            value: (
                <StatusIndicator status={getProductStatusIndicator(product.status)}>{getProductStatusLabel(intl, product.status)}</StatusIndicator>
            ),
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.price", defaultMessage: "Price" }),
            value: product.price != null ? <FormattedNumber value={product.price} style="currency" currency="EUR" /> : noValue,
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.type", defaultMessage: "Type" }),
            value: (
                <span className={styles.chips}>
                    <Chip size="small" color="primary">
                        {getProductTypeLabel(intl, product.type)}
                    </Chip>
                    {product.additionalTypes
                        .filter((additionalType) => additionalType !== product.type)
                        .map((additionalType) => (
                            <Chip key={additionalType} size="small" variant="outlined">
                                {getProductTypeLabel(intl, additionalType)}
                            </Chip>
                        ))}
                </span>
            ),
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.category", defaultMessage: "Category" }),
            value: product.category ? (
                <Chip size="small" color="info">
                    {product.category.title}
                </Chip>
            ) : (
                noValue
            ),
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.tags", defaultMessage: "Tags" }),
            value:
                product.tags.length > 0 ? (
                    <span className={styles.chips}>
                        {product.tags.map((tag) => (
                            <Chip key={tag.id} size="small" variant="outlined">
                                {tag.title}
                            </Chip>
                        ))}
                    </span>
                ) : (
                    noValue
                ),
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.manufacturer", defaultMessage: "Manufacturer" }),
            value: product.manufacturer?.name ?? noValue,
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.variants", defaultMessage: "Variants" }),
            value: intl.formatNumber(product.variants.length),
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.articleNumbers", defaultMessage: "Article numbers" }),
            value: product.articleNumbers.length > 0 ? <span className={styles.mono}>{product.articleNumbers.join(", ")}</span> : noValue,
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.availableSince", defaultMessage: "Available since" }),
            value: product.availableSince ? <FormattedDate value={product.availableSince} dateStyle="medium" /> : noValue,
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.soldCount", defaultMessage: "Sold" }),
            value: product.soldCount != null ? intl.formatNumber(product.soldCount) : noValue,
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.views", defaultMessage: "Views" }),
            value: product.statistics != null ? intl.formatNumber(product.statistics.views) : noValue,
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.updatedAt", defaultMessage: "Updated" }),
            value: <FormattedDate value={product.updatedAt} dateStyle="medium" timeStyle="short" />,
        },
    ];

    const toggleInStock = async (inStock: boolean) => {
        try {
            await updateInStock({
                variables: { id: product.id, inStock },
                refetchQueries: ["ProductsUiList"],
            });
        } catch {
            onError(intl.formatMessage({ id: "uiDemo.products.inStockFailed", defaultMessage: "Changing the stock failed · nothing was changed" }));
        }
    };

    return (
        <Panel title={product.title} description={<span className={styles.mono}>{`/${product.slug}`}</span>} actions={closeButton}>
            <div className={styles.panelBody}>
                <AssetThumbnail
                    type="image"
                    src={imageUrl}
                    alt={product.title}
                    ratio="4:3"
                    meta={
                        imageUrl == null ? intl.formatMessage({ id: "uiDemo.products.panel.noImage", defaultMessage: "No image chosen" }) : undefined
                    }
                />
                {product.description && <p className={styles.description}>{product.description}</p>}
                <div
                    className={styles.quickActions}
                    role="group"
                    aria-label={intl.formatMessage({ id: "uiDemo.products.panel.quickActions", defaultMessage: "Quick actions" })}
                >
                    {product.status === "Published" && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<Icon name="eye-off" />}
                            onClick={() => onChangeStatus(product, "Unpublished")}
                        >
                            {intl.formatMessage({ id: "uiDemo.products.unpublish", defaultMessage: "Unpublish" })}
                        </Button>
                    )}
                    {product.status === "Unpublished" && (
                        <Button size="small" startIcon={<Icon name="eye" />} onClick={() => onChangeStatus(product, "Published")}>
                            {intl.formatMessage({ id: "uiDemo.products.publish", defaultMessage: "Publish" })}
                        </Button>
                    )}
                    {product.status === "Deleted" ? (
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<Icon name="refresh" />}
                            onClick={() => onChangeStatus(product, "Unpublished")}
                        >
                            {intl.formatMessage({ id: "uiDemo.products.restore", defaultMessage: "Restore" })}
                        </Button>
                    ) : (
                        <Button
                            size="small"
                            variant="text"
                            color="secondary"
                            startIcon={<Icon name="archive" />}
                            onClick={() => onChangeStatus(product, "Deleted")}
                        >
                            {intl.formatMessage({ id: "uiDemo.products.markDeleted", defaultMessage: "Mark as deleted" })}
                        </Button>
                    )}
                </div>
                <Switch checked={product.inStock} disabled={updatingInStock} onChange={(inStock) => void toggleInStock(inStock)}>
                    {intl.formatMessage({ id: "uiDemo.products.inStock", defaultMessage: "In stock" })}
                </Switch>
                <KeyValueList items={items} />
                <div className={styles.panelFooter}>
                    <Button startIcon={<Icon name="edit" />} href={editUrl} onClick={navigateWithRouter}>
                        {intl.formatMessage({ id: "uiDemo.products.panel.edit", defaultMessage: "Edit all fields" })}
                    </Button>
                </div>
            </div>
        </Panel>
    );
}
