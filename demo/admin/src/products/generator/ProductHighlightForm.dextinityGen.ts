import { defineConfig } from "@dextinity/admin-generator";
import type { GQLProductHighlight } from "@src/graphql.generated";

export default defineConfig<GQLProductHighlight>({
    type: "form",
    gqlType: "ProductHighlight",
    fragmentName: "ProductHighlightFormDetails",
    fields: [
        { type: "text", name: "description" },
        {
            type: "asyncSelectFilter",
            name: "productCategoryType",
            rootQuery: "productCategoryTypes",
            loadValueQueryField: "product.category.type",
        },
        {
            type: "asyncSelectFilter",
            name: "productCategory",
            rootQuery: "productCategories",
            loadValueQueryField: "product.category",
            filter: {
                type: "field",
                formFieldName: "productCategoryType",
                rootQueryArg: "type",
            },
        },
        {
            type: "asyncSelect",
            name: "product",
            rootQuery: "products",
            filter: {
                type: "field",
                formFieldName: "productCategory",
                rootQueryArg: "category",
            },
        },
    ],
});
