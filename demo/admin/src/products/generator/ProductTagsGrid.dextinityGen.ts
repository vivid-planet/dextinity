import { defineConfig } from "@dextinity/admin-generator";
import type { GQLProductTag } from "@src/graphql.generated";

export default defineConfig<GQLProductTag>({
    type: "grid",
    gqlType: "ProductTag",
    fragmentName: "ProductTagsGrid",
    queryParamsPrefix: "productTags",
    columns: [
        {
            type: "text",
            name: "title",
            headerName: "Title",
        },
    ],
});
