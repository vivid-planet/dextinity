import { defineConfig } from "@dextinity/admin-generator";
import type { GQLProductTag } from "@src/graphql.generated";

export default defineConfig<GQLProductTag>({
    type: "form",
    gqlType: "ProductTag",
    fragmentName: "ProductTagForm",
    fields: [{ type: "text", name: "title" }],
});
