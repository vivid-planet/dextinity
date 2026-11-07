import { useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { useDextinityConfig, useRouterLinkClick } from "@dextinity/cms-admin";
import { AssetThumbnail, Button, Chip, EmptyState, Icon, IconButton, KeyValueList, type KeyValueListItem, Panel, Skeleton } from "@dextinity/ui";
import { FormattedDate, useIntl } from "react-intl";

import { productDetailsQuery } from "./ProductDetailsPanel.gql";
import type { GQLProductsUiDetailsQuery, GQLProductsUiDetailsQueryVariables } from "./ProductDetailsPanel.gql.generated";
import styles from "./ProductDetailsPanel.module.css";
import { getProductImageUrl } from "./productImageUrl";
import { getProductTypeLabel } from "./productLabels";
import { ProductQuickEditForm, type ProductUnsavedChanges } from "./ProductQuickEditForm";

interface ProductDetailsPanelProps {
    productId: string;
    editUrl: string;
    onClose: () => void;
    onUnsavedChangesChange: (unsavedChanges: ProductUnsavedChanges | undefined) => void;
}

export function ProductDetailsPanel({ productId, editUrl, onClose, onUnsavedChangesChange }: ProductDetailsPanelProps) {
    const intl = useIntl();
    const { apiUrl } = useDextinityConfig();
    const navigateWithRouter = useRouterLinkClick();
    const { data, loading, error } = useQuery<GQLProductsUiDetailsQuery, GQLProductsUiDetailsQueryVariables>(productDetailsQuery, {
        variables: { id: productId },
        context: LocalErrorScopeApolloContext,
    });
    const product = data?.product;
    const closeButton = (
        <IconButton
            aria-label={intl.formatMessage({ id: "uiDemo.products.panel.close", defaultMessage: "Close details" })}
            variant="text"
            color="secondary"
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
            key: intl.formatMessage({ id: "uiDemo.products.type", defaultMessage: "Type" }),
            value: (
                <span className={styles.chips}>
                    <Chip size="small" variant="outlined">
                        {getProductTypeLabel(intl, product.type)}
                    </Chip>
                    {product.additionalTypes
                        .filter((additionalType) => additionalType !== product.type)
                        .map((additionalType) => (
                            <Chip key={additionalType} size="small" variant="outlined" color="secondary">
                                {getProductTypeLabel(intl, additionalType)}
                            </Chip>
                        ))}
                </span>
            ),
        },
        {
            key: intl.formatMessage({ id: "uiDemo.products.category", defaultMessage: "Category" }),
            value: product.category ? (
                <Chip size="small" variant="outlined" color="info">
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
                            <Chip key={tag.id} size="small" variant="outlined" color="secondary">
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
        ...(imageUrl == null
            ? [
                  {
                      key: intl.formatMessage({ id: "uiDemo.products.image", defaultMessage: "Image" }),
                      value: (
                          <span className={styles.muted}>
                              {intl.formatMessage({ id: "uiDemo.products.panel.noImage", defaultMessage: "No image chosen" })}
                          </span>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <Panel title={product.title} description={<span className={styles.mono}>{`/${product.slug}`}</span>} actions={closeButton}>
            <div className={styles.panelBody}>
                {imageUrl != null && <AssetThumbnail type="image" src={imageUrl} alt={product.title} ratio="4:3" />}
                <ProductQuickEditForm product={product} onUnsavedChangesChange={onUnsavedChangesChange} />
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
