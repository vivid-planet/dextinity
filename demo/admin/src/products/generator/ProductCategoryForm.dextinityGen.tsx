import { defineConfig } from "@dextinity/admin-generator";
import type { GQLProductCategory } from "@src/graphql.generated";

export default defineConfig<GQLProductCategory>({
    type: "form",
    gqlType: "ProductCategory",
    fragmentName: "ProductCategoryForm",
    fields: [
        { type: "text", name: "title" },
        { type: "text", name: "slug" },
        { type: "asyncSelect", name: "type", rootQuery: "productCategoryTypes" },
    ],
});
