import { GridCellContent } from "@dextinity/admin";
import { defineConfig } from "@dextinity/admin-generator";
import type { GQLProduct } from "@src/graphql.generated";
import type { ReactNode } from "react";
import { FormattedMessage, FormattedNumber } from "react-intl";

import { ProductsGridPreviewAction } from "../ProductsGridPreviewAction";
import { ManufacturerFilterOperators } from "./ManufacturerFilter";
import { ProductTitle } from "./ProductTitle";

const typeValues = [
    { value: "Cap", label: { primaryText: "Great cap", icon: { name: "Education" as const, color: "primary" as const } } },
    "Shirt",
    "Tie",
];

export default defineConfig<GQLProduct>({
    type: "grid",
    gqlType: "Product",
    fragmentName: "ProductsGridFuture", // configurable as it must be unique across project
    filterProp: true,
    toolbarActionProp: true,
    rowActionProp: true,
    excelExport: true,
    queryParamsPrefix: "products",
    initialSort: [
        { field: "inStock", sort: "desc" },
        { field: "price", sort: "asc" },
    ],
    initialFilter: {
        items: [{ field: "type", operator: "is", value: "shirt" }],
    },
    crudContextMenu: {
        deleteText: "Extinguish",
    },
    columns: [
        {
            type: "virtual",
            name: "overview",
            queryFields: ["category.title"],
            headerName: <FormattedMessage id="product.overview.headerName" defaultMessage="Over-view" />,
            minWidth: 200,
            renderCell: ({ row }) => {
                const typeLabels: Record<string, ReactNode> = {
                    Cap: <FormattedMessage id="product.overview.secondaryText.type.cap" defaultMessage="Cap" />,
                    Shirt: <FormattedMessage id="product.overview.secondaryText.type.shirt" defaultMessage="Shirt" />,
                    Tie: <FormattedMessage id="product.overview.secondaryText.type.tie" defaultMessage="Tie" />,
                };
                const inStockLabels: Record<string, ReactNode> = {
                    true: <FormattedMessage id="product.overview.secondaryText.inStock" defaultMessage="In stock" />,
                    false: <FormattedMessage id="product.overview.secondaryText.outOfStock" defaultMessage="Out of stock" />,
                };
                return (
                    <GridCellContent
                        primaryText={row.title ?? "-"}
                        secondaryText={
                            <FormattedMessage
                                id="product.overview.secondaryText"
                                defaultMessage="{price} • {type} • {category} • {inStock}"
                                values={{
                                    price:
                                        typeof row.price === "undefined" || row.price === null ? (
                                            <FormattedMessage id="product.overview.secondaryText.price.empty" defaultMessage="No price" />
                                        ) : (
                                            <FormattedNumber
                                                value={row.price}
                                                minimumFractionDigits={2}
                                                maximumFractionDigits={2}
                                                style="currency"
                                                currency="EUR"
                                            />
                                        ),
                                    type:
                                        row.type == null ? (
                                            <FormattedMessage id="product.overview.secondaryText.type.empty" defaultMessage="No type" />
                                        ) : (
                                            (typeLabels[`${row.type}`] ?? row.type)
                                        ),
                                    category: row.category?.title ?? (
                                        <FormattedMessage id="product.overview.secondaryText.category.empty" defaultMessage="No category" />
                                    ),
                                    inStock: row.inStock == null ? "-" : (inStockLabels[`${row.inStock}`] ?? row.inStock),
                                }}
                            />
                        }
                    />
                );
            },
            visible: "down('md')",
            sortBy: ["title", "price", "type", "category", "inStock"],
            disableExport: true,
        },
        {
            type: "text",
            renderCell: ({ value, row }) => <ProductTitle title={value} />,
            name: "title",
            headerName: "Title",
            minWidth: 200,
            visible: "down('md')",
        },
        { type: "text", name: "description", headerName: "Description" },
        // TODO: Allow setting options for `intl.formatNumber` through `valueFormatter` (type "number")
        {
            type: "number",
            name: "price",
            currency: "EUR",
            headerName: "Price",
            maxWidth: 150,
            headerInfoTooltip: "Price in EUR",
            visible: "up('md')",
        },
        {
            type: "boolean",
            name: "inStock",
            headerName: "In stock",
            flex: 1,
            minWidth: 80,
            visible: "up('md')",
        },
        // TODO: Implement showing actual label in `valueFormatter` (type "staticSelect")
        { type: "staticSelect", name: "type", maxWidth: 150, values: typeValues, visible: "up('md')" },
        // TODO: Allow setting options for `intl.formatDate` through `valueFormatter` (type "date")
        { type: "date", name: "availableSince", width: 140 },
        // TODO: Allow setting options for `intl.formatDate` through `valueFormatter` (type "dateTime")
        { type: "dateTime", name: "createdAt", width: 170, visible: false },
        {
            type: "text",
            name: "manufacturer.name",
            headerName: "Manufacturer",
            fieldName: "manufacturer",
            filterOperators: ManufacturerFilterOperators,
        },
        {
            type: "manyToMany",
            name: "tags",
            disableExport: true,
            headerName: "Tags",
            labelField: "title",
        },
        {
            type: "oneToMany",
            name: "variants",
            disableExport: true,
            headerName: "Variants",
            labelField: "name",
        },
        {
            type: "actions",
            queryFields: ["slug"],
            component: ProductsGridPreviewAction,
        },
    ],
});
