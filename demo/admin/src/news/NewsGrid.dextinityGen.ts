import { defineConfig } from "@dextinity/admin-generator";
import { DamImageBlock } from "@dextinity/cms-admin";
import type { GQLNews } from "@src/graphql.generated";

import { NewsContentBlock } from "./blocks/NewsContentBlock";

export default defineConfig<GQLNews>({
    type: "grid",
    gqlType: "News",
    fragmentName: "NewsGrid",
    columns: [
        {
            type: "text",
            name: "title",
            headerName: "Title",
        },
        {
            type: "date",
            name: "date",
            headerName: "Date",
        },
        {
            type: "staticSelect",
            name: "category",
            headerName: "Category",
            values: ["events", "company", "awards"],
        },
        {
            type: "block",
            name: "image",
            headerName: "Image",
            block: DamImageBlock,
        },
        {
            type: "block",
            name: "content",
            headerName: "Content",
            block: NewsContentBlock,
        },
    ],
});
