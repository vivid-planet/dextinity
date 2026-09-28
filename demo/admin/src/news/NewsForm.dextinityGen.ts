import { defineConfig } from "@dextinity/admin-generator";
import { DamImageBlock } from "@dextinity/cms-admin";
import type { GQLNews } from "@src/graphql.generated";

import { NewsContentBlock } from "./blocks/NewsContentBlock";

export default defineConfig<GQLNews>({
    type: "form",
    gqlType: "News",
    fragmentName: "NewsForm",
    fields: [
        {
            type: "text",
            name: "slug",
            label: "Slug",
            required: true,
        },
        {
            type: "text",
            name: "title",
            label: "Title",
            required: true,
        },
        {
            type: "date",
            name: "date",
            label: "Date",
            required: true,
        },
        {
            type: "staticSelect",
            name: "category",
            label: "Category",
            required: true,
            inputType: "radio",
            values: ["events", "company", "awards"],
        },
        {
            type: "block",
            name: "image",
            label: "Image",
            block: DamImageBlock,
        },
        {
            type: "block",
            name: "content",
            label: "Content",
            block: NewsContentBlock,
        },
    ],
});
