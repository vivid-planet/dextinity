import { defineConfig } from "@dextinity/admin-generator";
import type { GQLProductCategory } from "@src/graphql.generated";

export default defineConfig<GQLProductCategory>({
    type: "grid",
    gqlType: "ProductCategory",
    fragmentName: "ProductCategoriesGrid",
    queryParamsPrefix: "productCategories",
    rowReordering: {
        enabled: true,
    },
    crudContextMenu: {
        deleteType: "remove",
    },
    columns: [
        {
            type: "text",
            name: "title",
            headerName: "Title",
        },
        {
            type: "text",
            name: "slug",
            headerName: "Slug",
        },
        {
            type: "text",
            name: "type.title",
            headerName: "Type",
        },
        {
            type: "number",
            name: "position",
            headerName: "Position",
        },
    ],
});
