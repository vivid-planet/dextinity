import { createEntityMethods, DamImageBlock, type EntityInterface } from "@dextinity/cms-admin";
import { NewsContentBlock } from "@src/news/blocks/NewsContentBlock";
import { FormattedMessage } from "react-intl";

export const NewsEntity: EntityInterface = {
    displayName: <FormattedMessage id="news.displayName" defaultMessage="News" />,
    ...createEntityMethods({
        rootQueryName: "news",
        rootBlocks: { content: { block: NewsContentBlock, path: "/form" }, image: DamImageBlock },
        basePath: ({ id }) => `/structured-content/news/${id}/edit`,
    }),
};
